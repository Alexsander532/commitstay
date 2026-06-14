from django.db.models import Avg, Count
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from bookings.models import Booking

from .filters import PropertyFilter
from .models import Amenity, Favorite, Property
from .permissions import IsHostOrReadOnly, IsOwnerOrReadOnly
from .serializers import (
    AmenitySerializer,
    BookedRangeSerializer,
    FavoriteSerializer,
    PropertyDetailSerializer,
    PropertyListSerializer,
    ReviewSerializer,
)


@extend_schema_view(
    list=extend_schema(
        tags=["Imóveis"],
        summary="Listar imóveis com filtros avançados",
        parameters=[
            OpenApiParameter("city", str, description="Cidade (busca parcial)"),
            OpenApiParameter("check_in", str, description="Data de entrada (YYYY-MM-DD)"),
            OpenApiParameter("check_out", str, description="Data de saída (YYYY-MM-DD)"),
            OpenApiParameter("guests", int, description="Quantidade de hóspedes"),
            OpenApiParameter("min_price", float, description="Preço mínimo da diária"),
            OpenApiParameter("max_price", float, description="Preço máximo da diária"),
            OpenApiParameter(
                "ordering", str,
                description="-avg_rating (padrão), price_per_night, -price_per_night, -created_at",
            ),
        ],
    ),
    retrieve=extend_schema(tags=["Imóveis"], summary="Detalhar imóvel"),
    create=extend_schema(tags=["Imóveis"], summary="Cadastrar imóvel (anfitrião)"),
    update=extend_schema(tags=["Imóveis"], summary="Atualizar imóvel (dono)"),
    partial_update=extend_schema(tags=["Imóveis"], summary="Atualizar parcialmente (dono)"),
    destroy=extend_schema(tags=["Imóveis"], summary="Desativar imóvel (dono)"),
)
class PropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsHostOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = PropertyFilter
    ordering_fields = ["avg_rating", "price_per_night", "created_at", "review_count"]
    ordering = ["-avg_rating", "-review_count", "-created_at"]

    def get_queryset(self):
        qs = (
            Property.objects.select_related("host")
            .prefetch_related("photos", "amenities")
            .annotate(avg_rating=Avg("reviews__rating"), review_count=Count("reviews"))
        )
        if self.action == "list":
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list" or self.action == "mine":
            return PropertyListSerializer
        return PropertyDetailSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])

    @extend_schema(
        tags=["Imóveis"],
        summary="Datas já reservadas (reservas aprovadas)",
        responses=BookedRangeSerializer(many=True),
    )
    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="booked-dates")
    def booked_dates(self, request, pk=None):
        ranges = Booking.objects.filter(
            property_id=pk, status=Booking.Status.APPROVED
        ).values("check_in", "check_out")
        return Response(BookedRangeSerializer(ranges, many=True).data)

    @extend_schema(
        tags=["Imóveis"],
        summary="Avaliações do imóvel",
        responses=ReviewSerializer(many=True),
    )
    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def reviews(self, request, pk=None):
        prop = self.get_object()
        return Response(ReviewSerializer(prop.reviews.select_related("author"), many=True).data)

    @extend_schema(
        tags=["Imóveis"],
        summary="Meus imóveis (anfitrião)",
        responses=PropertyListSerializer(many=True),
    )
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        qs = self.get_queryset().filter(host=request.user)
        return Response(PropertyListSerializer(qs, many=True).data)


@extend_schema_view(
    list=extend_schema(tags=["Imóveis"], summary="Listar comodidades disponíveis"),
)
class AmenityViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = []


class IsGuest(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == "guest"


@extend_schema_view(
    list=extend_schema(
        tags=["Favoritos"],
        summary="Listar imóveis salvos",
        responses=PropertyListSerializer(many=True),
    ),
    create=extend_schema(tags=["Favoritos"], summary="Salvar imóvel nos favoritos"),
    destroy=extend_schema(tags=["Favoritos"], summary="Remover dos favoritos"),
)
class FavoriteViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsGuest]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("property")

    def list(self, request, *args, **kwargs):
        favorites = self.get_queryset()
        props = (
            Property.objects.filter(id__in=favorites.values("property_id"), is_active=True)
            .select_related("host")
            .prefetch_related("photos", "amenities")
            .annotate(avg_rating=Avg("reviews__rating"), review_count=Count("reviews"))
        )
        return Response(PropertyListSerializer(props, many=True).data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=["Favoritos"],
        summary="Verificar se imóvel está salvo",
        responses={200: {"type": "object", "properties": {"is_favorited": {"type": "boolean"}}}},
    )
    @action(detail=False, methods=["get"], url_path="check/(?P<property_id>[^/.]+)")
    def check(self, request, property_id=None):
        exists = Favorite.objects.filter(
            user=request.user, property_id=property_id
        ).exists()
        return Response({"is_favorited": exists})

    @extend_schema(
        tags=["Favoritos"],
        summary="Alternar favorito (salvar/remover)",
        request={"type": "object", "properties": {"property": {"type": "integer"}}},
        responses={200: {"type": "object", "properties": {"is_favorited": {"type": "boolean"}}}},
    )
    @action(detail=False, methods=["post"])
    def toggle(self, request):
        property_id = request.data.get("property")
        if not property_id:
            return Response({"property": ["Este campo é obrigatório."]}, status=400)
        if not Property.objects.filter(id=property_id, is_active=True).exists():
            return Response({"property": ["Imóvel indisponível."]}, status=400)
        fav, created = Favorite.objects.get_or_create(
            user=request.user, property_id=property_id
        )
        if not created:
            fav.delete()
            return Response({"is_favorited": False})
        return Response({"is_favorited": True}, status=201)
