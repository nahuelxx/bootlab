# canje/views.py
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from tienda.models import Product
from tienda.serializers import ProductSerializer
from .models import CreditRequest, CheckoutIntent
from .serializers import (
    PrevaluationInputSerializer, PrevaluationOutputSerializer,
    CheckoutLinkInputSerializer, CheckoutIntentSerializer
)

CREDIT_QUERY_KEY = getattr(settings, "CANJE_CREDIT_QUERY_KEY", "credit")
# Puedes setear en settings.py: TIENDANUBE_BASE = "https://bootlabpc.tiendanube.com"
TIENDANUBE_BASE = getattr(settings, "TIENDANUBE_BASE", "https://bootlabpc.tiendanube.com")


def _dummy_prevaluation_amount(payload: dict) -> int:
    """
    Lógica dummy: base por tipo + pequeños pesos por 'condition'.
    Puedes reemplazar por modelo real más adelante.
    """
    base = 300_000 if payload.get("type") == "gpu" else 150_000
    cond = (payload.get("condition") or "").lower()
    if "excelente" in cond:
        base += 40_000
    elif "bueno" in cond:
        base += 25_000
    elif "regular" in cond:
        base += 5_000
    return base


class Prevaluar(APIView):
    permission_classes = [permissions.AllowAny]  # CHANGE: explícito para dev

    def post(self, request):
        s = PrevaluationInputSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        pre = _dummy_prevaluation_amount(data)
        low = round(pre * 0.94)
        high = round(pre * 1.06)
        vig_hours = 48
        expires = timezone.now() + timedelta(hours=vig_hours)

        cr = CreditRequest.objects.create(
            type=data["type"],
            brand=data.get("brand", ""),
            model=data.get("model", ""),
            condition=data.get("condition", ""),
            year=data.get("year"),
            ray_tracing=bool(data.get("ray_tracing")),
            accessories=data.get("accessories") or [],
            photos=data.get("photos") or [],
            pre_valuacion=pre,
            rango_min=low,
            rango_max=high,
            vigencia_horas=vig_hours,
            expires_at=expires,
        )

        out = {
            "credito_id": cr.id,
            "pre_valuacion": pre,
            "rango": [low, high],
            "vigencia_horas": vig_hours,
            "mensaje": "Estimación dummy (falta lógica real)",
        }
        return Response(PrevaluationOutputSerializer(out).data, status=status.HTTP_200_OK)


class CheckoutLink(APIView):
    def post(self, request):
        s = CheckoutLinkInputSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        cr = CreditRequest.objects.get(pk=data["credito_id"])

        total = int(data["product_price"])
        credit_applied = min(cr.pre_valuacion, total)
        saldo = max(0, total - credit_applied)

        checkout_url = f"{TIENDANUBE_BASE}/cart/add/{data['product_id']}?{CREDIT_QUERY_KEY}={cr.id}"

        ck = CheckoutIntent.objects.create(
            credit_request=cr,
            product_id=data["product_id"],
            product_name=data.get("product_name", ""),
            product_price=total,
            credit_applied=credit_applied,
            balance=saldo,
            checkout_url=checkout_url,
        )
        return Response(CheckoutIntentSerializer(ck).data, status=200)


class OfertaFinal(APIView):
    permission_classes = [permissions.AllowAny]  # CHANGE: explícito para dev

    def post(self, request):
        # Stub para el paso futuro.
        return Response({"ok": True, "mensaje": "Oferta final pendiente de implementación"}, status=status.HTTP_200_OK)

class ProductsList(APIView):
    """
    GET /api/canje/products/?category=gpu-nueva&brand=NVIDIA&series=RTX 40&min_price=300000&max_price=800000
    """
    def get(self, request):
        category = request.query_params.get('category')
        if not category:
            return Response({"error": "Parámetro 'category' es requerido"}, status=400)

        qs = Product.objects.filter(is_active=True, category=category).order_by('price')

        brand = request.query_params.get('brand')
        if brand:
            qs = qs.filter(brand=brand)

        series = request.query_params.get('series')
        if series:
            qs = qs.filter(series=series)

        # numéricos opcionales
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=int(min_price))
        if max_price:
            qs = qs.filter(price__lte=int(max_price))

        data = ProductSerializer(qs, many=True).data
        return Response(data, status=200)