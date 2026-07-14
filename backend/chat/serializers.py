# chat/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

# expose raw integer ids
from .models import Chat, Message

User = get_user_model()


class ChatListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="id", read_only=True)
    other_user   = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model  = Chat
        fields = [
            "id",
            "session_id",
            "title",
            "other_user",
            "last_message",
            "created_at",
        ]

    

    def get_other_user(self, obj) -> dict:
        request = self.context["request"]
        other   = obj.user2 if obj.user1 == request.user else obj.user1
        return {
            # expose username as the public identifier, not numeric id
            "username":     other.username,
            "display_name": other.display_name,
            "profile_image": (
                request.build_absolute_uri(other.profile_image.url)
                if other.profile_image else None
            ),
        }

    def get_last_message(self, obj) -> dict | None:
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return None
        return {
            "id":  last.id,
            "content":       last.content,
            "sender":        last.sender.username,   # username, not numeric sender_id
            "created_at":    last.created_at,
        }


class MessageSerializer(serializers.ModelSerializer):
    id      = serializers.IntegerField(source="id", read_only=True)
    chat_id = serializers.IntegerField(source="chat_id", read_only=True)
    sender_username   = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model  = Message
        fields = [
            "id",
            "chat_id",
            "sender_username",    # username instead of numeric sender FK
            "type",
            "content",
            "created_at",
            "deleted",
        ]
        read_only_fields = ["id", "chat_id", "created_at", "deleted"]

    