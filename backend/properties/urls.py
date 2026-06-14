from rest_framework.routers import DefaultRouter

from .views import AmenityViewSet, FavoriteViewSet, PropertyViewSet

router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")
router.register("amenities", AmenityViewSet, basename="amenity")
router.register("favorites", FavoriteViewSet, basename="favorite")

urlpatterns = router.urls
