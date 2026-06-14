import django_filters
from django.db.models import Q

from bookings.models import Booking

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")
    guests = django_filters.NumberFilter(field_name="max_guests", lookup_expr="gte")
    min_price = django_filters.NumberFilter(field_name="price_per_night", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price_per_night", lookup_expr="lte")
    check_in = django_filters.DateFilter(method="filter_dates")
    check_out = django_filters.DateFilter(method="noop")

    class Meta:
        model = Property
        fields = ["city", "guests", "min_price", "max_price", "check_in", "check_out"]

    def noop(self, queryset, name, value):
        return queryset

    def filter_dates(self, queryset, name, value):
        """Exclui imóveis com reserva aprovada conflitante no intervalo pedido."""
        check_in = value
        check_out = self.data.get("check_out")
        if not check_out:
            return queryset
        conflicting = Booking.objects.filter(
            status=Booking.Status.APPROVED,
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).values_list("property_id", flat=True)
        return queryset.exclude(id__in=conflicting)
