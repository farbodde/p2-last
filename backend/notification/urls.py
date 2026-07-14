# notification/urls.py
from django.urls import path
from notification.views import (
    RegisterDeviceAPIView,
    UnregisterDeviceAPIView,
    NotificationListAPIView,
    MarkNotificationReadAPIView,
    MarkAllNotificationsReadAPIView,
    UnreadNotificationCountAPIView,
    TestPushNotificationAPIView,
)

urlpatterns = [
    path("devices/", RegisterDeviceAPIView.as_view()),
    path("devices/remove/", UnregisterDeviceAPIView.as_view()),

    path("", NotificationListAPIView.as_view()),
    path("<int:pk>/read/", MarkNotificationReadAPIView.as_view()),
    path("read-all/", MarkAllNotificationsReadAPIView.as_view()),
    path("unread-count/", UnreadNotificationCountAPIView.as_view()),

    path("test/", TestPushNotificationAPIView.as_view()),
]