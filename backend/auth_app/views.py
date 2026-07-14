from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import ListAPIView

from .models import User,UserReport
from .serializers import SignupSerializer, ForgetPasswordSerializer, ReportListSerializer
from .jwt import EmailTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from .serializers import ChangePasswordSerializer
from core.settings import DEFAULT_FROM_EMAIL
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()

        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK
        )

class SignupView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Signup successful"},
            status=status.HTTP_201_CREATED
        )


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = []


class ForgetPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = ForgetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(email=serializer.validated_data["email"]).first()

        if user:
            temp_password = get_random_string(10)
            user.set_password(temp_password)
            user.save()

            send_mail(
                "Password Reset",
                f"Temporary password: {temp_password}",
                DEFAULT_FROM_EMAIL,  # ← instead of hardcoded "no-reply@example.com"
                [user.email],
            )

        return Response(
            {"message": "If the email exists, a reset email was sent"},
            status=status.HTTP_200_OK
        )


from .serializers import ProfileSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserReportSerializer


class ReportUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserReportSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "User reported successfully"},
            status=status.HTTP_201_CREATED,
        )
    



from django.contrib.auth import get_user_model

from .models import UserBlock

User = get_user_model()


class BlockUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")

        try:
            blocked_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if blocked_user == request.user:
            return Response(
                {"detail": "You cannot block yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        UserBlock.objects.get_or_create(
            user=request.user,
            blocked_user=blocked_user,
        )

        return Response(
            {"detail": "User blocked"},
            status=status.HTTP_200_OK,
        )

class UnblockUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")

        try:
            blocked_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        UserBlock.objects.filter(
            user=request.user,
            blocked_user=blocked_user,
        ).delete()

        return Response(
            {"detail": "User unblocked"},
            status=status.HTTP_200_OK,
        )


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserBlock
from .serializers import BlockedUserSerializer
from .pagination import CustomPagination  # 👈 اضافه کن


class BlockedUsersListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        blocked_users = UserBlock.objects.filter(
            user=request.user
        ).select_related("blocked_user")

        users = User.objects.filter(
    blocked_by__user=request.user
)

        paginator = CustomPagination()
        page = paginator.paginate_queryset(users, request)

        serializer = BlockedUserSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)
    
    

from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser


class ReportListPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ReportListAPIView(APIView):
    permission_classes = [IsAdminUser]  # Only admin can view all reports
    pagination_class = ReportListPagination
    
    def get(self, request):
        # Get all reports ordered by most recent
        reports = UserReport.objects.all().order_by('-created_at')
        
        # Apply pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(reports, request)
        
        # Serialize the data
        serializer = ReportListSerializer(page, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data)
    
class ReportDeleteAPIView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            report = UserReport.objects.get(id=pk)
            report.delete()
            return Response({"detail": "Report deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except UserReport.DoesNotExist:
            return Response({"detail": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

        

from auth_app.models import AccountID
from auth_app.serializers import AccountIDSerializer


class CreateAccountIDAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AccountIDSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AccountID.objects.create(
            owner=request.user,
            platform=serializer.validated_data["platform"],
            username=serializer.validated_data["username"],
        )

        return Response(
            {"detail": "AccountID created successfully"},
            status=status.HTTP_201_CREATED,
        )
    



class MyAccountIDListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountIDSerializer

    def get_queryset(self):
        return AccountID.objects.filter(owner=self.request.user)
    



from django.shortcuts import get_object_or_404

class DeleteAccountIDAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        account_id = get_object_or_404(AccountID, pk=pk, owner=request.user)
        account_id.delete()
        return Response({"detail": "AccountID deleted"}, status=status.HTTP_200_OK)
    


from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import GoogleAuthSerializer

class GoogleAuthView(APIView):
    permission_classes = []
    
    def post(self, request):
        """
        Authenticate user with Google OAuth token
        
        Expected payload:
        {
            "token": "google-id-token"
        }
        """
        serializer = GoogleAuthSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'display_name': user.display_name,
                    'username': user.username,
                    'profile_image': user.profile_image.url if user.profile_image else None,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


class DeleteMyAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        # اگر خواستی logout هم انجام بشه (اختیاری)
        request.auth.delete()  # برای TokenAuth

        user.delete()

        return Response(
            {"detail": "Your account has been deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    

from .serializers import PublicProfileSerializer
from rest_framework.permissions import AllowAny


class UserProfileByUsernameAPIView(APIView):
    permission_classes = [AllowAny]  # or [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PublicProfileSerializer(user)
        return Response(serializer.data)