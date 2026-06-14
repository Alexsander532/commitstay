from datetime import date, timedelta
from decimal import Decimal

from rest_framework.test import APITestCase

from accounts.models import User
from properties.models import Property

from .models import Booking

CARD = {
    "card_holder": "TESTE SILVA",
    "card_number": "4111111111111111",
    "card_expiry": "12/30",
    "card_cvv": "123",
}


def make_property(host, **kwargs):
    defaults = dict(
        title="Casa teste", description="desc", address="Rua A",
        city="Floripa", state="SC", latitude=Decimal("-27.0"),
        longitude=Decimal("-48.0"), price_per_night=Decimal("100.00"), max_guests=4,
    )
    defaults.update(kwargs)
    return Property.objects.create(host=host, **defaults)


class AuthTests(APITestCase):
    def test_register_and_login(self):
        resp = self.client.post("/api/auth/register/", {
            "name": "Novo", "email": "novo@x.com",
            "password": "S3nh@F0rte!", "role": "guest",
        })
        self.assertEqual(resp.status_code, 201)

        resp = self.client.post("/api/auth/login/", {
            "email": "novo@x.com", "password": "S3nh@F0rte!",
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)
        self.assertEqual(resp.data["user"]["role"], "guest")

    def test_register_duplicate_email(self):
        User.objects.create_user(email="dup@x.com", password="S3nh@F0rte!", name="A")
        resp = self.client.post("/api/auth/register/", {
            "name": "B", "email": "dup@x.com", "password": "S3nh@F0rte!", "role": "host",
        })
        self.assertEqual(resp.status_code, 400)


class PermissionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="h@x.com", password="x", name="Host", role="host")
        self.guest = User.objects.create_user(
            email="g@x.com", password="x", name="Guest", role="guest")
        self.prop = make_property(self.host)

    def test_anonymous_can_list_and_filter(self):
        resp = self.client.get("/api/properties/?city=flori&guests=2")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)

    def test_guest_cannot_create_property(self):
        self.client.force_authenticate(self.guest)
        resp = self.client.post("/api/properties/", {"title": "x"})
        self.assertEqual(resp.status_code, 403)

    def test_host_cannot_edit_others_property(self):
        other = User.objects.create_user(
            email="o@x.com", password="x", name="Other", role="host")
        self.client.force_authenticate(other)
        resp = self.client.patch(f"/api/properties/{self.prop.id}/", {"title": "hack"})
        self.assertEqual(resp.status_code, 403)

    def test_host_cannot_book(self):
        """Anfitrião não reserva o próprio imóvel."""
        self.client.force_authenticate(self.host)
        resp = self.client.post("/api/bookings/", {
            "property": self.prop.id,
            "check_in": date.today() + timedelta(days=5),
            "check_out": date.today() + timedelta(days=7),
            "guests": 2, **CARD,
        })
        self.assertEqual(resp.status_code, 400)


class BookingRuleTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="h@x.com", password="x", name="Host", role="host")
        self.guest = User.objects.create_user(
            email="g@x.com", password="x", name="Guest", role="guest")
        self.prop = make_property(self.host)
        self.client.force_authenticate(self.guest)

    def _book(self, days_from=5, nights=3, **extra):
        payload = {
            "property": self.prop.id,
            "check_in": date.today() + timedelta(days=days_from),
            "check_out": date.today() + timedelta(days=days_from + nights),
            "guests": 2, **CARD,
        }
        payload.update(extra)
        return self.client.post("/api/bookings/", payload)

    def test_create_booking_calculates_total(self):
        resp = self._book(nights=3)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["total_price"], "300.00")
        self.assertEqual(resp.data["status"], "PENDING")
        self.assertEqual(resp.data["card_last4"], "1111")
        self.assertEqual(resp.data["card_brand"], "Visa")
        # número completo do cartão jamais persistido
        self.assertFalse(hasattr(Booking.objects.first(), "card_number"))

    def test_invalid_card_rejected(self):
        resp = self._book(card_number="1234567890123456")
        self.assertEqual(resp.status_code, 400)

    def test_past_date_rejected(self):
        resp = self._book(days_from=-3)
        self.assertEqual(resp.status_code, 400)

    def test_checkout_before_checkin_rejected(self):
        resp = self._book(nights=-1)
        self.assertEqual(resp.status_code, 400)

    def test_over_capacity_rejected(self):
        resp = self._book(guests=10)
        self.assertEqual(resp.status_code, 400)

    def test_conflict_with_approved_rejected(self):
        Booking.objects.create(
            property=self.prop, guest=self.guest,
            check_in=date.today() + timedelta(days=5),
            check_out=date.today() + timedelta(days=8),
            guests=2, total_price=300, status=Booking.Status.APPROVED,
            card_holder="X", card_last4="1111",
        )
        resp = self._book(days_from=6, nights=3)
        self.assertEqual(resp.status_code, 400)
        # check-out no dia do check-in alheio não conflita
        resp = self._book(days_from=2, nights=3)
        self.assertEqual(resp.status_code, 201)

    def test_approve_auto_rejects_conflicting_pending(self):
        b1 = self._book(days_from=5, nights=3).data
        b2 = self._book(days_from=6, nights=3).data

        self.client.force_authenticate(self.host)
        resp = self.client.post(f"/api/bookings/{b1['id']}/approve/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "APPROVED")
        self.assertEqual(
            Booking.objects.get(id=b2["id"]).status, Booking.Status.REJECTED
        )

    def test_only_property_host_can_approve(self):
        booking = self._book().data
        other = User.objects.create_user(
            email="o@x.com", password="x", name="Other", role="host")
        self.client.force_authenticate(other)
        resp = self.client.post(f"/api/bookings/{booking['id']}/approve/")
        self.assertEqual(resp.status_code, 404)

    def test_guest_can_cancel_pending(self):
        booking = self._book().data
        resp = self.client.post(f"/api/bookings/{booking['id']}/cancel/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "CANCELLED")


class SearchFilterTests(APITestCase):
    def setUp(self):
        host = User.objects.create_user(
            email="h@x.com", password="x", name="Host", role="host")
        self.guest = User.objects.create_user(
            email="g@x.com", password="x", name="Guest", role="guest")
        self.p1 = make_property(host, city="Florianópolis", price_per_night=Decimal("100"))
        self.p2 = make_property(host, city="São Paulo", price_per_night=Decimal("300"), max_guests=2)

    def test_filter_by_price_range(self):
        resp = self.client.get("/api/properties/?min_price=200&max_price=400")
        ids = [p["id"] for p in resp.data["results"]]
        self.assertEqual(ids, [self.p2.id])

    def test_filter_by_guests(self):
        resp = self.client.get("/api/properties/?guests=3")
        ids = [p["id"] for p in resp.data["results"]]
        self.assertEqual(ids, [self.p1.id])

    def test_filter_by_dates_excludes_booked(self):
        Booking.objects.create(
            property=self.p1, guest=self.guest,
            check_in=date.today() + timedelta(days=10),
            check_out=date.today() + timedelta(days=15),
            guests=2, total_price=500, status=Booking.Status.APPROVED,
            card_holder="X", card_last4="1111",
        )
        check_in = date.today() + timedelta(days=12)
        check_out = date.today() + timedelta(days=14)
        resp = self.client.get(
            f"/api/properties/?check_in={check_in}&check_out={check_out}"
        )
        ids = [p["id"] for p in resp.data["results"]]
        self.assertNotIn(self.p1.id, ids)
        self.assertIn(self.p2.id, ids)

    def test_booked_dates_endpoint(self):
        Booking.objects.create(
            property=self.p1, guest=self.guest,
            check_in=date.today() + timedelta(days=10),
            check_out=date.today() + timedelta(days=15),
            guests=2, total_price=500, status=Booking.Status.APPROVED,
            card_holder="X", card_last4="1111",
        )
        resp = self.client.get(f"/api/properties/{self.p1.id}/booked-dates/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
