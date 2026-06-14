from django.contrib import admin

from .models import Amenity, Photo, Property, Review


class PhotoInline(admin.TabularInline):
    model = Photo
    extra = 0


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("title", "city", "state", "price_per_night", "max_guests", "host", "is_active")
    list_filter = ("city", "is_active")
    search_fields = ("title", "city")
    inlines = [PhotoInline]


admin.site.register(Amenity)
admin.site.register(Review)
