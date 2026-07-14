# chat/views.py
from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

 
from .models import Chat
from .serializers import ChatListSerializer, MessageSerializer


class UserChatListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = (
            Chat.objects.filter(Q(user1=request.user) | Q(user2=request.user))
            .prefetch_related("messages")
            .order_by("-created_at")
        )
        paginator = PageNumberPagination()
        try:
            paginator.page_size = int(request.query_params.get("page_size", 10))
        except (TypeError, ValueError):
            paginator.page_size = 10

        page = paginator.paginate_queryset(chats, request)
        serializer = ChatListSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


import uuid
from django.contrib.auth import get_user_model


User = get_user_model()

class ChatMessagesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):

        # ── Fetch chat and authorise ──────────────────────────────────────
        try:
            chat = Chat.objects.get(
                Q(id=chat_id) & (Q(user1=request.user) | Q(user2=request.user))
            )
        except Chat.DoesNotExist:
            return Response(
                {"error": "Chat not found or you don't have permission to view it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── Paginate messages ─────────────────────────────────────────────
        try:
            page_number = int(request.query_params.get("page", 1))
        except ValueError:
            page_number = 1

        messages  = chat.messages.filter(deleted=False).order_by("created_at")
        paginator = Paginator(messages, 40)

        try:
            page_obj = paginator.page(page_number)
        except Exception as exc:
            return Response(
                {"error": f"Invalid page number: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MessageSerializer(
            page_obj.object_list,
            many=True,
            context={"request": request},
        )

        response_data = {
            "chat_id": chat.id,
            "chat_title":        chat.title,
            "session_id":        chat.session_id,
            "current_page":      page_obj.number,
            "total_pages":       paginator.num_pages,
            "total_messages":    paginator.count,
            "has_next":          page_obj.has_next(),
            "has_previous":      page_obj.has_previous(),
            "messages":          serializer.data,
        }

        if page_obj.has_next():
            response_data["next_page"] = page_obj.next_page_number()
        if page_obj.has_previous():
            response_data["previous_page"] = page_obj.previous_page_number()

        return Response(response_data)
    


class StartChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")

        try:
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=404
            )

        if other_user == request.user:
            return Response(
                {"error": "You can't chat with yourself"},
                status=400
            )

        chat = (
            Chat.objects.filter(
                Q(user1=request.user, user2=other_user)
                |
                Q(user1=other_user, user2=request.user)
            )
            .first()
        )

        if not chat:
            chat = Chat.objects.create(
                user1=request.user,
                user2=other_user,
                session_id=str(uuid.uuid4())
            )

        return Response({
            "chat_id": chat.id,
            "session_id": chat.session_id
        })