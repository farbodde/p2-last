import base64
from datetime import date, timedelta

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from auth_app.models import (
    AccountID,
    DefaultCoverImage,
    DefaultProfileImage,
    User,
    UserBlock,
    UserReport,
)
from chat.models import Chat, Message
from feed_back.models import Feedback
from filter.models import FilterCategory
from games.models import (
    Category,
    Game,
    GameCategory,
    GameCategoryItem,
    GameMode,
    Item,
    Platform,
)
from notification.models import Device, Notification
from posts.models import LFG, LFGSelectedItem


TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlH0K8AAAAASUVORK5CYII="
)

USER_PROFILES = [
    ("Alex Mercer", "alex", "male", "IGL looking for smart comms."),
    ("Sara Kim", "sara", "female", "Support main and team player."),
    ("Omid Rahimi", "omid", "male", "Competitive grinder from Istanbul."),
    ("Lina Noor", "lina", "female", "Chill games on weeknights."),
    ("Mina Park", "mina", "female", "Usually online after work."),
    ("Arman Zare", "arman", "male", "Looking for ranked squads."),
    ("Nora Hale", "nora", "female", "Mic on, positive vibes only."),
    ("Kian Darya", "kian", "male", "Cross-play when possible."),
    ("Elena Rossi", "elena", "female", "Weekend sessions and quick rotations."),
    ("Damon Lee", "damon", "male", "Controller player with a good mic."),
    ("Yara Haddad", "yara", "female", "Prefers tactical teams and clean callouts."),
    ("Reza Moradi", "reza", "male", "Grinding ranked most nights."),
    ("Sophia Chen", "sophia", "female", "Flexible role queue and relaxed vibes."),
    ("Mert Aydin", "mert", "male", "FPS player who also jumps into MOBAs."),
    ("Leila Farah", "leila", "female", "Looking for consistent duos."),
    ("Nima Soltani", "nima", "male", "Late-night matches and scrims."),
    ("Ava Brooks", "ava", "female", "Cross-platform and always on mic."),
    ("Daniel Cruz", "daniel", "male", "Prefers ranked and objective play."),
    ("Hana Sato", "hana", "female", "Calm comms and support utility."),
    ("Ethan Cole", "ethan", "male", "Competitive queue after work."),
    ("Zeinab Kashi", "zeinab", "female", "Looking for active guild-style groups."),
    ("Parsa Jam", "parsa", "male", "Mostly online in the evenings."),
    ("Maya Lopez", "maya", "female", "Casual by default, sweaty on weekends."),
    ("Luca Moretti", "luca", "male", "Can fill any role."),
]

LOCATIONS = [
    "Istanbul",
    "Tehran",
    "Dubai",
    "Berlin",
    "Toronto",
    "Doha",
    "London",
    "Paris",
    "Ankara",
    "Amsterdam",
]

LANGUAGES = [
    ["en"],
    ["fa", "en"],
    ["tr", "en"],
    ["ar", "en"],
    ["en", "it"],
]

PLATFORMS = [
    "PC",
    "PlayStation 5",
    "Xbox Series X",
    "Nintendo Switch",
    "Mobile",
    "Steam Deck",
    "Cross Platform",
]

CATEGORY_CONFIG = [
    ("Rank", 1),
    ("Role", 2),
    ("Region", 1),
    ("Playstyle", None),
    ("Language", 2),
    ("Mic", 1),
    ("Session", 1),
    ("Goal", 2),
]

ITEM_CONFIG = {
    "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Immortal", "Legend"],
    "Role": ["Duelist", "Support", "Tank", "Sniper", "Entry", "Flex", "Healer"],
    "Region": ["EU", "NA", "MENA", "Asia", "South America"],
    "Playstyle": [
        "Casual",
        "Competitive",
        "Chill",
        "Tryhard",
        "Shotcaller",
        "Objective-Focused",
        "Content",
        "Team Building",
    ],
    "Language": ["English", "Farsi", "Turkish", "Arabic", "Italian", "Mixed"],
    "Mic": ["Mic On", "Mic Optional", "No Mic"],
    "Session": ["Morning", "Afternoon", "Evening", "Late Night", "Weekend"],
    "Goal": ["Rank Push", "Daily Wins", "Practice", "Content", "Team Building"],
}

GAME_CONFIG = [
    {
        "title": "Valorant",
        "platform": "PC",
        "is_cross_platform": False,
        "modes": ["Competitive", "Swiftplay", "Unrated", "Premier"],
        "categories": {
            "Rank": ["Silver", "Gold", "Platinum", "Diamond", "Immortal"],
            "Role": ["Duelist", "Support", "Sniper", "Flex"],
            "Region": ["EU", "MENA"],
            "Playstyle": ["Competitive", "Shotcaller", "Tryhard"],
            "Language": ["English", "Farsi", "Turkish"],
            "Mic": ["Mic On"],
            "Session": ["Evening", "Late Night"],
            "Goal": ["Rank Push", "Team Building"],
        },
    },
    {
        "title": "Counter-Strike 2",
        "platform": "PC",
        "is_cross_platform": False,
        "modes": ["Premier", "Competitive", "Wingman"],
        "categories": {
            "Rank": ["Gold", "Platinum", "Diamond", "Legend"],
            "Role": ["Entry", "Support", "Sniper", "Flex"],
            "Region": ["EU", "MENA"],
            "Playstyle": ["Competitive", "Shotcaller", "Objective-Focused"],
            "Language": ["English", "Turkish", "Mixed"],
            "Mic": ["Mic On"],
            "Session": ["Evening", "Late Night", "Weekend"],
            "Goal": ["Rank Push", "Practice"],
        },
    },
    {
        "title": "Call of Duty Warzone",
        "platform": "Cross Platform",
        "is_cross_platform": True,
        "modes": ["Battle Royale", "Ranked", "Resurgence", "Plunder"],
        "categories": {
            "Rank": ["Bronze", "Gold", "Diamond", "Legend"],
            "Role": ["Support", "Sniper", "Tank", "Flex"],
            "Region": ["EU", "NA", "MENA"],
            "Playstyle": ["Casual", "Competitive", "Objective-Focused"],
            "Language": ["English", "Arabic", "Mixed"],
            "Mic": ["Mic On", "Mic Optional"],
            "Session": ["Afternoon", "Evening", "Weekend"],
            "Goal": ["Daily Wins", "Rank Push", "Content"],
        },
    },
    {
        "title": "PUBG Mobile",
        "platform": "Mobile",
        "is_cross_platform": False,
        "modes": ["Classic", "Arena", "Ranked", "Payload"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum"],
            "Role": ["Support", "Tank", "Sniper"],
            "Region": ["MENA", "Asia"],
            "Playstyle": ["Casual", "Competitive", "Tryhard"],
            "Language": ["English", "Arabic", "Farsi"],
            "Mic": ["Mic On", "Mic Optional"],
            "Session": ["Afternoon", "Evening", "Weekend"],
            "Goal": ["Daily Wins", "Rank Push"],
        },
    },
    {
        "title": "EA Sports FC 26",
        "platform": "PlayStation 5",
        "is_cross_platform": True,
        "modes": ["Ultimate Team", "Clubs", "Seasons", "Rush"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Diamond"],
            "Role": ["Flex", "Support"],
            "Region": ["EU", "MENA"],
            "Playstyle": ["Casual", "Competitive"],
            "Language": ["English", "Arabic", "Turkish"],
            "Mic": ["Mic Optional", "No Mic"],
            "Session": ["Evening", "Weekend"],
            "Goal": ["Daily Wins", "Content", "Team Building"],
        },
    },
    {
        "title": "Rocket League",
        "platform": "Cross Platform",
        "is_cross_platform": True,
        "modes": ["Ranked 2v2", "Ranked 3v3", "Dropshot", "Casual"],
        "categories": {
            "Rank": ["Silver", "Gold", "Platinum", "Diamond", "Legend"],
            "Role": ["Flex", "Support", "Entry"],
            "Region": ["EU", "NA", "MENA"],
            "Playstyle": ["Casual", "Competitive", "Chill"],
            "Language": ["English", "Mixed"],
            "Mic": ["Mic On", "Mic Optional"],
            "Session": ["Evening", "Late Night"],
            "Goal": ["Rank Push", "Practice"],
        },
    },
    {
        "title": "League of Legends",
        "platform": "PC",
        "is_cross_platform": False,
        "modes": ["Solo Queue", "Flex Queue", "ARAM", "Clash"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            "Role": ["Support", "Tank", "Flex", "Healer"],
            "Region": ["EU", "MENA"],
            "Playstyle": ["Competitive", "Casual", "Shotcaller"],
            "Language": ["English", "Turkish", "Mixed"],
            "Mic": ["Mic Optional", "No Mic"],
            "Session": ["Evening", "Weekend"],
            "Goal": ["Rank Push", "Practice", "Team Building"],
        },
    },
    {
        "title": "Dota 2",
        "platform": "PC",
        "is_cross_platform": False,
        "modes": ["Ranked", "Turbo", "All Pick", "Captains Mode"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            "Role": ["Support", "Tank", "Flex", "Healer"],
            "Region": ["EU", "MENA", "Asia"],
            "Playstyle": ["Competitive", "Shotcaller", "Objective-Focused"],
            "Language": ["English", "Farsi", "Mixed"],
            "Mic": ["Mic On", "Mic Optional"],
            "Session": ["Late Night", "Weekend"],
            "Goal": ["Practice", "Rank Push"],
        },
    },
    {
        "title": "Fortnite",
        "platform": "Cross Platform",
        "is_cross_platform": True,
        "modes": ["Battle Royale", "Zero Build", "Ranked", "Reload"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            "Role": ["Entry", "Support", "Flex", "Sniper"],
            "Region": ["EU", "NA", "MENA"],
            "Playstyle": ["Casual", "Competitive", "Content"],
            "Language": ["English", "Arabic", "Mixed"],
            "Mic": ["Mic On", "Mic Optional"],
            "Session": ["Afternoon", "Evening", "Weekend"],
            "Goal": ["Daily Wins", "Content", "Rank Push"],
        },
    },
    {
        "title": "Apex Legends",
        "platform": "Cross Platform",
        "is_cross_platform": True,
        "modes": ["Ranked", "Trios", "Duos", "Mixtape"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            "Role": ["Entry", "Support", "Sniper", "Flex"],
            "Region": ["EU", "NA", "MENA"],
            "Playstyle": ["Competitive", "Casual", "Shotcaller"],
            "Language": ["English", "Mixed"],
            "Mic": ["Mic On", "Mic Optional"],
            "Session": ["Evening", "Late Night"],
            "Goal": ["Rank Push", "Daily Wins", "Content"],
        },
    },
    {
        "title": "Overwatch 2",
        "platform": "Cross Platform",
        "is_cross_platform": True,
        "modes": ["Competitive", "Quick Play", "Arcade", "Open Queue"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            "Role": ["Tank", "Support", "Flex", "Healer"],
            "Region": ["EU", "NA", "MENA"],
            "Playstyle": ["Casual", "Competitive", "Team Building"],
            "Language": ["English", "Arabic", "Mixed"],
            "Mic": ["Mic On", "Mic Optional", "No Mic"],
            "Session": ["Afternoon", "Evening", "Weekend"],
            "Goal": ["Practice", "Rank Push", "Team Building"],
        },
    },
    {
        "title": "Rainbow Six Siege",
        "platform": "PC",
        "is_cross_platform": False,
        "modes": ["Ranked", "Standard", "Quick Match", "Arcade"],
        "categories": {
            "Rank": ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            "Role": ["Support", "Entry", "Sniper", "Flex"],
            "Region": ["EU", "MENA"],
            "Playstyle": ["Competitive", "Shotcaller", "Objective-Focused"],
            "Language": ["English", "Turkish", "Farsi"],
            "Mic": ["Mic On"],
            "Session": ["Evening", "Late Night", "Weekend"],
            "Goal": ["Rank Push", "Practice", "Team Building"],
        },
    },
]

NOTIFICATION_TEMPLATES = [
    ("Welcome to Player2", "Your demo account is ready to explore matches and chats.", {"type": "welcome"}),
    ("New Match Suggestions", "We found a few fresh LFG posts that fit your profile.", {"type": "recommendation"}),
    ("Profile Complete", "Add account IDs and game preferences to get better matches.", {"type": "profile"}),
]

FEEDBACK_TYPES = ["bug", "suggestion", "technical", "complaint"]
SPECIAL_USERS = [
    {
        "email": "admin@demo.player2.local",
        "username": "demo_admin",
        "display_name": "Demo Admin",
        "gender": "none",
        "about_me": "Admin account for dashboard and moderation testing.",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "moderator@demo.player2.local",
        "username": "demo_moderator",
        "display_name": "Demo Moderator",
        "gender": "none",
        "about_me": "Moderator account for review and support flows.",
        "is_staff": True,
        "is_superuser": False,
    },
    {
        "email": "tester1@demo.player2.local",
        "username": "demo_tester1",
        "display_name": "Demo Tester One",
        "gender": "none",
        "about_me": "Stable QA account for login and profile testing.",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "email": "tester2@demo.player2.local",
        "username": "demo_tester2",
        "display_name": "Demo Tester Two",
        "gender": "none",
        "about_me": "Stable QA account for chat and LFG testing.",
        "is_staff": False,
        "is_superuser": False,
    },
]


class Command(BaseCommand):
    help = "Seed the database with substantial demo data for local development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--users",
            type=int,
            default=100,
            help="Number of demo users to create or update.",
        )

    def handle(self, *args, **options):
        self.summary = {}

        with transaction.atomic():
            self.seed_defaults()
            platforms = self.seed_platforms()
            categories = self.seed_categories()
            items_by_category = self.seed_items(categories)
            games = self.seed_games(platforms, categories, items_by_category)
            self.seed_filter_categories(categories)
            users = self.seed_users(options["users"])
            users.extend(self.seed_special_users())
            self.seed_account_ids(users, platforms)
            self.seed_lfg(users, games)
            self.seed_notifications(users)
            self.seed_feedback(users)
            self.seed_social_graph(users)
            self.seed_chats(users)

        self.stdout.write(self.style.SUCCESS("Demo seed completed."))
        for key in sorted(self.summary):
            self.stdout.write(f"- {key}: {self.summary[key]}")

    def count(self, label, created):
        self.summary[label] = self.summary.get(label, 0) + int(bool(created))

    def image_file(self, name):
        return ContentFile(TINY_PNG, name=name)

    def ensure_image(self, instance, field_name, filename):
        field = getattr(instance, field_name)
        if field:
            return
        field.save(filename, self.image_file(filename), save=True)

    def save_if_changed(self, instance, changed_fields):
        if changed_fields:
            instance.save(update_fields=changed_fields)

    def seed_defaults(self):
        profile, created = DefaultProfileImage.objects.get_or_create(id=1)
        self.count("default_profile_images", created)
        self.ensure_image(profile, "image", "default-profile.png")

        cover, created = DefaultCoverImage.objects.get_or_create(id=1)
        self.count("default_cover_images", created)
        self.ensure_image(cover, "image", "default-cover.png")

    def seed_platforms(self):
        platforms = {}
        for title in PLATFORMS:
            platform, created = Platform.objects.get_or_create(title=title)
            self.count("platforms", created)
            self.ensure_image(platform, "logo", f"platform-{self.slug(title)}.png")
            platforms[title] = platform
        return platforms

    def seed_categories(self):
        categories = {}
        for title, limit in CATEGORY_CONFIG:
            category, created = Category.objects.get_or_create(
                title=title,
                defaults={"limit": limit},
            )
            changed_fields = []
            if category.limit != limit:
                category.limit = limit
                changed_fields.append("limit")
            self.save_if_changed(category, changed_fields)
            self.count("categories", created)
            categories[title] = category
        return categories

    def seed_items(self, categories):
        items_by_category = {}
        for category_title, titles in ITEM_CONFIG.items():
            category = categories[category_title]
            items_by_category[category_title] = []
            for title in titles:
                item, created = Item.objects.get_or_create(
                    category=category,
                    title=title,
                )
                self.count("items", created)
                self.ensure_image(
                    item,
                    "icon",
                    f"item-{self.slug(category_title)}-{self.slug(title)}.png",
                )
                items_by_category[category_title].append(item)
        return items_by_category

    def game_item_limit(self, category_title):
        limit_map = {
            "Rank": 1,
            "Role": 2,
            "Region": 1,
            "Playstyle": -1,
            "Language": 2,
            "Mic": 1,
            "Session": 1,
            "Goal": 2,
        }
        return limit_map[category_title]

    def seed_games(self, platforms, categories, items_by_category):
        games = {}
        for entry in GAME_CONFIG:
            game, created = Game.objects.get_or_create(
                title=entry["title"],
                defaults={
                    "platforms": platforms[entry["platform"]],
                    # "is_cross_platform": entry["is_cross_platform"],
                },
            )
            changed_fields = []
            expected_platform = platforms[entry["platform"]]
            if game.platform_id != expected_platform.id:
                game.platform = expected_platform
                changed_fields.append("platform")
            if game.is_cross_platform != entry["is_cross_platform"]:
                game.is_cross_platform = entry["is_cross_platform"]
                changed_fields.append("is_cross_platform")
            self.save_if_changed(game, changed_fields)

            self.count("games", created)
            self.ensure_image(game, "cover", f"game-{self.slug(game.title)}.png")

            for category_title, item_titles in entry["categories"].items():
                game_category, gc_created = GameCategory.objects.get_or_create(
                    game=game,
                    category=categories[category_title],
                    defaults={"item_limit": self.game_item_limit(category_title)},
                )
                changed_fields = []
                expected_limit = self.game_item_limit(category_title)
                if game_category.item_limit != expected_limit:
                    game_category.item_limit = expected_limit
                    changed_fields.append("item_limit")
                self.save_if_changed(game_category, changed_fields)
                self.count("game_categories", gc_created)

                category_items = {
                    item.title: item for item in items_by_category[category_title]
                }
                for item_title in item_titles:
                    _, link_created = GameCategoryItem.objects.get_or_create(
                        game_category=game_category,
                        item=category_items[item_title],
                    )
                    self.count("game_category_items", link_created)

            for mode_title in entry["modes"]:
                _, mode_created = GameMode.objects.get_or_create(
                    game=game,
                    title=mode_title,
                )
                self.count("game_modes", mode_created)

            games[game.title] = game
        return games

    def seed_filter_categories(self, categories):
        for order, category in enumerate(categories.values(), start=1):
            config, created = FilterCategory.objects.get_or_create(
                category=category,
                defaults={"order": order, "is_active": True},
            )
            changed_fields = []
            if config.order != order:
                config.order = order
                changed_fields.append("order")
            if not config.is_active:
                config.is_active = True
                changed_fields.append("is_active")
            self.save_if_changed(config, changed_fields)
            self.count("filter_categories", created)

    def build_user_profiles(self, count):
        profiles = []
        for index in range(count):
            if index < len(USER_PROFILES):
                display_name, username, gender, about_me = USER_PROFILES[index]
            else:
                display_name = f"Demo Player {index + 1}"
                username = f"demo{index + 1}"
                gender = "male" if index % 2 == 0 else "female"
                about_me = "Looking for active teammates and steady sessions."
            profiles.append((display_name, username, gender, about_me))
        return profiles

    def seed_users(self, count):
        users = []
        profiles = self.build_user_profiles(count)
        for index, profile in enumerate(profiles, start=1):
            display_name, username, gender, about_me = profile
            email = f"{username}@demo.player2.local"
            last_activity = timezone.now() - timedelta(minutes=index * 2)
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "display_name": display_name,
                    "username": username,
                    "gender": gender,
                    "about_me": about_me,
                    "location": LOCATIONS[(index - 1) % len(LOCATIONS)],
                    "languages": LANGUAGES[(index - 1) % len(LANGUAGES)],
                    "auth_provider": "email",
                    "date_of_birth": date(1990 + (index % 10), ((index - 1) % 12) + 1, ((index + 5) % 27) + 1),
                    "last_activity": last_activity,
                },
            )
            changed_fields = []
            updates = {
                "display_name": display_name,
                "username": username,
                "gender": gender,
                "about_me": about_me,
                "location": LOCATIONS[(index - 1) % len(LOCATIONS)],
                "languages": LANGUAGES[(index - 1) % len(LANGUAGES)],
                "last_activity": last_activity,
            }
            for field, value in updates.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed_fields.append(field)
            if created:
                user.set_password("DemoPass123!")
                user.save()
            else:
                self.save_if_changed(user, changed_fields)
            self.count("users", created)
            self.ensure_image(user, "profile_image", f"user-{username}-profile.png")
            self.ensure_image(user, "cover_image", f"user-{username}-cover.png")
            users.append(user)
        return users

    def seed_special_users(self):
        users = []
        for index, config in enumerate(SPECIAL_USERS, start=1):
            last_activity = timezone.now() - timedelta(minutes=index)
            user, created = User.objects.get_or_create(
                email=config["email"],
                defaults={
                    "display_name": config["display_name"],
                    "username": config["username"],
                    "gender": config["gender"],
                    "about_me": config["about_me"],
                    "location": LOCATIONS[index % len(LOCATIONS)],
                    "languages": ["en"],
                    "auth_provider": "email",
                    "date_of_birth": date(1992, index, min(index + 10, 28)),
                    "last_activity": last_activity,
                    "is_staff": config["is_staff"],
                    "is_superuser": config["is_superuser"],
                },
            )
            changed_fields = []
            updates = {
                "display_name": config["display_name"],
                "username": config["username"],
                "gender": config["gender"],
                "about_me": config["about_me"],
                "location": LOCATIONS[index % len(LOCATIONS)],
                "languages": ["en"],
                "last_activity": last_activity,
                "is_staff": config["is_staff"],
                "is_superuser": config["is_superuser"],
            }
            for field, value in updates.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed_fields.append(field)
            if created:
                user.set_password("DemoPass123!")
                user.save()
            else:
                self.save_if_changed(user, changed_fields)
            self.count("special_users", created)
            self.ensure_image(user, "profile_image", f"user-{config['username']}-profile.png")
            self.ensure_image(user, "cover_image", f"user-{config['username']}-cover.png")
            users.append(user)
        return users

    def seed_account_ids(self, users, platforms):
        platform_cycle = list(platforms.values())
        for index, user in enumerate(users):
            platform_count = 2 + (index % 3)
            for platform in platform_cycle[:platform_count]:
                _, created = AccountID.objects.get_or_create(
                    owner=user,
                    platform=platform,
                    username=f"{user.username}_{self.slug(platform.title)}",
                )
                self.count("account_ids", created)

    def seed_lfg(self, users, games):
        game_list = list(games.values())
        lfg_target = min(len(users), max(40, len(game_list) * 4))
        for index, user in enumerate(users[:lfg_target]):
            game = game_list[index % len(game_list)]
            mode_list = list(game.modes.order_by("id"))
            mode = mode_list[index % len(mode_list)] if mode_list else None
            lfg, created = LFG.objects.get_or_create(
                owner=user,
                defaults={
                    "game": game,
                    "platform": game.platform,
                    "allow_cross_play": game.is_cross_platform,
                    "mic_enabled": index % 3 != 0,
                    "game_mode": mode,
                    "description": (
                        f"{user.display_name} is looking for teammates for {game.title}. "
                        f"Usually online during {['morning', 'afternoon', 'evening', 'late night'][index % 4]}."
                    ),
                    "bumped_at": timezone.now() - timedelta(hours=index + 1),
                },
            )
            changed_fields = []
            if lfg.game_id != game.id:
                lfg.game = game
                changed_fields.append("game")
            if lfg.platform_id != game.platform_id:
                lfg.platform = game.platform
                changed_fields.append("platform")
            if lfg.allow_cross_play != game.is_cross_platform:
                lfg.allow_cross_play = game.is_cross_platform
                changed_fields.append("allow_cross_play")
            if lfg.game_mode_id != (mode.id if mode else None):
                lfg.game_mode = mode
                changed_fields.append("game_mode")
            self.save_if_changed(lfg, changed_fields)
            self.count("lfg_posts", created)

            for gc_index, game_category in enumerate(game.game_categories.order_by("id")):
                category_items = list(game_category.items.order_by("id"))
                if not category_items:
                    continue
                pick_count = 1
                if game_category.item_limit not in (-1, 1):
                    pick_count = min(game_category.item_limit, 2, len(category_items))
                elif game_category.item_limit == -1:
                    pick_count = min(2, len(category_items))
                start = (index + gc_index) % len(category_items)
                selected = []
                for offset in range(pick_count):
                    selected.append(category_items[(start + offset) % len(category_items)])
                for game_category_item in selected:
                    _, link_created = LFGSelectedItem.objects.get_or_create(
                        lfg=lfg,
                        game_category_item=game_category_item,
                    )
                    self.count("lfg_selected_items", link_created)

    def seed_notifications(self, users):
        device_types = ["android", "ios", "web"]
        for index, user in enumerate(users):
            device_count = 1 + (index % 3)
            for device_index in range(device_count):
                token = f"demo-device-token-{user.username}-{device_index + 1}"
                device, created = Device.objects.get_or_create(
                    token=token,
                    defaults={
                        "user": user,
                        "device_type": device_types[(index + device_index) % len(device_types)],
                    },
                )
                changed_fields = []
                expected_type = device_types[(index + device_index) % len(device_types)]
                if device.user_id != user.id:
                    device.user = user
                    changed_fields.append("user")
                if device.device_type != expected_type:
                    device.device_type = expected_type
                    changed_fields.append("device_type")
                self.save_if_changed(device, changed_fields)
                self.count("devices", created)

            for title, body, data in NOTIFICATION_TEMPLATES:
                _, created = Notification.objects.get_or_create(
                    user=user,
                    title=title,
                    defaults={
                        "body": body,
                        "data": data,
                        "is_read": (index + len(title)) % 2 == 0,
                    },
                )
                self.count("notifications", created)

    def seed_feedback(self, users):
        feedback_target = min(30, len(users))
        for index, user in enumerate(users[:feedback_target]):
            feedback_type = FEEDBACK_TYPES[index % len(FEEDBACK_TYPES)]
            _, created = Feedback.objects.get_or_create(
                email=user.email,
                type=feedback_type,
                defaults={
                    "user": user,
                    "description": (
                        f"Demo {feedback_type} report from {user.display_name} about matchmaking, chat, or profile flow."
                    ),
                },
            )
            self.count("feedback_entries", created)

    def seed_social_graph(self, users):
        report_pairs = min(30, max(0, len(users) - 1))
        for index in range(report_pairs):
            _, created = UserReport.objects.get_or_create(
                reporter=users[index],
                reported_user=users[(index + 1) % len(users)],
                defaults={"message": f"Demo moderation report #{index + 1}."},
            )
            self.count("user_reports", created)

        block_pairs = min(20, max(0, len(users) - 2))
        for index in range(block_pairs):
            _, created = UserBlock.objects.get_or_create(
                user=users[index + 2],
                blocked_user=users[(index + 5) % len(users)],
            )
            self.count("user_blocks", created)

    def seed_chats(self, users):
        chat_pairs = []
        for index in range(0, len(users) - 1, 2):
            chat_pairs.append((users[index], users[index + 1]))
        for index in range(0, len(users) - 3, 3):
            chat_pairs.append((users[index], users[index + 2]))
        chat_pairs = chat_pairs[: min(40, len(chat_pairs))]

        message_templates = [
            ("user", "Hey {name}, are you still down for {game}?"),
            ("recipient", "Yep, I can queue in about 10 minutes."),
            ("user", "Perfect. I usually prefer players with clear comms."),
            ("recipient", "Same here. I can flex if needed."),
            ("user", "Nice, I will send the lobby details now."),
        ]

        for index, (left, right) in enumerate(chat_pairs):
            game_name = GAME_CONFIG[index % len(GAME_CONFIG)]["title"]
            chat, created = Chat.objects.get_or_create(
                session_id=f"demo-chat-{left.username}-{right.username}",
                defaults={
                    "user1": left,
                    "user2": right,
                    "title": f"{left.display_name} & {right.display_name}",
                },
            )
            self.count("chats", created)

            for template_index, (msg_type, template) in enumerate(message_templates):
                sender = left if msg_type == "user" else right
                content = template.format(name=right.display_name, game=game_name)
                _, message_created = Message.objects.get_or_create(
                    chat=chat,
                    sender=sender,
                    content=content,
                    defaults={"type": msg_type},
                )
                self.count("messages", message_created)

                if template_index == 1:
                    follow_up = f"I mostly play {game_name} on weekends too."
                    _, extra_created = Message.objects.get_or_create(
                        chat=chat,
                        sender=right,
                        content=follow_up,
                        defaults={"type": "recipient"},
                    )
                    self.count("messages", extra_created)

    def slug(self, value):
        return value.lower().replace(" ", "-")
