# canje/models.py
from datetime import timedelta
from django.db import models
from django.utils import timezone

def default_expires_at():
    return timezone.now() + timedelta(hours=48)


class CreditRequest(models.Model):
    TYPE_CHOICES = (('gpu', 'GPU'), ('cpu', 'CPU'))
    STATUS_CHOICES = (('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'))

    # Datos declarados por el usuario
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    brand = models.CharField(max_length=80, blank=True)
    model = models.CharField(max_length=120, blank=True)
    condition = models.CharField(max_length=50, blank=True)
    year = models.IntegerField(null=True, blank=True)
    ray_tracing = models.BooleanField(default=False)
    accessories = models.JSONField(default=list, blank=True)
    photos = models.JSONField(default=list, blank=True)  # guardamos URLs/base64 en dev

    # Resultado de la prevaluación
    pre_valuacion = models.PositiveIntegerField()  # ARS sin decimales
    rango_min = models.PositiveIntegerField()
    rango_max = models.PositiveIntegerField()
    vigencia_horas = models.PositiveIntegerField(default=48)
    expires_at = models.DateTimeField(default=default_expires_at)

    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"CR#{self.pk} {self.type} {self.brand} {self.model} – ${self.pre_valuacion}"


class CheckoutIntent(models.Model):
    STATUS_CHOICES = (('created', 'Created'), ('completed', 'Completed'), ('cancelled', 'Cancelled'))

    credit_request = models.ForeignKey(CreditRequest, related_name='checkouts', on_delete=models.CASCADE)

    product_id = models.CharField(max_length=64)
    product_name = models.CharField(max_length=160, blank=True)
    product_price = models.PositiveIntegerField(default=0)   # ARS
    credit_applied = models.PositiveIntegerField(default=0)  # ARS
    balance = models.PositiveIntegerField(default=0)         # ARS
    checkout_url = models.URLField()

    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CK#{self.pk} -> CR#{self.credit_request_id} ${self.product_price} (${self.balance} saldo)"

class Product(models.Model):
    CATEGORY_CHOICES = (
        ("gpu-nueva", "GPU Nueva"),
        ("gpu-usada", "GPU Usada"),
        ("pc-reacondicionada","PC Reacondicionada"),
    )
    
    name = models.CharField(max_length=160)
    brand = models.CharField(max_length=80, blank=True)
    series = models.CharField(max_length=80, blank=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    price = models.PositiveIntegerField()
    condition = models.CharField(max_length=50, blank=True)
    specs = models.JSONField(default=list, blank=True)
    image = models.URLField(blank=True)   # por ahora solo guardamos URL

