# chat/models.py
from django.db import models
from core.settings import AUTH_USER_MODEL

User = AUTH_USER_MODEL

class Chat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats_user2")
    session_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"


class Message(models.Model):
    LIKE_CHOICES = (
        (-1, 'Dislike'),
        (0, 'Neutral'),
        (1, 'Like'),
    )

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    type = models.CharField(max_length=10)  # 'user' or 'recipient'
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} in chat {self.chat.session_id}: {self.content}"