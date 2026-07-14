# notification/admin.py
from django.contrib import admin

from .models import Device, Notification


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "device_type", "token_preview", "created_at")
    list_filter = ("device_type", "created_at")
    search_fields = ("user__email", "user__username", "token")
    autocomplete_fields = ("user",)
    date_hierarchy = "created_at"

    @admin.display(description="Token")
    def token_preview(self, obj):
        return (obj.token[:20] + "...") if len(obj.token) > 20 else obj.token


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("title", "body", "user__email", "user__username")
    autocomplete_fields = ("user",)
    date_hierarchy = "created_at"
    list_editable = ("is_read",)
    actions = ["mark_as_read", "mark_as_unread"]

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected notifications as unread")
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)