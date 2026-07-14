# feed_back/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import Feedback, FeedbackScreenshot


class FeedbackScreenshotInline(admin.TabularInline):
    model = FeedbackScreenshot
    extra = 0
    fields = ("image", "image_preview")
    readonly_fields = ("image_preview",)

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;" />', obj.image.url)
        return "-"


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "user", "type", "description_preview", "created_at")
    list_filter = ("type", "created_at")
    search_fields = ("email", "description", "user__email", "user__username")
    autocomplete_fields = ("user",)
    date_hierarchy = "created_at"
    inlines = [FeedbackScreenshotInline]

    @admin.display(description="Description")
    def description_preview(self, obj):
        return (obj.description[:60] + "...") if len(obj.description) > 60 else obj.description


@admin.register(FeedbackScreenshot)
class FeedbackScreenshotAdmin(admin.ModelAdmin):
    list_display = ("id", "feedback", "image_preview")
    search_fields = ("feedback__email",)
    autocomplete_fields = ("feedback",)

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;" />', obj.image.url)
        return "-"