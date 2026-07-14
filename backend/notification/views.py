# notification/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from notification.models import Device, Notification
from notification.serializers import NotificationSerializer
from django.core.exceptions import ValidationError
from auth_app.permissions import IsAdmin
from rest_framework.permissions import AllowAny

from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404

class RegisterDeviceAPIView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        token = request.data.get("fcm_token")
        device_type = request.data.get("device_type")

        if not token or not device_type:
            return Response(
                {"detail": "fcm_token and device_type are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Device.objects.update_or_create(
            token=token,
            defaults={
                "user": request.user,
                "device_type": device_type,
            },
        )

        return Response(
            {"detail": "Device registered successfully"},
            status=status.HTTP_201_CREATED,
        )


class NotificationListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")


class MarkNotificationReadAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        notification = get_object_or_404(
            Notification,
            pk=pk,
            user=request.user,
        )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            {"detail": "Notification marked as read"},
            status=status.HTTP_200_OK,
        )


class UnregisterDeviceAPIView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request):
        token = request.data.get("fcm_token")

        if not token:
            return Response(
                {"detail": "fcm_token required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Device.objects.filter(
            user=request.user,
            token=token,
        ).delete()

        return Response(
            {"detail": "Device removed"},
            status=status.HTTP_200_OK,
        )


class MarkAllNotificationsReadAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response(    
            {"detail": "All notifications marked as read"},
            status=status.HTTP_200_OK,
        )


class UnreadNotificationCountAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).count()

        return Response({"unread_count": count})


from notification.tasks import send_push_notification

class TestPushNotificationAPIView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        title = request.data.get("title")
        body = request.data.get("body")
        data = request.data.get("data", {})

        if not title or not body:
            return Response(
                {"detail": "title and body are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # فرض کنید notification_id رمزنگاری شده است
        # اینجا فقط نمونه‌ای از نحوه ارسال است
        # send_push_notification.delay(encrypted_notification_id)

        return Response(
            {"detail": "Push notification queued"},
            status=status.HTTP_200_OK,
        )