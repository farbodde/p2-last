# auth_app/admin_serializers.py
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

 
from .models import User


class UserRoleUpdateSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.ChoiceField(choices=["player", "youtuber", "premium_user", "admin"])

    def validate_username(self, value):
        try:
            return User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

    def validate_role(self, value):
        if not Group.objects.filter(name=value).exists():
            raise serializers.ValidationError("Role does not exist")
        return value

    def validate(self, attrs):
        # rename so view can access validated_data["user"] directly
        attrs["user"] = attrs.pop("username")
        return attrs


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role     = serializers.CharField(required=False, write_only=True)

    class Meta:
        model  = User
        fields = [
            "email", "display_name", "username", "password",
            "profile_image", "cover_image", "about_me", "gender",
            "date_of_birth", "location", "languages", "is_active", "role",
        ]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        role     = validated_data.pop("role", None)
        password = validated_data.pop("password")
        user     = User.objects.create_user(password=password, **validated_data)
        if role:
            try:
                user.groups.add(Group.objects.get(name=role))
            except Group.DoesNotExist:
                pass
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "email", "display_name", "username", "profile_image",
            "cover_image", "about_me", "gender", "date_of_birth",
            "location", "languages", "is_active",
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    # Integer id — clients use this for any id-based admin action
    id = serializers.IntegerField(source="id", read_only=True)

    # Single primary role string (or null)
    role = serializers.SerializerMethodField()

    # Pulled from the model property
    is_online = serializers.BooleanField(read_only=True)

    class Meta:
        model  = User
        fields = [
            "id",
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
            "is_active",
            "is_staff",
            "is_superuser",
            "last_login",       # from AbstractBaseUser — safe to include
            "last_activity",    # your custom field
            "is_online",        # your model @property
            "role",
        ]
        # raw 'id' is intentionally omitted from fields entirely
        read_only_fields = ["last_login", "last_activity"]

    

    def get_role(self, obj) -> str | None:
        group = obj.groups.first()
        return group.name if group else None