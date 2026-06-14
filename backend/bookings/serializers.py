import re
from datetime import date

from rest_framework import serializers

from properties.models import Review
from properties.serializers import ReviewSerializer

from .models import Booking

CARD_BRANDS = [
    ("Visa", re.compile(r"^4")),
    ("Mastercard", re.compile(r"^(5[1-5]|2[2-7])")),
    ("Amex", re.compile(r"^3[47]")),
    ("Elo", re.compile(r"^(4011|4312|4389|5041|6363)")),
]


def luhn_valid(number: str) -> bool:
    digits = [int(d) for d in number]
    odd = digits[-1::-2]
    even = [sum(divmod(d * 2, 10)) for d in digits[-2::-2]]
    return (sum(odd) + sum(even)) % 10 == 0


def detect_brand(number: str) -> str:
    for brand, pattern in CARD_BRANDS:
        if pattern.match(number):
            return brand
    return "Outro"


class BookingSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_city = serializers.CharField(source="property.city", read_only=True)
    guest_name = serializers.CharField(source="guest.name", read_only=True)
    nights = serializers.IntegerField(read_only=True)
    has_review = serializers.SerializerMethodField()

    # dados de pagamento (somente escrita)
    card_number = serializers.CharField(write_only=True, max_length=19)
    card_expiry = serializers.CharField(write_only=True, max_length=5, help_text="MM/AA")
    card_cvv = serializers.CharField(write_only=True, max_length=4)

    class Meta:
        model = Booking
        fields = [
            "id", "property", "property_title", "property_city",
            "guest_name", "check_in", "check_out", "guests",
            "nights", "total_price", "status", "created_at",
            "card_holder", "card_last4", "card_brand", "has_review",
            "card_number", "card_expiry", "card_cvv",
        ]
        read_only_fields = [
            "id", "total_price", "status", "created_at",
            "card_last4", "card_brand", "has_review",
        ]

    def get_has_review(self, obj) -> bool:
        return Review.objects.filter(booking=obj).exists()

    # --- validações de pagamento (RF04.3) ---
    def validate_card_number(self, value):
        number = re.sub(r"[\s-]", "", value)
        if not number.isdigit() or not 13 <= len(number) <= 19:
            raise serializers.ValidationError("Número de cartão inválido.")
        if not luhn_valid(number):
            raise serializers.ValidationError("Número de cartão inválido (falha na verificação).")
        return number

    def validate_card_expiry(self, value):
        match = re.fullmatch(r"(0[1-9]|1[0-2])/(\d{2})", value)
        if not match:
            raise serializers.ValidationError("Validade deve estar no formato MM/AA.")
        month, year = int(match.group(1)), 2000 + int(match.group(2))
        today = date.today()
        if (year, month) < (today.year, today.month):
            raise serializers.ValidationError("Cartão expirado.")
        return value

    def validate_card_cvv(self, value):
        if not re.fullmatch(r"\d{3,4}", value):
            raise serializers.ValidationError("CVV inválido.")
        return value

    # --- validações de negócio (RN01–RN06) ---
    def validate(self, attrs):
        prop = attrs["property"]
        check_in, check_out = attrs["check_in"], attrs["check_out"]
        request = self.context["request"]

        if check_in >= check_out:
            raise serializers.ValidationError(
                {"check_out": "A data de saída deve ser posterior à de entrada."}
            )
        if check_in < date.today():
            raise serializers.ValidationError(
                {"check_in": "Não é possível reservar datas no passado."}
            )
        if not prop.is_active:
            raise serializers.ValidationError({"property": "Este imóvel não está disponível."})
        if prop.host_id == request.user.id:
            raise serializers.ValidationError(
                {"property": "Você não pode reservar o seu próprio imóvel."}
            )
        if attrs["guests"] > prop.max_guests:
            raise serializers.ValidationError(
                {"guests": f"Este imóvel acomoda no máximo {prop.max_guests} hóspede(s)."}
            )

        conflict = Booking.objects.filter(
            property=prop,
            status=Booking.Status.APPROVED,
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()
        if conflict:
            raise serializers.ValidationError(
                {"check_in": "Há conflito com uma reserva já aprovada nesse período."}
            )
        return attrs

    def create(self, validated_data):
        card_number = validated_data.pop("card_number")
        validated_data.pop("card_expiry")
        validated_data.pop("card_cvv")

        nights = (validated_data["check_out"] - validated_data["check_in"]).days
        prop = validated_data["property"]

        return Booking.objects.create(
            guest=self.context["request"].user,
            total_price=nights * prop.price_per_night,
            card_last4=card_number[-4:],
            card_brand=detect_brand(card_number),
            **validated_data,
        )


class ReviewCreateSerializer(ReviewSerializer):
    class Meta(ReviewSerializer.Meta):
        fields = ["id", "rating", "comment", "author_name", "created_at"]
