# notification/models.py
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Device(models.Model):
    DEVICE_TYPES = (
        ("android", "Android"),
        ("ios", "iOS"),
        ("web", "Web"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="devices",
    )
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.device_type}"


class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} -> {self.user}"
