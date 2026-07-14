# auth_app/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import (
    User,
    DefaultProfileImage,
    DefaultCoverImage,
    UserReport,
    UserReportImage,
    UserBlock,
    AccountID,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "email",
        "username",
        "display_name",
        "auth_provider",
        "gender",
        "is_online_display",
        "is_active",
        "is_staff",
        "date_of_birth",
    )
    list_filter = ("auth_provider", "gender", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username", "display_name")
    ordering = ("-id",)
    readonly_fields = ("last_activity", "username_updated_at", "is_online_display")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "username",
                    "username_updated_at",
                    "display_name",
                    "profile_image",
                    "cover_image",
                    "about_me",
                    "gender",
                    "date_of_birth",
                    "location",
                    "languages",
                    "auth_provider",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Activity", {"fields": ("last_activity", "is_online_display")}),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "display_name"),
            },
        ),
    )

    filter_horizontal = ("groups", "user_permissions")

    @admin.display(boolean=True, description="Online")
    def is_online_display(self, obj):
        return obj.is_online


@admin.register(DefaultProfileImage)
class DefaultProfileImageAdmin(admin.ModelAdmin):
    list_display = ("id", "image_preview")

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;" />', obj.image.url)
        return "-"


@admin.register(DefaultCoverImage)
class DefaultCoverImageAdmin(admin.ModelAdmin):
    list_display = ("id", "image_preview")

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;" />', obj.image.url)
        return "-"


class UserReportImageInline(admin.TabularInline):
    model = UserReportImage
    extra = 0


@admin.register(UserReport)
class UserReportAdmin(admin.ModelAdmin):
    list_display = ("id", "reporter", "reported_user", "created_at", "message_preview")
    list_filter = ("created_at",)
    search_fields = (
        "reporter__email",
        "reporter__username",
        "reported_user__email",
        "reported_user__username",
        "message",
    )
    autocomplete_fields = ("reporter", "reported_user")
    date_hierarchy = "created_at"
    inlines = [UserReportImageInline]

    @admin.display(description="Message")
    def message_preview(self, obj):
        return (obj.message[:50] + "...") if len(obj.message) > 50 else obj.message


@admin.register(UserBlock)
class UserBlockAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "blocked_user", "created_at")
    list_filter = ("created_at",)
    search_fields = (
        "user__email",
        "user__username",
        "blocked_user__email",
        "blocked_user__username",
    )
    autocomplete_fields = ("user", "blocked_user")
    date_hierarchy = "created_at"


@admin.register(AccountID)
class AccountIDAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "platform", "username", "created_at")
    list_filter = ("platform", "created_at")
    search_fields = ("owner__email", "owner__username", "username")
    autocomplete_fields = ("owner", "platform")
    date_hierarchy = "created_at"