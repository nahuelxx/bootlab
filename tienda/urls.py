from django.urls import path
from . import views
urlpatterns=[
    path('', views.home, name='home'),
    path('contact/', views.contact, name='contact'),
    path('newsletter/', views.newsletter, name='newsletter'),
    path('api/contact/', views.api_contact, name='api_contact'),
    path('api/newsletter/', views.api_newsletter, name='api_newsletter'),
]
