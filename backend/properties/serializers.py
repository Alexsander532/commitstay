from rest_framework import serializers

from .models import Amenity, Favorite, Photo, Property, Review


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name", "icon"]


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ["id", "url", "caption", "order"]


class ReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "rating", "comment", "author_name", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]


class PropertyListSerializer(serializers.ModelSerializer):
    """Versão enxuta para listagem/mapa."""

    cover_photo = serializers.SerializerMethodField()
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "title", "city", "state", "latitude", "longitude",
            "price_per_night", "max_guests", "cover_photo",
            "avg_rating", "review_count", "is_active",
        ]

    def get_cover_photo(self, obj) -> str | None:
        photo = obj.photos.first()
        return photo.url if photo else None


class PropertyDetailSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source="host.name", read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    # campos de escrita
    photo_urls = serializers.ListField(
        child=serializers.URLField(max_length=500),
        write_only=True,
        required=False,
        help_text="Lista de URLs de fotos (substitui as existentes).",
    )
    amenity_ids = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="amenities",
    )

    class Meta:
        model = Property
        fields = [
            "id", "host", "host_name", "title", "description",
            "address", "city", "state", "latitude", "longitude",
            "price_per_night", "max_guests", "is_active",
            "photos", "amenities", "avg_rating", "review_count",
            "photo_urls", "amenity_ids", "created_at",
        ]
        read_only_fields = ["id", "host", "host_name", "created_at"]

    def _save_photos(self, prop, urls):
        prop.photos.all().delete()
        Photo.objects.bulk_create(
            [Photo(property=prop, url=url, order=i) for i, url in enumerate(urls)]
        )

    def create(self, validated_data):
        photo_urls = validated_data.pop("photo_urls", [])
        amenities = validated_data.pop("amenities", [])
        prop = Property.objects.create(
            host=self.context["request"].user, **validated_data
        )
        prop.amenities.set(amenities)
        if photo_urls:
            self._save_photos(prop, photo_urls)
        return prop

    def update(self, instance, validated_data):
        photo_urls = validated_data.pop("photo_urls", None)
        amenities = validated_data.pop("amenities", None)
        instance = super().update(instance, validated_data)
        if amenities is not None:
            instance.amenities.set(amenities)
        if photo_urls is not None:
            self._save_photos(instance, photo_urls)
        return instance


class BookedRangeSerializer(serializers.Serializer):
    check_in = serializers.DateField()
    check_out = serializers.DateField()


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["id", "property", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_property(self, prop):
        if not prop.is_active:
            raise serializers.ValidationError("Imóvel indisponível.")
        return prop

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
