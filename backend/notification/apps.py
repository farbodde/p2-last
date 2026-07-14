from django.apps import AppConfig

class NotificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notification'

    def ready(self):
        import firebase_admin
        from firebase_admin import credentials
        from core.settings import FIREBASE_CREDENTIALS_PATH

        if not firebase_admin._apps:
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)