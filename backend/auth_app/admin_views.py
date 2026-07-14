# auth_app/admin_views.py
from django.contrib.auth.models import Group
from django.core.paginator import Paginator
from django.db import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsAdmin
from .admin_serializers import (
    UserRoleUpdateSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserDetailSerializer,
)


class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by("-id")

        search = request.GET.get("search")
        if search:
            users = users.filter(
                models.Q(email__icontains=search)
                | models.Q(display_name__icontains=search)
                | models.Q(username__icontains=search)
            )

        role = request.GET.get("role")
        if role:
            users = users.filter(groups__name=role)

        page_number = request.GET.get("page", 1)
        page_size   = request.GET.get("page_size", 10)
        paginator   = Paginator(users, page_size)
        page_obj    = paginator.get_page(page_number)

        serializer = UserDetailSerializer(page_obj, many=True)
        return Response({
            "count":        paginator.count,
            "num_pages":    paginator.num_pages,
            "current_page": page_obj.number,
            "has_next":     page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
            "results":      serializer.data,
        })


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, username):           # ← username instead of user_id
        try:
            user = User.objects.prefetch_related("groups").get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(UserDetailSerializer(user).data)


class UserCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        role = request.data.get("role")
        if role:
            try:
                user.groups.add(Group.objects.get(name=role))
            except Group.DoesNotExist:
                return Response(
                    {"error": "Role does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(UserDetailSerializer(user).data, status=status.HTTP_201_CREATED)


class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, username):           # ← username instead of user_id
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        role = request.data.get("role")
        if role:
            try:
                user.groups.clear()
                user.groups.add(Group.objects.get(name=role))
            except Group.DoesNotExist:
                return Response(
                    {"error": "Role does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(UserDetailSerializer(user).data)


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, username):        # ← username instead of user_id
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.delete()
        return Response(
            {"detail": "User deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


class UpdateUserRoleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = UserRoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # validated_data["user"] is already the resolved User object (from serializer)
        user     = serializer.validated_data["user"]
        new_role = serializer.validated_data["role"]

        user.groups.clear()
        user.groups.add(Group.objects.get(name=new_role))

        return Response(
            {"message": f"User role updated to {new_role}"},
            status=status.HTTP_200_OK,
        )