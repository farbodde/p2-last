from django.contrib import admin
from django.urls import path, include
from .views import LanguageListView, CountryistView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('home_ad/', admin.site.urls),
    path("api/v1/meta/languages/", LanguageListView.as_view()),
    path("api/v1/meta/countries/", CountryistView.as_view()),


    path("api/v1/auth/", include("auth_app.urls")),
    path("api/v1/feedback/", include("feed_back.urls")),
    path("api/v1/notify/", include("notification.urls")),
    path("api/v1/lfg/", include("posts.urls")),
    path("api/v1/game/", include("games.urls")),
    path("api/v1/filter/", include("filter.urls")),
    path("api/v1/chats/", include("chat.urls")),
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)