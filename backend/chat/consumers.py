# chat/consumers.py
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

 
from .models import Chat, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        # chat_id comes from the URL as integer
        self.chat_id = int(self.scope["url_route"]["kwargs"]["chat_id"])

        # ── Fetch chat and authorise ──────────────────────────────────────
        try:
            self.chat = await database_sync_to_async(Chat.objects.get)(id=self.chat_id)
        except Chat.DoesNotExist:
            await self.close(code=4004)
            return

        if self.user not in [self.chat.user1, self.chat.user2]:
            await self.close(code=4001)
            return

        # ── Join channel group ────────────────────────────────────────────
        self.group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get("message")

        if not message_text:
            await self.send(text_data=json.dumps({"error": "Message content is required"}))
            return

        message = await self.create_message(message_text)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type":               "chat_message",
                "message":            message.content,
                "sender":             self.user.username,
                "chat_id":            self.chat_id,
                "msg_id":             message.id,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message":           event["message"],
            "sender":            event["sender"],
            "chat_id":           event["chat_id"],
            "msg_id":            event["msg_id"],
        }))

    @database_sync_to_async
    def create_message(self, message_text: str) -> Message:
        return Message.objects.create(
            chat=self.chat,
            sender=self.user,
            type="user",
            content=message_text,
        )