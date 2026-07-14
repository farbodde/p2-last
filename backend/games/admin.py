# games/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Platform,
    Category,
    Item,
    Game,
    GameCategory,
    GameCategoryItem,
    GameMode,
)


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "logo_preview", "created_at", "updated_at")
    search_fields = ("title",)
    date_hierarchy = "created_at"

    @admin.display(description="Logo")
    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="height:40px;" />', obj.logo.url)
        return "-"


class ItemInline(admin.TabularInline):
    model = Item
    extra = 0
    fields = ("title", "icon")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "limit", "is_unlimited_display", "created_at", "updated_at")
    search_fields = ("title",)
    date_hierarchy = "created_at"
    inlines = [ItemInline]

    @admin.display(boolean=True, description="Unlimited")
    def is_unlimited_display(self, obj):
        return obj.is_unlimited()


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "icon_preview", "created_at", "updated_at")
    list_filter = ("category",)
    search_fields = ("title", "category__title")
    autocomplete_fields = ("category",)
    date_hierarchy = "created_at"

    @admin.display(description="Icon")
    def icon_preview(self, obj):
        if obj.icon:
            return format_html('<img src="{}" style="height:30px;" />', obj.icon.url)
        return "-"


class GameCategoryInline(admin.TabularInline):
    model = GameCategory
    extra = 0
    autocomplete_fields = ("category",)


class GameModeInline(admin.TabularInline):
    model = GameMode
    extra = 0


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "cover_preview", "is_cross_platform_display", "created_at")
    search_fields = ("title",)
    filter_horizontal = ("platforms",)
    date_hierarchy = "created_at"
    inlines = [GameCategoryInline, GameModeInline]

    @admin.display(description="Cover")
    def cover_preview(self, obj):
        if obj.cover:
            return format_html('<img src="{}" style="height:40px;" />', obj.cover.url)
        return "-"

    @admin.display(boolean=True, description="Cross-platform")
    def is_cross_platform_display(self, obj):
        return obj.is_cross_platform


class GameCategoryItemInline(admin.TabularInline):
    model = GameCategoryItem
    extra = 0
    autocomplete_fields = ("item",)


@admin.register(GameCategory)
class GameCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "game", "category", "item_limit", "is_unlimited_display")
    list_filter = ("category",)
    search_fields = ("game__title", "category__title")
    autocomplete_fields = ("game", "category")
    inlines = [GameCategoryItemInline]

    @admin.display(boolean=True, description="Unlimited")
    def is_unlimited_display(self, obj):
        return obj.is_unlimited()


@admin.register(GameCategoryItem)
class GameCategoryItemAdmin(admin.ModelAdmin):
    list_display = ("id", "game_category", "item")
    search_fields = ("game_category__game__title", "item__title")
    autocomplete_fields = ("game_category", "item")


@admin.register(GameMode)
class GameModeAdmin(admin.ModelAdmin):
    list_display = ("id", "game", "title")
    list_filter = ("game",)
    search_fields = ("title", "game__title")
    autocomplete_fields = ("game",)