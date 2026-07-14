import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError


class Command(BaseCommand):
    help = 'Creates a superuser from environment variables'

    def handle(self, *args, **options):
        User = get_user_model()
        
        username = os.environ.get('SUPERUSER_USERNAME')
        password = os.environ.get('SUPERUSER_PASSWORD')
        email = os.environ.get('SUPERUSER_EMAIL')

        if not all([username, password, email]):
            self.stdout.write(
                self.style.WARNING('Superuser credentials not found in environment variables')
            )
            return

        try:
            # Check if superuser already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'Superuser "{username}" already exists')
                )
                return
            
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created superuser "{username}"')
            )
        except IntegrityError:
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )