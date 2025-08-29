from django.urls import path
from . import views

urlpatterns = [
    path("prevaluar/", views.Prevaluar.as_view(), name="prevaluar"),
    path("checkout-link/", views.CheckoutLink.as_view(), name="checkout-link"),
    path("oferta-final/", views.OfertaFinal.as_view(), name="oferta-final"),
]
