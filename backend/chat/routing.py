# chat/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # websocket chat by numeric chat_id
    re_path(r"ws/chat/(?P<chat_id>\d+)/$", consumers.ChatConsumer.as_asgi()),
]