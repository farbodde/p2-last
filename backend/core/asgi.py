# core/asgi.py
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from django.core.asgi import get_asgi_application

# First initialize Django
django_asgi_app = get_asgi_application()

# Now it's safe to import routing
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(chat.routing.websocket_urlpatterns)
    ),
})
