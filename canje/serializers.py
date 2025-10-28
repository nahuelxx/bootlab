# canje/serializers.py
from rest_framework import serializers
from .models import CheckoutIntent, CreditRequest, Product

class PrevaluationInputSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=[('gpu', 'gpu'), ('cpu', 'cpu')])
    brand = serializers.CharField(required=False, allow_blank=True)
    model = serializers.CharField(required=False, allow_blank=True)
    condition = serializers.CharField(required=False, allow_blank=True)
    year = serializers.IntegerField(required=False, allow_null=True)
    ray_tracing = serializers.BooleanField(required=False)
    accessories = serializers.ListField(child=serializers.CharField(), required=False)
    photos = serializers.ListField(child=serializers.CharField(), required=False)

    def validate(self, data):
        # Regla de negocio: GPU sin RT no es elegible
        if data.get("type") == "gpu" and not data.get("ray_tracing", False):
            raise serializers.ValidationError("GPU sin Ray Tracing no elegible (RTX 2060+ o RDNA2+).")
        # Mínimo 3 fotos
        photos = data.get("photos") or []
        if len(photos) < 3:
            raise serializers.ValidationError("Debes subir al menos 3 fotos.")
        return data


class PrevaluationOutputSerializer(serializers.Serializer):
    credito_id = serializers.IntegerField()
    pre_valuacion = serializers.IntegerField()
    rango = serializers.ListField(child=serializers.IntegerField())
    vigencia_horas = serializers.IntegerField()
    mensaje = serializers.CharField()


# ---------- CHECKOUT LINK ----------

class CheckoutLinkInputSerializer(serializers.Serializer):
    """
    Entrada para /api/canje/checkout-link/.
    """
    credito_id = serializers.IntegerField()
    product_id = serializers.CharField()
    product_price = serializers.IntegerField(min_value=1)  # mejor obligatorio y >= 1
    product_name = serializers.CharField(required=False, allow_blank=True)

    # (opcional) cacheamos el CreditRequest para usar en la view 
    def validate_credito_id(self, value):
        if not CreditRequest.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Crédito no encontrado.")
        return value
    
    def validate(self, attrs):
        # vencimiento
        cr = CreditRequest.objects.get(pk=attrs["credito_id"])
        if cr.is_expired():
            raise serializers.ValidationError("La prevaluación expiró, vuelve a calcular")

        # si quisieras validar precio mínimo por categoría, este es el lugar
        return attrs


class CheckoutIntentSerializer(serializers.ModelSerializer):
    """
    Salida para /api/canje/checkout-link/.
    Mapea campos del modelo -> nombres que consume el frontend.
    """
    checkout_url = serializers.URLField()
    saldo = serializers.IntegerField(source="balance", read_only =True)
    total = serializers.IntegerField(source="product_price", read_only =True)
    credito_aplicado = serializers.IntegerField(source="credit_applied", read_only =True)

    class Meta:
        model = CheckoutIntent
        fields = ("checkout_url", "saldo", "total", "credito_aplicado")

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id","name","brand","series","category","price","condition","specs", "image"]