from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

ROLES = [
    "player",
    "admin",
    "youtuber",
    "premium_user",
]

class Command(BaseCommand):
    help = "Create default user roles"

    def handle(self, *args, **kwargs):
        for role in ROLES:
            Group.objects.get_or_create(name=role)
        self.stdout.write(self.style.SUCCESS("Roles created"))


# python manage.py create_roles