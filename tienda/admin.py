from django.contrib import admin
from .models import ContactMessage, NewsletterLead
@admin.register(ContactMessage)
class ContactAdmin(admin.ModelAdmin):
    list_display=('name','email','created_at')
    search_fields=('name','email')
@admin.register(NewsletterLead)
class LeadAdmin(admin.ModelAdmin):
    list_display=('email','created_at')
    search_fields=('email',)
