#auth_app/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("none", "Prefer not to say"),
    ]

    
    auth_provider = models.CharField(
    max_length=50, 
    default='email',
    choices=[
        ('email', 'Email'),
        ('google', 'Google'),
    ]
)

    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=255)

    username = models.CharField(
        max_length=30,
        unique=True,
        null=True,
        blank=True,
    )
    username_updated_at = models.DateTimeField(null=True, blank=True)

    profile_image = models.ImageField(
        upload_to="users/profile/",
        null=True,
        blank=True,
    )
    cover_image = models.ImageField(
        upload_to="users/cover/",
        null=True,
        blank=True,
    )

    about_me = models.TextField(blank=True)
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default="none",
    )
    date_of_birth = models.DateField(null=True, blank=True)

    location = models.CharField(max_length=255, blank=True)
    # latitude = models.DecimalField(
    #     max_digits=9, decimal_places=6, null=True, blank=True
    # )
    # longitude = models.DecimalField(
    #     max_digits=9, decimal_places=6, null=True, blank=True
    # )

    languages = models.JSONField(default=list)  # ["en", "fa"]

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)


    last_activity = models.DateTimeField(null=True, blank=True)
    
    @property
    def is_online(self):
        if self.last_activity:
            # Consider user online if active in last 5 minutes
            return (timezone.now() - self.last_activity).seconds < 300
        return False

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def can_change_username(self):
        if not self.username_updated_at:
            return True
        return (timezone.now() - self.username_updated_at).days >= 10

    def __str__(self):
        return self.email
    
class DefaultProfileImage(models.Model):
    image = models.ImageField(upload_to="defaults/profile/")


class DefaultCoverImage(models.Model):
    image = models.ImageField(upload_to="defaults/cover/")
    




from django.contrib.auth import get_user_model

User = get_user_model()


class UserReport(models.Model):
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reports_made",
    )
    reported_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reports_received",
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reporter} -> {self.reported_user}"


class UserReportImage(models.Model):
    report = models.ForeignKey(
        UserReport,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="reports/")


# models.py
class UserBlock(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blocks",
    )
    blocked_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blocked_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "blocked_user")

    def __str__(self):
        return f"{self.user} blocked {self.blocked_user}"





# accounts/models.py
from django.conf import settings
from django.db import models
from games.models import Platform   # adjust import if needed
from django.contrib.auth import get_user_model

User = get_user_model()


class AccountID(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="account_ids",
    )
    platform = models.ForeignKey(
        Platform,
        on_delete=models.CASCADE,
        related_name="account_ids",
    )
    username = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("owner", "platform", "username")

    def __str__(self):
        return f"{self.owner} - {self.platform.title} - {self.username}"




def has_usable_password(self):
    """Check if user has a usable password (not OAuth user)"""
    return super().has_usable_password()