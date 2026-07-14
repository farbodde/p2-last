from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .serializers import LanguageSerializer
from .constants.languages import LANGUAGES
from .constants.countries import COUNTRIES



class LanguageListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        serializer = LanguageSerializer(LANGUAGES, many=True)
        return Response(serializer.data)
    

class CountryistView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        serializer = LanguageSerializer(COUNTRIES, many=True)
        return Response(serializer.data)
    
