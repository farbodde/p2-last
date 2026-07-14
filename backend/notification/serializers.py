# notification/serializers.py
from rest_framework import serializers
from notification.models import Notification
class NotificationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="pk", read_only=True)

    class Meta:
        model = Notification
        fields = "__all__"