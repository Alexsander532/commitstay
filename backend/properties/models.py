from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Amenity(models.Model):
    """Catálogo de comodidades (Wi-Fi, piscina, ar-condicionado...)."""

    name = models.CharField("nome", max_length=60, unique=True)
    icon = models.CharField("ícone", max_length=10, blank=True)

    class Meta:
        verbose_name = "comodidade"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Property(models.Model):
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties",
        verbose_name="anfitrião",
    )
    title = models.CharField("título", max_length=200)
    description = models.TextField("descrição")
    address = models.CharField("endereço", max_length=255)
    city = models.CharField("cidade", max_length=100, db_index=True)
    state = models.CharField("estado", max_length=50)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    price_per_night = models.DecimalField(
        "preço por diária", max_digits=10, decimal_places=2,
        validators=[MinValueValidator(1)],
    )
    max_guests = models.PositiveIntegerField(
        "capacidade máxima", validators=[MinValueValidator(1)]
    )
    amenities = models.ManyToManyField(Amenity, blank=True, related_name="properties")
    is_active = models.BooleanField("ativo", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "imóvel"
        verbose_name_plural = "imóveis"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.city}/{self.state}"


class Photo(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="photos")
    url = models.URLField("URL da foto", max_length=500)
    caption = models.CharField("legenda", max_length=200, blank=True)
    order = models.PositiveIntegerField("ordem", default=0)

    class Meta:
        verbose_name = "foto"
        ordering = ["order", "id"]

    def __str__(self):
        return f"Foto de {self.property_id} (#{self.order})"


class Review(models.Model):
    booking = models.OneToOneField(
        "bookings.Booking", on_delete=models.CASCADE, related_name="review"
    )
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="reviews")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveIntegerField(
        "nota", validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField("comentário", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "avaliação"
        verbose_name_plural = "avaliações"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.rating}★ — {self.property_id}"


class Favorite(models.Model):
    """Imóvel salvo por um hóspede."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "favorito"
        verbose_name_plural = "favoritos"
        unique_together = [("user", "property")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user_id} ♥ {self.property_id}"
