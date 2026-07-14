#games/models.py
from django.db import models

# Create your models here.
class Platform(models.Model):
    title = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="platforms/logos/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    

class Category(models.Model):
    title = models.CharField(max_length=255)
    limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="NULL means unlimited",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_unlimited(self):
        return self.limit is None

    def __str__(self):
        return self.title
    


class Item(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="items",
    )
    title = models.CharField(max_length=255)
    icon = models.ImageField(upload_to="items/icons/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.category.title})"


class Game(models.Model):
    title = models.CharField(max_length=255)
    cover = models.ImageField(upload_to="games/covers/")
    # platform = models.ForeignKey(
    #     Platform,
    #     on_delete=models.CASCADE,
    #     related_name="games",
    # )
    platforms = models.ManyToManyField(
    Platform,
    related_name="games",
)
    
    
    @property
    def is_cross_platform(self):
        return self.platforms.count() > 1

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title




class GameCategory(models.Model):
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name="game_categories",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="game_categories",
    )
    item_limit = models.IntegerField(
        default=-1,
        help_text="-1 means unlimited",
    )

    class Meta:
        unique_together = ("game", "category")

    def is_unlimited(self):
        return self.item_limit == -1
    

class GameCategoryItem(models.Model):
    game_category = models.ForeignKey(
        GameCategory,
        on_delete=models.CASCADE,
        related_name="items",
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="game_items",
    )

    class Meta:
        unique_together = ("game_category", "item")


from django.conf import settings
from django.db import models


class GameMode(models.Model):
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name="modes",
    )
    title = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.game.title} - {self.title}"


