from datetime import date

from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from properties.models import Review

from .models import Booking
from .serializers import BookingSerializer, ReviewCreateSerializer


@extend_schema_view(
    create=extend_schema(
        tags=["Reservas"],
        summary="Solicitar reserva (hóspede, com dados de pagamento)",
    ),
    list=extend_schema(tags=["Reservas"], summary="Minhas reservas (painel do hóspede)"),
    retrieve=extend_schema(tags=["Reservas"], summary="Detalhar reserva"),
)
class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = []

    def get_queryset(self):
        return (
            Booking.objects.select_related("property", "guest")
            .filter(guest=self.request.user)
        )

    @extend_schema(
        tags=["Reservas"],
        summary="Pedidos recebidos nos meus imóveis (anfitrião)",
        parameters=[
            OpenApiParameter("status", str, description="PENDING, APPROVED, REJECTED ou CANCELLED")
        ],
        responses=BookingSerializer(many=True),
    )
    @action(detail=False, methods=["get"])
    def received(self, request):
        qs = Booking.objects.select_related("property", "guest").filter(
            property__host=request.user
        )
        status_param = request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def _get_host_booking(self, request, pk):
        """Reserva pertencente a um imóvel do anfitrião logado."""
        return Booking.objects.select_related("property").get(
            pk=pk, property__host=request.user
        )

    @extend_schema(tags=["Reservas"], summary="Aprovar reserva (anfitrião dono)", request=None)
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            booking = self._get_host_booking(request, pk)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Reserva não encontrada nos seus imóveis."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Apenas reservas pendentes podem ser aprovadas."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.conflicts_with_approved():
            return Response(
                {"detail": "Conflito com outra reserva já aprovada nesse período."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.APPROVED
        booking.save(update_fields=["status"])
        # RF05.3 — auto-recusa pendentes conflitantes
        Booking.objects.filter(
            property=booking.property,
            status=Booking.Status.PENDING,
            check_in__lt=booking.check_out,
            check_out__gt=booking.check_in,
        ).update(status=Booking.Status.REJECTED)
        return Response(self.get_serializer(booking).data)

    @extend_schema(tags=["Reservas"], summary="Recusar reserva (anfitrião dono)", request=None)
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        try:
            booking = self._get_host_booking(request, pk)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Reserva não encontrada nos seus imóveis."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Apenas reservas pendentes podem ser recusadas."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.REJECTED
        booking.save(update_fields=["status"])
        return Response(self.get_serializer(booking).data)

    @extend_schema(tags=["Reservas"], summary="Cancelar reserva pendente (hóspede)", request=None)
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        try:
            booking = Booking.objects.get(pk=pk, guest=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Reserva não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Apenas reservas pendentes podem ser canceladas."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=["status"])
        return Response(self.get_serializer(booking).data)

    @extend_schema(
        tags=["Reservas"],
        summary="Avaliar estadia concluída (hóspede)",
        request=ReviewCreateSerializer,
        responses=ReviewCreateSerializer,
    )
    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        try:
            booking = Booking.objects.select_related("property").get(
                pk=pk, guest=request.user
            )
        except Booking.DoesNotExist:
            return Response({"detail": "Reserva não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        if booking.status != Booking.Status.APPROVED:
            return Response(
                {"detail": "Só é possível avaliar reservas aprovadas."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.check_out > date.today():
            return Response(
                {"detail": "Só é possível avaliar após o fim da estadia."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Review.objects.filter(booking=booking).exists():
            return Response(
                {"detail": "Esta reserva já foi avaliada."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            booking=booking, property=booking.property, author=request.user
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
