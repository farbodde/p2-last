from django.utils import timezone
from datetime import timedelta
from django.db.models import Count

from posts.models import LFG


def get_base_lfg_queryset():

    return (
        LFG.objects
        .select_related(
            "owner",
            "game",
        )
        .prefetch_related(
            "platform",   # if LFG has M2M platforms
            "game__platforms",
            "stat_images",
            "selected_items__game_category_item__item",
        )
    )

# def filter_lfg_queryset(filters, queryset=None):

#     if queryset is None:
#         queryset = get_base_lfg_queryset()

#     # GAME
#     if filters.get("game"):
#         queryset = queryset.filter(
#             game_id=filters["game"]
#         )

#     # PLATFORMS
#     if filters.get("platforms"):
#         queryset = queryset.filter(
#             platforms__id__in=filters["platforms"]
#         )

#     # MIC
#     if filters.get("mic_enabled"):
#         queryset = queryset.filter(
#             mic_enabled=True
#         )

#     # CROSS PLAY
#     if filters.get("cross_play"):
#         queryset = queryset.filter(
#             allow_cross_play=True
#         )

#     # HAS STAT IMAGES
#     if filters.get("has_stat_images"):
#         queryset = queryset.filter(
#             stat_images__isnull=False
#         )

#     # ONLINE USERS
#     if filters.get("online_only"):

#         five_min_ago = (
#             timezone.now() - timedelta(minutes=5)
#         )

#         queryset = queryset.filter(
#             owner__last_activity__gte=five_min_ago
#         )

#     # COUNTRY
#     if filters.get("country"):
#         queryset = queryset.filter(
#             owner__location=filters["country"]
#         )

#     # LANGUAGES
#     if filters.get("languages"):

#         for lang in filters["languages"]:
#             queryset = queryset.filter(
#                 owner__languages__contains=[lang]
#             )

#     # AGE FILTER
#     today = timezone.now().date()

#     if filters.get("age_min"):

#         max_birth = today.replace(
#             year=today.year - filters["age_min"]
#         )

#         queryset = queryset.filter(
#             owner__date_of_birth__lte=max_birth
#         )

#     if filters.get("age_max"):

#         min_birth = today.replace(
#             year=today.year - filters["age_max"]
#         )

#         queryset = queryset.filter(
#             owner__date_of_birth__gte=min_birth
#         )

#     # CATEGORY ITEMS
#     if filters.get("categories"):

#         category_ids = filters["categories"]

#         queryset = queryset.filter(
#             selected_items__game_category_item__item_id__in=category_ids
#         ).annotate(
#             matched_items=Count(
#                 "selected_items__game_category_item__item",
#                 distinct=True,
#             )
#         ).filter(
#             matched_items=len(category_ids)
#         )

#     return queryset.distinct().order_by("-created_at")

def filter_lfg_queryset(filters, queryset=None):

    if queryset is None:
        queryset = get_base_lfg_queryset()

    # GAME
    if filters.get("game"):
        queryset = queryset.filter(
            game_id=filters["game"]
        )

    # PLATFORM
    if filters.get("platform"):
        queryset = queryset.filter(
            platform__id__in=filters["platform"]
        )

    # MIC
    if filters.get("mic_enabled"):
        queryset = queryset.filter(
            mic_enabled=True
        )

    # CROSS PLAY
    if filters.get("cross_play"):
        queryset = queryset.filter(
            allow_cross_play=True
        )

    # HAS STAT IMAGES
    if filters.get("has_stat_images"):
        queryset = queryset.filter(
            stat_images__isnull=False
        )

    # ONLINE USERS
    if filters.get("online_only"):
        five_min_ago = timezone.now() - timedelta(minutes=5)

        queryset = queryset.filter(
            owner__last_activity__gte=five_min_ago
        )

    # COUNTRY
    if filters.get("country"):
        queryset = queryset.filter(
            owner__location=filters["country"]
        )

    # LANGUAGES
    if filters.get("languages"):
        for lang in filters["languages"]:
            queryset = queryset.filter(
                owner__languages__contains=[lang]
            )

    # AGE FILTER
    today = timezone.now().date()

    if filters.get("age_min"):
        max_birth = today.replace(
            year=today.year - filters["age_min"]
        )

        queryset = queryset.filter(
            owner__date_of_birth__lte=max_birth
        )

    if filters.get("age_max"):
        min_birth = today.replace(
            year=today.year - filters["age_max"]
        )

        queryset = queryset.filter(
            owner__date_of_birth__gte=min_birth
        )

    # CATEGORY ITEMS
    if filters.get("categories"):
        category_ids = filters["categories"]

        queryset = queryset.filter(
            selected_items__game_category_item__item_id__in=category_ids
        ).annotate(
            matched_items=Count(
                "selected_items__game_category_item__item",
                distinct=True,
            )
        ).filter(
            matched_items=len(category_ids)
        )

    return queryset.distinct().order_by("-created_at")