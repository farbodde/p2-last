# posts/urls.py
from django.urls import path
from filter.views import LFGFilterAPIView
from .views import (
    CreateLFGAPIView,
    DeleteMyLFGAPIView,
    LFGBumpAPIView,
    UpdateMyLFGAPIView,
    LFGDetailAPIView,
    LFGListAPIView,
    BookmarkLFGAPIView,
    UnbookmarkLFGAPIView,
    UserBookmarkListAPIView,
    FilterBookmarkedLFGAPIView,
    MyLFGListAPIView,
    UserLFGListAPIView,
)

urlpatterns = [
    path("create/", CreateLFGAPIView.as_view()),
    path("update/", UpdateMyLFGAPIView.as_view()),
    path("delete/", DeleteMyLFGAPIView.as_view()),

    path("filter/", LFGFilterAPIView.as_view()),

    path("bookmarks/", UserBookmarkListAPIView.as_view()),
    path("bookmarks/filter/", FilterBookmarkedLFGAPIView.as_view()),

    path("mine/", MyLFGListAPIView.as_view()),

    path("user/<int:user_id>/", UserLFGListAPIView.as_view()),

    path(
        "<int:lfg_id>/bookmark/",
        BookmarkLFGAPIView.as_view(),
    ),

    path(
        "<int:lfg_id>/unbookmark/",
        UnbookmarkLFGAPIView.as_view(),
    ),

    path("<int:lfg_id>/bump/", LFGBumpAPIView.as_view()),

    path("<int:lfg_id>/", LFGDetailAPIView.as_view()),

    path("", LFGListAPIView.as_view()),
]