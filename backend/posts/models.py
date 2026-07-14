# posts/models.py


from django.conf import settings
from django.db import models
from games.models import Game, GameCategoryItem, GameMode
from games.models import Platform

from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()
class LFG(models.Model):
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="lfg",
    )

    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name="lfgs",
    )

    platform = models.ForeignKey(
        Platform,
        on_delete=models.CASCADE,
    )

    allow_cross_play = models.BooleanField(default=False)

    mic_enabled = models.BooleanField(default=False)

    game_mode = models.ForeignKey(
        GameMode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    description = models.TextField()

    bumped_at = models.DateTimeField(null=True, blank=True)

    def can_bump(self):
        """
        User can bump again only after 3 hours.
        """
        if self.bumped_at is None:
            return True
        return timezone.now() - self.bumped_at >= timedelta(hours=3)

    def bump(self):
        self.bumped_at = timezone.now()
        self.save(update_fields=["bumped_at"])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class LFGStatImage(models.Model):
    lfg = models.ForeignKey(
        LFG,
        on_delete=models.CASCADE,
        related_name="stat_images",
    )
    image = models.ImageField(upload_to="lfg/stats/")





class LFGSelectedItem(models.Model):
    lfg = models.ForeignKey(
        LFG,
        on_delete=models.CASCADE,
        related_name="selected_items",
    )
    game_category_item = models.ForeignKey(
        GameCategoryItem,
        on_delete=models.CASCADE,
    )

    class Meta:
        unique_together = ("lfg", "game_category_item")



        


class LFGBookmark(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lfg_bookmarks",
    )

    lfg = models.ForeignKey(
        "posts.LFG",
        on_delete=models.CASCADE,
        related_name="bookmarked_by",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "lfg")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} bookmarked {self.lfg_id}"