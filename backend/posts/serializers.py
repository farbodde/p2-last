# posts/serializers.py
from rest_framework import serializers
from .models import LFG, LFGStatImage, LFGSelectedItem, LFGBookmark
from games.models import GameCategoryItem
from django.utils import timezone
from datetime import timedelta


class LFGDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username")
    game_title = serializers.CharField(source="game.title")
    platform_title = serializers.CharField(source="platform.title")
    game_mode_title = serializers.CharField(
        source="game_mode.title",
        allow_null=True,
    )

    stat_images = serializers.SerializerMethodField()
    selected_items = serializers.SerializerMethodField()

    can_bump = serializers.SerializerMethodField()
    remaining_bump_minutes = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="pk", read_only=True)

    class Meta:
        model = LFG
        fields = (
            "id",
            "owner_username",
            "game_title",
            "platform_title",
            "allow_cross_play",
            "mic_enabled",
            "game_mode_title",
            "description",
            "stat_images",
            "selected_items",
            "created_at",
            "can_bump",
            "remaining_bump_minutes",
        )

    

    def get_can_bump(self, obj):
        return obj.can_bump()

    def get_remaining_bump_minutes(self, obj):
        if obj.bumped_at is None:
            return 0

        remaining = timedelta(hours=3) - (timezone.now() - obj.bumped_at)
        if remaining.total_seconds() <= 0:
            return 0
        
        return int(remaining.total_seconds() // 60)

    def get_stat_images(self, obj):
        return [img.image.url for img in obj.stat_images.all()]

    def get_selected_items(self, obj):
        return [
            {
                "id": si.game_category_item.id,
                "title": si.game_category_item.item.title,
                "category": si.game_category_item.game_category.category.title,
            }
            for si in obj.selected_items.select_related(
                "game_category_item__item",
                "game_category_item__game_category__category",
            )
        ]

class LFGListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username")
    owner_language = serializers.CharField(source="owner.language", allow_null=True)
    owner_country = serializers.CharField(source="owner.location", allow_null=True)
    owner_age = serializers.IntegerField(source="owner.age", allow_null=True)
    owner_gender = serializers.CharField(source="owner.gender", allow_null=True)
    owner_image = serializers.SerializerMethodField()

    game_title = serializers.CharField(source="game.title")
    platform_title = serializers.CharField(source="platform.title")
    mic = serializers.BooleanField(source="mic_enabled")
    has_stat_images = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    created_ago = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="pk", read_only=True)
    description = serializers.CharField()
    stat_images = serializers.SerializerMethodField()
    class Meta:
        model = LFG
        fields = (
            "id",

            "owner_username",
            "owner_language",
            "owner_country",
            "owner_age",
            "owner_gender",
            "owner_image",

            "game_title",
            "platform_title",
            "mic",
            "allow_cross_play",
            "has_stat_images",
            "categories",
            "description",
            "stat_images",
            "created_ago",
        )

    

    def get_owner_image(self, obj):
        if obj.owner.profile_image:
            return obj.owner.profile_image.url
        return None

    def get_stat_images(self, obj):
        request = self.context.get("request")

        images = []
        for image in obj.stat_images.all():
            if request:
                images.append(request.build_absolute_uri(image.image.url))
            else:
                images.append(image.image.url)

        return images

    def get_has_stat_images(self, obj):
        return obj.stat_images.exists()

    def get_categories(self, obj):
        categories = set(
            obj.selected_items.values_list(
                "game_category_item__game_category__category__title",
                flat=True,
            )
        )
        return list(categories)

    def get_created_ago(self, obj):
        from .utils import time_ago
        return time_ago(obj.created_at)


class LFGBookmarkSerializer(serializers.ModelSerializer):
    lfg = LFGListSerializer(read_only=True)

    class Meta:
        model = LFGBookmark
        fields = [
            "id",
            "lfg",
            "created_at",
        ]



from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers

from .models import (
    LFG,
    LFGStatImage,
    LFGSelectedItem,
)
from games.models import GameCategoryItem


class LFGCreateSerializer(serializers.ModelSerializer):
    stat_images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        max_length=3,
    )

    selected_items = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
    )

    class Meta:
        model = LFG
        fields = (
            "game",
            "platform",  # <-- اصلاح شد
            "allow_cross_play",
            "mic_enabled",
            "game_mode",
            "description",
            "stat_images",
            "selected_items",
        )

    def validate(self, attrs):
        game = attrs["game"]
        platform = attrs["platform"]

        if not game.platforms.filter(
            id=platform.id
        ).exists():
            raise serializers.ValidationError(
                {
                    "platform":
                    "This platform is not available for the selected game."
                }
            )

        if attrs.get("allow_cross_play") and not game.is_cross_platform:
            raise serializers.ValidationError(
                {
                    "allow_cross_play":
                    "This game does not support cross-play."
                }
            )

        return attrs
    

    def _save_selected_items(self, lfg, item_ids):

        items = GameCategoryItem.objects.filter(
            id__in=item_ids,
            game_category__game=lfg.game,
        ).select_related(
            "game_category",
            "game_category__category",
        )

        # اطمینان از اینکه همه آیتم‌ها وجود دارند
        # و متعلق به همین بازی هستند
        if items.count() != len(set(item_ids)):
            raise serializers.ValidationError(
                {
                    "selected_items":
                    "One or more selected items are invalid "
                    "or do not belong to the selected game."
                }
            )

        category_counter = {}

        for gci in items:
            category_id = gci.game_category_id

            category_counter.setdefault(
                category_id,
                []
            ).append(gci)

        for category_id, items_in_category in category_counter.items():

            game_category = items_in_category[0].game_category

            if not game_category.is_unlimited():

                if len(items_in_category) > game_category.item_limit:

                    raise serializers.ValidationError(
                        {
                            "selected_items":
                            f"Category "
                            f"'{game_category.category.title}' "
                            f"allows only "
                            f"{game_category.item_limit} items."
                        }
                    )

        selected_objects = [
            LFGSelectedItem(
                lfg=lfg,
                game_category_item=gci,
            )
            for gci in items
        ]

        LFGSelectedItem.objects.bulk_create(
            selected_objects
        )


    from django.db import transaction
    
    @transaction.atomic
    def update(self, instance, validated_data):
        stat_images = validated_data.pop("stat_images", None)
        selected_items_ids = validated_data.pop("selected_items", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if stat_images is not None:
            instance.stat_images.all().delete()

            for img in stat_images[:3]:
                LFGStatImage.objects.create(
                    lfg=instance,
                    image=img,
                )

        if selected_items_ids is not None:
            instance.selected_items.all().delete()

            self._save_selected_items(
                lfg=instance,
                item_ids=selected_items_ids,
            )

        return instance
# posts/serializers.py

# ... (کدهای قبلی شما) ...

class LFGUpdateSerializer(serializers.ModelSerializer):
    stat_images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        max_length=3,
    )

    selected_items = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False, # در آپدیت ممکن است کاربر این فیلد را نفرستد
    )

    class Meta:
        model = LFG
        fields = (
            "game",
            "platform",
            "allow_cross_play",
            "mic_enabled",
            "game_mode",
            "description",
            "stat_images",
            "selected_items",
        )

    def validate(self, attrs):
        # اگر game یا platform تغییر کرده باشند، ولیدیشن انجام می‌شود
        # اگر تغییر نکرده باشند، attrs شامل آنها نیست مگر اینکه explicit ارسال شوند
        game = attrs.get("game", self.instance.game if self.instance else None)
        platform = attrs.get("platform", self.instance.platform if self.instance else None)

        if game and platform:
            if not game.platforms.filter(id=platform.id).exists():
                raise serializers.ValidationError(
                    {"platform": "This platform is not available for the selected game."}
                )

            if attrs.get("allow_cross_play") is not None:
                 if attrs["allow_cross_play"] and not game.is_cross_platform:
                    raise serializers.ValidationError(
                        {"allow_cross_play": "This game does not support cross-play."}
                    )
        
        return attrs

    def _save_selected_items(self, lfg, item_ids):
        items = GameCategoryItem.objects.filter(
            id__in=item_ids,
            game_category__game=lfg.game,
        ).select_related(
            "game_category",
            "game_category__category",
        )

        if items.count() != len(set(item_ids)):
            raise serializers.ValidationError(
                {"selected_items": "One or more selected items are invalid or do not belong to the selected game."}
            )

        category_counter = {}
        for gci in items:
            category_id = gci.game_category_id
            category_counter.setdefault(category_id, []).append(gci)

        for category_id, items_in_category in category_counter.items():
            game_category = items_in_category[0].game_category
            if not game_category.is_unlimited():
                if len(items_in_category) > game_category.item_limit:
                    raise serializers.ValidationError(
                        {"selected_items": f"Category '{game_category.category.title}' allows only {game_category.item_limit} items."}
                    )

        # حذف موارد قبلی و ایجاد موارد جدید
        lfg.selected_items.all().delete()
        
        selected_objects = [
            LFGSelectedItem(lfg=lfg, game_category_item=gci)
            for gci in items
        ]
        LFGSelectedItem.objects.bulk_create(selected_objects)
    from django.db import transaction

    @transaction.atomic
    def update(self, instance, validated_data):
        stat_images = validated_data.pop("stat_images", None)
        selected_items_ids = validated_data.pop("selected_items", None)

        # آپدیت فیلدهای ساده
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # مدیریت تصاویر
        if stat_images is not None:
            instance.stat_images.all().delete()
            for img in stat_images[:3]:
                LFGStatImage.objects.create(lfg=instance, image=img)

        # مدیریت آیتم‌های انتخاب شده
        if selected_items_ids is not None:
            self._save_selected_items(lfg=instance, item_ids=selected_items_ids)

        return instance