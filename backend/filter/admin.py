# filters/admin.py
from django.contrib import admin

from .models import FilterCategory


@admin.register(FilterCategory)
class FilterCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "is_active", "order", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("category__title",)
    autocomplete_fields = ("category",)
    ordering = ("order",)
    list_editable = ("is_active", "order")