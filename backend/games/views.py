# games/views.py
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Game, Platform, Category, Item, GameMode
from .serializers import GameCreateUpdateSerializer, GameSerializer, ItemSimpleSerializer, PlatformSerializer, CategorySerializer, ItemSerializer
from auth_app.permissions import IsAdmin
from core.fernet_utils import decrypt_id
from .pagination import DefaultPagination
from rest_framework.exceptions import NotFound






# ── helper used by every generic retrieve/update/destroy view ──────────────
def _decrypt_pk(kwargs: dict) -> int:
    """If 'pk' already present use it, otherwise decrypt 'encrypted_pk'."""
    if "pk" in kwargs:
        return int(kwargs["pk"])
    try:
        pk = decrypt_id(kwargs["encrypted_pk"])
    except (ValueError, KeyError):
        raise NotFound("Invalid identifier.")
    kwargs["pk"] = pk   # DRF's get_object() reads self.kwargs["pk"]
    return pk




class AuthUserGameListAPIView(generics.ListAPIView):
    """
    Returns a public list of games.
    """
    serializer_class = GameSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    authentication_classes = []

    def get_queryset(self):
        return Game.objects.prefetch_related(
            "platforms",
            "game_categories",
        )

class PlatformListCreateAPIView(generics.ListCreateAPIView):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

# ── Platforms ──────────────────────────────────────────────────────────────
class PlatformRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        _decrypt_pk(self.kwargs)
        return super().get_object()


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination


# ── Categories ─────────────────────────────────────────────────────────────
class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        _decrypt_pk(self.kwargs)
        return super().get_object()

class ItemListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = ItemSerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):
        queryset = Item.objects.all()

        category_id = self.request.query_params.get(
            "category_id"
        )

        if category_id:
            queryset = queryset.filter(
                category_id=category_id
            )

        return queryset

# ── Items ──────────────────────────────────────────────────────────────────
class ItemRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        _decrypt_pk(self.kwargs)
        return super().get_object()


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

class GameListCreateAPIView(
    generics.ListCreateAPIView
):

    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):

        return Game.objects.prefetch_related(
            "platforms",
            "game_categories",
        )

    def get_serializer_class(self):

        if self.request.method == "POST":
            return GameCreateUpdateSerializer

        return GameSerializer
# ── Games ──────────────────────────────────────────────────────────────────
class GameRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = (
        Game.objects.prefetch_related(
            "platforms",
            "game_categories",
            "game_categories__items",
            "game_categories__items__item",
        )
    )

    def get_object(self):
        _decrypt_pk(self.kwargs)
        return super().get_object()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return GameCreateUpdateSerializer
        return GameSerializer
    


from rest_framework.views import APIView
from rest_framework.response import Response

class CategoryItemsAPIView(generics.ListAPIView):
    serializer_class = ItemSimpleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        try:
            category_id = int(self.kwargs.get("category_id"))
        except (TypeError, ValueError):
            raise NotFound("Invalid category identifier.")
        return Item.objects.filter(category_id=category_id)
    


class GameModeListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    authentication_classes = []

    def get_queryset(self):
        try:
            game_id = int(self.kwargs.get("game_id"))
        except (TypeError, ValueError):
            raise NotFound("Invalid game identifier.")
        return GameMode.objects.filter(game_id=game_id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        data = [
            {"id": mode.id, "title": mode.title}
            for mode in page
        ]
        return self.get_paginated_response(data)

class GameCategoriesAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination
    
    def list(self, request, *args, **kwargs):
        try:
            game_id = int(self.kwargs.get("game_id"))
        except (TypeError, ValueError):
            raise NotFound("Invalid game identifier.")

        from games.models import GameCategory
        queryset = GameCategory.objects.filter(game_id=game_id)
        page = self.paginate_queryset(queryset)

        data = []
        for gc in page:
            data.append({
                "category_id": gc.category.id,
                "category_title":        gc.category.title,
                "limit":                 gc.item_limit,
                "items": [
                    {
                        "id": gci.id,
                        "title":        gci.item.title,
                        "icon":         gci.item.icon.url,
                    }
                    for gci in gc.items.select_related("item")
                ],
            })

        return self.get_paginated_response(data)