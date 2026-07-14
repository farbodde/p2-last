# urls.py
from django.urls import path
from .views import FilterCategoryAdminViewSet, FilterConfigAPIView

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("admin/filter-categories", FilterCategoryAdminViewSet)

urlpatterns = [
    path("config/", FilterConfigAPIView.as_view()),
] + router.urls