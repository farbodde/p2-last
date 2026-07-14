#feed_back/urls.py
from django.urls import path
from .views import (
    SubmitFeedbackView, 
    FeedbackListView, 
    FeedbackDeleteView,
    FeedbackBulkDeleteView
)

urlpatterns = [
    path("submit/", SubmitFeedbackView.as_view(), name="submit-feedback"),
    path("list/", FeedbackListView.as_view(), name="list-feedback"),
    path("delete/<int:feedback_id>/", FeedbackDeleteView.as_view(), name="delete-feedback"),
    path("bulk-delete/", FeedbackBulkDeleteView.as_view(), name="bulk-delete-feedback"),
]