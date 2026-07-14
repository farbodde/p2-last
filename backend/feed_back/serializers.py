#feed_back/serializers.py

from rest_framework import serializers
from .models import Feedback, FeedbackScreenshot

class FeedbackScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackScreenshot
        fields = ['id', 'image']

class FeedbackListSerializer(serializers.ModelSerializer):
    screenshots = FeedbackScreenshotSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'user', 'email', 'description', 'type', 'created_at', 'screenshots']

class FeedbackCreateSerializer(serializers.ModelSerializer):
    screenshots = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Feedback
        fields = ['email', 'description', 'type', 'screenshots']
    
    def create(self, validated_data):
        screenshots_data = validated_data.pop('screenshots', [])
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        feedback = Feedback.objects.create(**validated_data)
        
        for screenshot in screenshots_data:
            FeedbackScreenshot.objects.create(
                feedback=feedback,
                image=screenshot
            )
        
        return feedback