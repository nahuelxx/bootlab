from django.db import models
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
