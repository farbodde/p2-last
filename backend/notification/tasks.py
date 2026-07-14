# tasks.py
from celery import shared_task
from firebase_admin import messaging
from .models import Device, Notification


@shared_task(bind=True, max_retries=3)
def send_push_notification(self, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)
        devices = Device.objects.filter(user=notification.user)

        tokens = [d.token for d in devices]

        if not tokens:
            return

        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=notification.title,
                body=notification.body,
            ),
            data={str(k): str(v) for k, v in notification.data.items()},
            tokens=tokens,
        )

        messaging.send_multicast(message)

        notification.is_sent = True
        notification.save()

    except Exception as e:
        raise self.retry(exc=e, countdown=5)



# def notify_user(user, title, body, data=None):
#     notification = Notification.objects.create(
#         user=user,
#         title=title,
#         body=body,
#         data=data or {},
#     )
#     send_push_notification.delay(notification.id)



# notify_user(
#     user=admin,
#     title="New Game Added",
#     body=game.title,
# )

