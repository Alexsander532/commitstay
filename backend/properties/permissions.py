from rest_framework import permissions


class IsHostOrReadOnly(permissions.BasePermission):
    """Escrita apenas para usuários com papel de anfitrião."""

    message = "Apenas anfitriões podem cadastrar e gerenciar imóveis."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_host


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Escrita apenas para o dono do imóvel."""

    message = "Você só pode gerenciar seus próprios imóveis."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.host_id == request.user.id
