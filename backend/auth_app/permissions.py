from rest_framework.permissions import BasePermission



class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="admin").exists()
        )
    
# class IsPlayer(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.groups.filter(name="player").exists()


# class IsYoutuber(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.groups.filter(name="youtuber").exists()


# class IsPremiumUser(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.groups.filter(name="premium_user").exists()
