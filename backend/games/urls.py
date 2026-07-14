# games/urls.py
from django.urls import path
from .views import (
    AuthUserGameListAPIView, CategoryItemsAPIView,
    GameListCreateAPIView, GameRetrieveUpdateDestroyAPIView,
    PlatformListCreateAPIView, PlatformRetrieveUpdateDestroyAPIView,
    CategoryListCreateAPIView, CategoryRetrieveUpdateDestroyAPIView,
    ItemListCreateAPIView, ItemRetrieveUpdateDestroyAPIView,
    GameModeListAPIView, GameCategoriesAPIView,
)

urlpatterns = [
    # Platforms
    path("admin/platforms/",                          PlatformListCreateAPIView.as_view()),
    path("admin/platforms/<int:pk>/",       PlatformRetrieveUpdateDestroyAPIView.as_view()),
    # Categories
    path("admin/categories/",                         CategoryListCreateAPIView.as_view()),
    path("admin/categories/<int:pk>/",      CategoryRetrieveUpdateDestroyAPIView.as_view()),
    path("admin/categories/<int:category_id>/items/", CategoryItemsAPIView.as_view()),
    # Items
    path("admin/items/",                              ItemListCreateAPIView.as_view()),
    path("admin/items/<int:pk>/",           ItemRetrieveUpdateDestroyAPIView.as_view()),
    # Games
    path("admin/games/",                              GameListCreateAPIView.as_view()),
    path("admin/games/<int:pk>/",           GameRetrieveUpdateDestroyAPIView.as_view()),
    path("<int:game_id>/modes/",            GameModeListAPIView.as_view()),
    path("<int:game_id>/categories/",       GameCategoriesAPIView.as_view()),
    path("list/",                                     AuthUserGameListAPIView.as_view(), name="user-games"),
]