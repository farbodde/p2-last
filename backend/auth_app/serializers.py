#auth_app/serializers.py
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("New passwords do not match")

        validate_password(attrs["new_password"])
        return attrs
    
class SignupSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "display_name", "password", "confirm_password")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            display_name=validated_data["display_name"],
        )

        # Assign default role
        player_group, created = Group.objects.get_or_create(name="player")
        user.groups.add(player_group)

        user.languages = ["en"]
        user.save(update_fields=["languages"])

        return user



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(
            email=attrs["email"],
            password=attrs["password"]
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        attrs["user"] = user
        return attrs


class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


from rest_framework import serializers
from django.utils import timezone
from .models import User, DefaultProfileImage, DefaultCoverImage


class ProfileSerializer(serializers.ModelSerializer):
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "email",
            "display_name",
            "username",
            "profile_image",
            "cover_image",
            "about_me",
            "gender",
            "date_of_birth",
            "location",
            "languages",
            "profile_completion",   # ✅ NEW
        )
        read_only_fields = ("email",)

    # ----------------------------
    # VALIDATIONS (unchanged)
    # ----------------------------
    def validate_username(self, value):
        user = self.instance
        if len(value) < 5:
            raise serializers.ValidationError("Username must be at least 5 characters")

        if user.username != value and not user.can_change_username():
            raise serializers.ValidationError(
                "Username can only be changed every 10 days"
            )
        return value

    def validate_languages(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list")

        if len(value) > 7:
            raise serializers.ValidationError(
                "You can select a maximum of 7 languages"
            )

        for lang in value:
            if not isinstance(lang, str):
                raise serializers.ValidationError("Invalid language format")

            if len(lang) not in (2, 3):
                raise serializers.ValidationError(
                    f"Invalid language code: {lang}"
                )

        return value

    # ----------------------------
    # PROFILE COMPLETION
    # ----------------------------
    def get_profile_completion(self, obj):
        fields = {
            "display_name": bool(obj.display_name),
            "username": bool(obj.username),
            "profile_image": bool(obj.profile_image),
            "cover_image": bool(obj.cover_image),
            "about_me": bool(obj.about_me),
            "gender": obj.gender != "none",
            "date_of_birth": bool(obj.date_of_birth),
            "location": bool(obj.location),
            "languages": bool(obj.languages),
        }

        total_fields = len(fields)
        completed_fields = sum(1 for value in fields.values() if value)

        percent = int((completed_fields / total_fields) * 100)
        return percent

    # ----------------------------
    # UPDATE LOGIC (unchanged)
    # ----------------------------
    def update(self, instance, validated_data):
        if "username" in validated_data:
            instance.username_updated_at = timezone.now()

        # Default profile image
        if not instance.profile_image:
            img = DefaultProfileImage.objects.order_by("?").first()
            if img:
                instance.profile_image = img.image

        # Default cover image
        if not instance.cover_image:
            img = DefaultCoverImage.objects.order_by("?").first()
            if img:
                instance.cover_image = img.image

        return super().update(instance, validated_data)


# serializers.py
from rest_framework import serializers
from .models import UserReport, UserReportImage
from django.contrib.auth import get_user_model

User = get_user_model()


class UserReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = UserReport
        fields = ["username", "message", "images"]

    def validate_username(self, value):
        try:
            return User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        reported_user = validated_data.pop("username")

        report = UserReport.objects.create(
            reporter=self.context["request"].user,
            reported_user=reported_user,
            **validated_data,
        )

        for img in images:
            UserReportImage.objects.create(report=report, image=img)

        return report
    
class BlockedUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="id", read_only=True)
    class Meta:
        model = User
        fields = ["id", "username", "display_name", "profile_image"]
    


class ReportListSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    reported_user_username = serializers.CharField(source='reported_user.username', read_only=True)
    reported_user_email = serializers.EmailField(source='reported_user.email', read_only=True)
    image_urls = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="id", read_only=True)
    
    class Meta:
        model = UserReport
        fields = [
            'id',
            'reporter_username',
            'reporter_email',
            'reported_user_username',
            'reported_user_email',
            'message',
            'image_urls',
            'created_at'
        ]

    
    
    def get_image_urls(self, obj):
        request = self.context.get('request')
        if request:
            return [request.build_absolute_uri(img.image.url) for img in obj.images.all()]
        return [img.image.url for img in obj.images.all()]
    


from auth_app.models import AccountID


class AccountIDSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="id", read_only=True)
    class Meta:
        model = AccountID
        fields = ("id", "platform", "username", "created_at")
        read_only_fields = ( "id", "created_at")




from rest_framework import serializers
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

User = get_user_model()

class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    
    def validate_token(self, token):
        """Verify Google token and return user info"""
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise serializers.ValidationError('Invalid token issuer')
            
            return idinfo
            
        except ValueError as e:
            raise serializers.ValidationError(f'Invalid token: {str(e)}')
    
    def create(self, validated_data):
        idinfo = validated_data['token']
        
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'display_name': f"{first_name} {last_name}".strip() or email.split('@')[0],
                'is_active': True,
                'languages': ['en']
            }
        )
        
        # If user already exists but logged in via Google for first time
        if not created and not user.has_usable_password():
            # Update user info if needed
            if not user.display_name:
                user.display_name = f"{first_name} {last_name}".strip() or email.split('@')[0]
                user.save()
        
        # Set unusable password for OAuth users
        if created:
            user.set_unusable_password()
            user.save()
            
            # Assign default role
            from django.contrib.auth.models import Group
            player_group, _ = Group.objects.get_or_create(name="player")
            user.groups.add(player_group)
        
        return user
# serializers.py

from rest_framework import serializers
from .models import User

class PublicProfileSerializer(serializers.ModelSerializer):
    is_online = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "display_name",
            "profile_image",
            "cover_image",
            "about_me",
            "gender",
            "location",
            "languages",
            "is_online",
        ]