# filters/models.py

from django.db import models
from games.models import Category


class FilterCategory(models.Model):
    category = models.OneToOneField(
        Category,
        on_delete=models.CASCADE,
        related_name="filter_config",
    )

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Filter - {self.category.title}"
