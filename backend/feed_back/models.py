#feed_back/models.py
from django.conf import settings
from django.db import models

from django.contrib.auth import get_user_model

User = get_user_model()
class Feedback(models.Model):
    FEEDBACK_TYPES = [
        ("bug", "Bug"),
        ("complaint", "Complaint"),
        ("suggestion", "Suggestion / Idea"),
        ("technical", "Technical Difficulty"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedbacks",
    )
    email = models.EmailField()
    description = models.TextField()
    type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.type}"


class FeedbackScreenshot(models.Model):
    feedback = models.ForeignKey(
        Feedback,
        on_delete=models.CASCADE,
        related_name="screenshots",
    )
    image = models.ImageField(upload_to="feedback/screenshots/")

    def __str__(self):
        return f"Screenshot for Feedback {self.feedback_id}"
