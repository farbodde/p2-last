# auth_app/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    SignupView, LoginView, ForgetPasswordView, ChangePasswordView,
    ProfileView, ReportUserAPIView, BlockUserAPIView, UnblockUserAPIView,
    BlockedUsersListAPIView, ReportListAPIView, ReportDeleteAPIView,
    DeleteMyAccountView, CreateAccountIDAPIView, MyAccountIDListAPIView,
    DeleteAccountIDAPIView, UserProfileByUsernameAPIView
)
from .admin_views import (
    UpdateUserRoleView, UserListView, UserDetailView,
    UserCreateView, UserUpdateView, UserDeleteView,
)
from .views import GoogleAuthView

urlpatterns = [
    # ── Auth ────────────────────────────────────────────────────────────
    path("signup/",           SignupView.as_view()),
    path("login/",            LoginView.as_view()),
    path("google/",           GoogleAuthView.as_view(), name="google-auth"),
    path("token/refresh/",    TokenRefreshView.as_view()),
    path("forget-password/",  ForgetPasswordView.as_view()),
    path("change-password/",  ChangePasswordView.as_view()),
    path("profile/",          ProfileView.as_view()),

    # ── User actions ────────────────────────────────────────────────────
    path("users/report/",     ReportUserAPIView.as_view()),
    path("users/block/",      BlockUserAPIView.as_view()),
    path("users/unblock/",    UnblockUserAPIView.as_view()),
    path("users/blocked/",    BlockedUsersListAPIView.as_view()),
    path("users/delete-account/", DeleteMyAccountView.as_view(), name="delete-my-account"),

    # ── Account IDs ─────────────────────────────────────────────────────
    path("account-ids/",                        MyAccountIDListAPIView.as_view()),
    path("account-ids/create/",                 CreateAccountIDAPIView.as_view()),
    # use integer primary key
    path("account-ids/<int:pk>/delete/", DeleteAccountIDAPIView.as_view()),


    path("users/<str:username>/profile/", UserProfileByUsernameAPIView.as_view()),
    # ── Admin – fixed paths BEFORE the <str:username> wildcard ──────────
    path("admin/users/",             UserListView.as_view(),   name="user-list"),
    path("admin/users/create/",      UserCreateView.as_view(), name="user-create"),
    path("admin/users/update-role/", UpdateUserRoleView.as_view()),
    path("admin/users/reports/",     ReportListAPIView.as_view(), name="report-list"),
        # use integer primary key for report id
        path("admin/users/reports/<int:pk>/delete/",
            ReportDeleteAPIView.as_view(), name="report-delete"),

    # wildcard username routes LAST
    path("admin/users/<str:username>/",        UserDetailView.as_view(), name="user-detail"),
    path("admin/users/<str:username>/update/", UserUpdateView.as_view(), name="user-update"),
    path("admin/users/<str:username>/delete/", UserDeleteView.as_view(), name="user-delete"),
]