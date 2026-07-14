# games/serializers.py
from rest_framework import serializers
from .models import Game, GameCategory, GameCategoryItem, Platform

 

# ── PlatformSerializer ─────────────────────────────────────────────────────
class PlatformSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Platform
        fields = ["id", "title", "logo", "created_at", "updated_at"]


        
from .models import Category,Item



# ── CategorySerializer ─────────────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    limit        = serializers.CharField(allow_null=True)

    class Meta:
        model  = Category
        fields = ["id", "title", "limit", "created_at", "updated_at"]


    

    def validate_limit(self, value):
        if value in (None, "", "unlimited"):
            return None

        try:
            value = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                "Limit must be a number or 'unlimited'"
            )

        if value <= 0:
            raise serializers.ValidationError(
                "Limit must be greater than zero"
            )

        return value

# ── ItemSerializer ─────────────────────────────────────────────────────────
class ItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    category_id  = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )
    category = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = Item
        fields = [
            "id", "title", "icon",
            "category", "category_id",
            "created_at", "updated_at",
        ]





# ── ItemSimpleSerializer ───────────────────────────────────────────────────
class ItemSimpleSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Item
        fields = ["id", "title", "icon"]




# ── GameCategorySerializer ─────────────────────────────────────────────────
class GameCategorySerializer(serializers.ModelSerializer):
    id   = serializers.IntegerField(read_only=True)
    category_title = serializers.CharField(source="category.title", read_only=True)
    items          = serializers.SerializerMethodField()

    class Meta:
        model  = GameCategory
        fields = ["id", "category", "category_title", "item_limit", "items"]



    def get_items(self, obj):
        items = Item.objects.filter(game_items__game_category=obj)
        return ItemSimpleSerializer(items, many=True).data


# ── GameSerializer ─────────────────────────────────────────────────────────
class GameSerializer(serializers.ModelSerializer):
    id     = serializers.IntegerField(read_only=True)
    platforms        = PlatformSerializer(many=True, read_only=True)
    is_cross_platform = serializers.SerializerMethodField()
    categories       = GameCategorySerializer(source="game_categories", many=True, read_only=True)

    class Meta:
        model  = Game
        fields = [
            "id", "title", "cover",
            "platforms", "is_cross_platform",
            "categories", "created_at",
        ]



    def get_is_cross_platform(self, obj) -> bool:
        return obj.platforms.count() > 1

class GameCreateUpdateSerializer(serializers.ModelSerializer):
    # accept raw integer ids
    platform_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    categories   = serializers.ListField(write_only=True)

    class Meta:
        model  = Game
        fields = ["title", "cover", "platform_ids", "categories"]

    # ── internal helpers ──────────────────────────────────────────────────
    @staticmethod
    def _dec(token) -> int:
        """Convert token to integer id; raises ValidationError on failure."""
        try:
            return int(token)
        except (TypeError, ValueError):
            raise serializers.ValidationError(f"Invalid identifier: {token}")

    def _resolve_platform_ids(self, raw_ids: list) -> list[int]:
        return [self._dec(t) for t in raw_ids]

    def _resolve_categories(self, raw_cats: list) -> list[dict]:
        resolved = []
        for cat in raw_cats:
            resolved.append({
                "category":   self._dec(cat["category"]),
                "item_limit": cat.get("item_limit", -1),
                "items":      [self._dec(i) for i in cat.get("items", [])],
            })
        return resolved

    # ── create (only the top changes shown) ───────────────────────────────
    def create(self, validated_data):
        platform_ids    = self._resolve_platform_ids(validated_data.pop("platform_ids"))
        categories_data = self._resolve_categories(validated_data.pop("categories"))

        game = Game.objects.create(
            title=validated_data["title"],
            cover=validated_data["cover"],
        )
        game.platforms.set(platform_ids)

        for cat_data in categories_data:
            item_limit = cat_data.get("item_limit", -1)
            item_ids   = cat_data.get("items", [])

            if item_limit != -1 and len(item_ids) > item_limit:
                raise serializers.ValidationError("Item count exceeds category limit")

            game_category = GameCategory.objects.create(
                game=game,
                category_id=cat_data["category"],
                item_limit=item_limit,
            )
            for item_id in item_ids:
                GameCategoryItem.objects.create(game_category=game_category, item_id=item_id)

        return game

    # ── update (only the top changes shown) ───────────────────────────────
    def update(self, instance, validated_data):
        platform_ids    = validated_data.pop("platform_ids", None)
        categories_data = validated_data.pop("categories", None)

        instance.title = validated_data.get("title", instance.title)
        if validated_data.get("cover"):
            instance.cover = validated_data["cover"]
        instance.save()

        if platform_ids is not None:
            instance.platforms.set(self._resolve_platform_ids(platform_ids))

        if categories_data is not None:
            instance.game_categories.all().delete()
            for cat_data in self._resolve_categories(categories_data):
                game_category = GameCategory.objects.create(
                    game=instance,
                    category_id=cat_data["category"],
                    item_limit=cat_data.get("item_limit", -1),
                )
                for item_id in cat_data.get("items", []):
                    GameCategoryItem.objects.create(game_category=game_category, item_id=item_id)

        return instance