#feed_back/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .models import Feedback
from .serializers import FeedbackCreateSerializer, FeedbackListSerializer

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SubmitFeedbackView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request):
        serializer = FeedbackCreateSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Feedback submitted successfully"},
            status=status.HTTP_201_CREATED
        )
from auth_app.permissions import IsAdmin
class FeedbackListView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]  # Only authenticated users can view feedbacks
    pagination_class = CustomPagination
    
    def get(self, request):
        # Optionally filter by feedback type if provided
        feedback_type = request.query_params.get('type', None)
        
        if feedback_type:
            feedbacks = Feedback.objects.filter(type=feedback_type).order_by('-created_at')
        else:
            feedbacks = Feedback.objects.all().order_by('-created_at')
        
        # Apply pagination
        paginator = self.pagination_class()
        paginated_feedbacks = paginator.paginate_queryset(feedbacks, request)
        
        # Serialize the paginated data
        serializer = FeedbackListSerializer(paginated_feedbacks, many=True)
        
        return paginator.get_paginated_response(serializer.data)

class FeedbackDeleteView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]  # Only authenticated users can delete

    def delete(self, request, feedback_id):
        feedback = get_object_or_404(Feedback, id=feedback_id)
        
        # Optional: Add additional permission check (e.g., only admin or owner can delete)
        # if not request.user.is_staff and feedback.user != request.user:
        #     return Response(
        #         {"error": "You don't have permission to delete this feedback"},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        feedback.delete()
        
        return Response(
            {"message": "Feedback deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

# Optional: Bulk delete endpoint
class FeedbackBulkDeleteView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    
    def delete(self, request):
        feedback_ids = request.data.get('feedback_ids', [])
        
        if not feedback_ids:
            return Response(
                {"error": "No feedback IDs provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete feedbacks with the given IDs
        deleted_count, _ = Feedback.objects.filter(id__in=feedback_ids).delete()
        
        return Response(
            {"message": f"{deleted_count} feedback(s) deleted successfully"},
            status=status.HTTP_200_OK
        )