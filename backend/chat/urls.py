# chat/urls.py
from django.urls import path
from .views import UserChatListAPIView, ChatMessagesAPIView, StartChatAPIView

urlpatterns = [
    path("", UserChatListAPIView.as_view()),
    # use integer chat_id
    path("start/", StartChatAPIView.as_view(), name="chat-start"),
    path("<int:chat_id>/messages/", ChatMessagesAPIView.as_view(), name="chat-messages"),
    
]