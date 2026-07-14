from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from posts.serializers import LFGCreateSerializer
from auth_app.permissions import IsAdmin
from django.db.models import F
from .models import LFG, LFGBookmark
from .serializers import LFGDetailSerializer, LFGListSerializer, LFGBookmarkSerializer, LFGUpdateSerializer
from .pagination import LFGPagination
from django.shortcuts import get_object_or_404
 
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from filter.serializers import LFGFilterSerializer
from filter.services import filter_lfg_queryset
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

class CreateLFGAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LFGCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        lfg = serializer.save()

        return Response(
            {"detail": "LFG created successfully", "id": lfg.id},
            status=status.HTTP_201_CREATED,
        )



class DeleteMyLFGAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        if not hasattr(request.user, "lfg"):
            
            return Response(
                {"detail": "No active LFG"},
                status=status.HTTP_404_NOT_FOUND,
            )

        request.user.lfg.delete()
        return Response({"detail": "LFG deleted"})


class UpdateMyLFGAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        if not hasattr(request.user, "lfg"):
            return Response(
                {"detail": "You have no active LFG"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LFGUpdateSerializer(
            instance=request.user.lfg,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"detail": "LFG updated successfully"})


class LFGDetailAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, lfg_id):
        try:
            lfg = LFG.objects.select_related(
                "owner",
                "game",
                "platforms",
                "game_mode",
            ).get(id=lfg_id)
        except LFG.DoesNotExist:
            return Response(
                {"detail": "LFG not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LFGDetailSerializer(lfg)
        return Response(serializer.data)


class LFGListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = LFGListSerializer
    pagination_class = LFGPagination
    authentication_classes = []

    queryset = (
        LFG.objects
        .select_related(
            "owner",
            "game",
            "platform",
        )
        .prefetch_related(
            "stat_images",
            "selected_items__game_category_item__game_category__category",
        )
        .order_by(
            F("bumped_at").desc(nulls_last=True),
            "-created_at"
        )
    )


class LFGBumpAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, lfg_id):
        try:
            lfg = LFG.objects.get(id=lfg_id, owner=request.user)
        except LFG.DoesNotExist:
            return Response(
                {"detail": "LFG not found or not yours"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not lfg.can_bump():
            remaining = timedelta(hours=3) - (timezone.now() - lfg.bumped_at)
            minutes = int(remaining.total_seconds() // 60)

            return Response(
                {"detail": "Too soon to bump again", "remaining_minutes": minutes},
                status=status.HTTP_400_BAD_REQUEST,
            )

        lfg.bump()

        return Response(
            {"detail": "LFG bumped successfully", "bumped_at": lfg.bumped_at},
            status=status.HTTP_200_OK,
        )


class BookmarkLFGAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, lfg_id):
        lfg = get_object_or_404(LFG, id=lfg_id)

        bookmark, created = LFGBookmark.objects.get_or_create(
            user=request.user,
            lfg=lfg,
        )

        if not created:
            return Response(
                {"detail": "Already bookmarked"},
                status=status.HTTP_200_OK,
            )

        return Response(
            {"detail": "LFG bookmarked successfully"},
            status=status.HTTP_201_CREATED,
        )


class UnbookmarkLFGAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, lfg_id):
        bookmark = get_object_or_404(
            LFGBookmark,
            user=request.user,
            lfg_id=lfg_id,
        )

        bookmark.delete()

        return Response(
            {"detail": "LFG removed from bookmarks"},
            status=status.HTTP_200_OK,
        )


class UserBookmarkListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LFGBookmarkSerializer

    pagination_class = PageNumberPagination
    pagination_class.page_size = 10

    def get_queryset(self):
        return (
            LFGBookmark.objects
            .filter(user=self.request.user)
            .select_related(
                "lfg",
                "lfg__owner",
                "lfg__game",
                "lfg__platform",
            )
            .prefetch_related(
                "lfg__stat_images",
                "lfg__selected_items",
            )
        )


class FilterBookmarkedLFGAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LFGFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bookmarked_queryset = (
            LFG.objects
            .filter(
                bookmarked_by__user=request.user
            )
            .select_related(
                "owner",
                "game",
                "platform",
            )
            .prefetch_related(
                "stat_images",
                "selected_items__game_category_item__item",
            )
        )

        queryset = filter_lfg_queryset(
            serializer.validated_data,
            queryset=bookmarked_queryset,
        )

        paginator = PageNumberPagination()
        paginator.page_size = 8

        page = paginator.paginate_queryset(
            queryset,
            request,
        )

        return paginator.get_paginated_response(
            LFGListSerializer(
                page,
                many=True,
                context={"request": request},
            ).data
        )


class MyLFGListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LFGListSerializer
    pagination_class = LFGPagination

    def get_queryset(self):
        return (
            LFG.objects
            .filter(owner=self.request.user)
            .select_related(
                "owner",
                "game",
                "platform",
            )
            .prefetch_related(
                "stat_images",
                "selected_items__game_category_item__game_category__category",
            )
            .order_by(
                F("bumped_at").desc(nulls_last=True),
                "-created_at",
            )
        )



class UserLFGListAPIView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = LFGListSerializer
    pagination_class = LFGPagination

    def get_queryset(self):
        try:
            user_id = int(self.kwargs.get("user_id"))
        except (TypeError, ValueError):
            return LFG.objects.none()

        return (
            LFG.objects
            .filter(owner__id=user_id)
            .select_related(
                "owner",
                "game",
                "platforms",
            )
            .prefetch_related(
                "stat_images",
                "selected_items__game_category_item__game_category__category",
            )
            .order_by(
                F("bumped_at").desc(nulls_last=True),
                "-created_at",
            )
        )