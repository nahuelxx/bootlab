from django.contrib import admin
from .models import ContactMessage, NewsletterLead, Product
@admin.register(ContactMessage)
class ContactAdmin(admin.ModelAdmin):
    list_display=('name','email','created_at')
    search_fields=('name','email')
@admin.register(NewsletterLead)
class LeadAdmin(admin.ModelAdmin):
    list_display=('email','created_at')
    search_fields=('email',)
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand', 'series', 'category', 'price', 'is_active')
    list_filter   = ('category', 'brand', 'is_active')
    search_fields = ('name', 'brand', 'series')