# jwt.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user = self.user
        
        # Check if user is active
        if not user.is_active:
            raise exceptions.AuthenticationFailed("Account is not active.")
        
        # Add role to token payload
        refresh = self.get_token(user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add user info to response
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'display_name': user.display_name,
            'username': user.username,
            'role': user.groups.first().name if user.groups.exists() else None,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        }

        
        return data