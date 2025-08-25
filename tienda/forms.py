from django import forms
from .models import ContactMessage, NewsletterLead
class ContactForm(forms.ModelForm):
    class Meta:
        model=ContactMessage
        fields=['name','email','message']
class NewsletterForm(forms.ModelForm):
    class Meta:
        model=NewsletterLead
        fields=['email']
