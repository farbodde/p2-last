# filter/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.constants.languages import LANGUAGES
from core.constants.countries import COUNTRIES

from games.models import Game, Platform, Category
from .serializers import (
    GameSerializer,
    PlatformSerializer,
    FilterCategorySerializer,
    LFGFilterSerializer
)

from .models import FilterCategory   # new model (explained below)
class FilterConfigAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        games = Game.objects.prefetch_related("platforms")

        platforms = Platform.objects.all()

        categories = (
            FilterCategory.objects
            .filter(is_active=True)
            .select_related("category")
            .prefetch_related("category__items")
            .order_by("order")
        )

        return Response({
            "games": GameSerializer(games, many=True).data,
            "platforms": PlatformSerializer(platforms, many=True).data,
            "dynamic_categories": FilterCategorySerializer(categories, many=True).data,

            "countries": COUNTRIES,
            "languages": LANGUAGES,

            "age_range": {
                "min": 16,
                "max": 60
            }
        })


from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from posts.models import LFG

from posts.serializers import LFGListSerializer



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from posts.serializers import LFGListSerializer
from .serializers import LFGFilterSerializer
from .services import filter_lfg_queryset


class LFGFilterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):

        serializer = LFGFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = filter_lfg_queryset(serializer.validated_data)

        paginator = PageNumberPagination()
        paginator.page_size = 8

        page = paginator.paginate_queryset(queryset, request)

        return paginator.get_paginated_response(
            LFGListSerializer(page, many=True).data
        )




from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser
from .models import FilterCategory
from .serializers import FilterCategoryAdminSerializer
from auth_app.permissions import IsAdmin


class FilterCategoryAdminViewSet(ModelViewSet):
    
    queryset = FilterCategory.objects.select_related("category")
    serializer_class = FilterCategoryAdminSerializer
    permission_classes = [IsAdmin]


    
