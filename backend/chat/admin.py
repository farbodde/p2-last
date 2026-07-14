# chat/admin.py
from django.contrib import admin

from .models import Chat, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ("sender", "type", "content", "created_at", "deleted")
    readonly_fields = ("created_at",)
    ordering = ("created_at",)


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "session_id", "title", "user1", "user2", "created_at")
    list_filter = ("created_at",)
    search_fields = (
        "session_id",
        "title",
        "user1__email",
        "user1__username",
        "user2__email",
        "user2__username",
    )
    autocomplete_fields = ("user1", "user2")
    date_hierarchy = "created_at"
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "sender", "type", "content_preview", "created_at", "deleted")
    list_filter = ("type", "deleted", "created_at")
    search_fields = (
        "content",
        "sender__email",
        "sender__username",
        "chat__session_id",
    )
    autocomplete_fields = ("chat", "sender")
    date_hierarchy = "created_at"

    @admin.display(description="Content")
    def content_preview(self, obj):
        return (obj.content[:60] + "...") if len(obj.content) > 60 else obj.content