# posts/utils.py
from django.utils.timesince import timesince
from django.utils import timezone

def time_ago(dt):
    if not dt:
        return None
    return f"{timesince(dt, timezone.now()).split(',')[0]} ago"
