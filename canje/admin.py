# canje/admin.py
from django.contrib import admin
from .models import CreditRequest, CheckoutIntent

@admin.register(CreditRequest)
class CreditRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "brand", "model", "pre_valuacion", "rango_min", "rango_max", "expires_at", "status", "created_at")
    search_fields = ("brand", "model")
    list_filter = ("type", "status")

@admin.register(CheckoutIntent)
class CheckoutIntentAdmin(admin.ModelAdmin):
    list_display = ("id", "credit_request", "product_id", "product_price", "credit_applied", "balance", "status", "created_at")
    search_fields = ("product_id",)
    list_filter = ("status",)
