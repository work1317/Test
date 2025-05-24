from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from django.core.exceptions import ObjectDoesNotExist

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to token
        token['username'] = user.username
        token['email'] = user.email

        # Add user's groups as roles (list)
        token['groups'] = list(user.groups.values_list('name', flat=True))

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'groups': list(self.user.groups.values_list('name', flat=True))
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        new_password = request.data.get('new_password')

        if not username or not new_password:
            return Response({"error": "Username and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate that the password meets requirements
        if len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find the user by username
        try:
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Set the new password
        user.password = make_password(new_password)  # Hashing the new password
        user.save()

        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
