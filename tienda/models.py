from django.db import models
from django.utils import timezone
class ContactMessage(models.Model):
    name=models.CharField(max_length=120)
    email=models.EmailField()
    message=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.name} <{self.email}>"
class NewsletterLead(models.Model):
    email=models.EmailField(unique=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.email

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('gpu-nueva', 'GPU Nueva'),
        ('gpu-usada', 'GPU Usada'),
        ('pc-reacondicionada', 'PC Reacondicionada'),
    ]

    name       = models.CharField(max_length=160)
    category   = models.CharField(max_length=24, choices=CATEGORY_CHOICES, db_index=True)
    brand      = models.CharField(max_length=64, db_index=True)
    series     = models.CharField(max_length=64, blank=True, db_index=True)
    price      = models.PositiveIntegerField()              # ARS sin decimales
    condition  = models.CharField(max_length=32, blank=True)
    specs      = models.JSONField(default=list, blank=True) # ej: ["12GB", "GDDR6X", "HDMI 2.1"]
    image_url  = models.URLField(blank=True)
    is_active  = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.category}) - ${self.price}"
