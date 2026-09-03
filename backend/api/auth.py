from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["is_staff"] = user.is_staff
        token["username"] = user.get_username()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff:
            raise serializers.ValidationError("Staff access required.")
        data["user"] = {
            "username": self.user.get_username(),
            "is_staff": self.user.is_staff,
        }
        return data
