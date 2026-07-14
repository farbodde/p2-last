# filter/serializers.py

from rest_framework import serializers
from games.models import Game, Platform, Category, Item
from auth_app.models import User


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ("id", "title", "cover")


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = ("id", "title", "logo")


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ("id", "title", "icon")


class CategorySerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True)

    class Meta:
        model = Category
        fields = ("id", "title", "items")



class LFGFilterSerializer(serializers.Serializer):
    game = serializers.IntegerField(required=False)
    platform = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    mic_enabled = serializers.BooleanField(required=False)
    online_only = serializers.BooleanField(required=False)
    cross_play = serializers.BooleanField(required=False)
    has_stat_images = serializers.BooleanField(required=False)
    categories = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    country = serializers.CharField(required=False)
    languages = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    age_min = serializers.IntegerField(required=False)
    age_max = serializers.IntegerField(required=False)




from rest_framework import serializers
from .models import FilterCategory


class FilterItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    icon = serializers.ImageField()


class FilterCategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="category.id")
    title = serializers.CharField(source="category.title")
    items = serializers.SerializerMethodField()

    class Meta:
        model = FilterCategory
        fields = ("id", "title", "items")

    def get_items(self, obj):
        items = obj.category.items.all()
        return [
            {
                "id": item.id,
                "title": item.title,
                "icon": item.icon.url if item.icon else None
            }
            for item in items
        ]



class FilterCategoryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterCategory
        fields = ("id", "category", "is_active", "order")


