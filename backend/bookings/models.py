import builtins

from django.conf import settings
from django.db import models


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendente"
        APPROVED = "APPROVED", "Aprovada"
        REJECTED = "REJECTED", "Recusada"
        CANCELLED = "CANCELLED", "Cancelada"

    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="imóvel",
    )
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="hóspede",
    )
    check_in = models.DateField("entrada")
    check_out = models.DateField("saída")
    guests = models.PositiveIntegerField("hóspedes")
    total_price = models.DecimalField("preço total", max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    # Pagamento simulado — nunca persistir número completo nem CVV.
    card_holder = models.CharField("titular do cartão", max_length=100)
    card_last4 = models.CharField("últimos 4 dígitos", max_length=4)
    card_brand = models.CharField("bandeira", max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "reserva"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reserva #{self.pk} — {self.property_id} ({self.status})"

    @builtins.property
    def nights(self):
        return (self.check_out - self.check_in).days

    def conflicts_with_approved(self):
        """RN02/RN03: conflita com alguma reserva aprovada do mesmo imóvel?"""
        return Booking.objects.filter(
            property_id=self.property_id,
            status=self.Status.APPROVED,
            check_in__lt=self.check_out,
            check_out__gt=self.check_in,
        ).exclude(pk=self.pk).exists()
