# posts/admin.py
from django.contrib import admin

from .models import LFG, LFGStatImage, LFGSelectedItem, LFGBookmark


class LFGStatImageInline(admin.TabularInline):
    model = LFGStatImage
    extra = 0


class LFGSelectedItemInline(admin.TabularInline):
    model = LFGSelectedItem
    extra = 0
    autocomplete_fields = ("game_category_item",)


@admin.register(LFG)
class LFGAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "owner",
        "game",
        "platform",
        "game_mode",
        "allow_cross_play",
        "mic_enabled",
        "can_bump_display",
        "created_at",
        "updated_at",
    )
    list_filter = ("platform", "allow_cross_play", "mic_enabled", "created_at")
    search_fields = ("owner__email", "owner__username", "game__title", "description")
    autocomplete_fields = ("owner", "game", "platform", "game_mode")
    date_hierarchy = "created_at"
    readonly_fields = ("bumped_at",)
    inlines = [LFGStatImageInline, LFGSelectedItemInline]

    @admin.display(boolean=True, description="Can bump")
    def can_bump_display(self, obj):
        return obj.can_bump()


@admin.register(LFGStatImage)
class LFGStatImageAdmin(admin.ModelAdmin):
    list_display = ("id", "lfg", "image")
    search_fields = ("lfg__owner__email", "lfg__game__title")
    autocomplete_fields = ("lfg",)


@admin.register(LFGSelectedItem)
class LFGSelectedItemAdmin(admin.ModelAdmin):
    list_display = ("id", "lfg", "game_category_item")
    search_fields = ("lfg__owner__email", "lfg__game__title")
    autocomplete_fields = ("lfg", "game_category_item")


@admin.register(LFGBookmark)
class LFGBookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "lfg", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "user__username", "lfg__game__title")
    autocomplete_fields = ("user", "lfg")
    date_hierarchy = "created_at"