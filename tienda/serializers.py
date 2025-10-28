# tienda/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ('id', 'name', 'brand', 'series', 'category', 'price', 'condition', 'specs', 'image_url')
