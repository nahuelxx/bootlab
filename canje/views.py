from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class Prevaluar(APIView):
    def post(self, request):
        # Dummy response
        return Response({
            "credito_id": "cr_123",
            "pre_valuacion": 350000,
            "rango": [330000, 370000],
            "vigencia_horas": 48,
            "mensaje": "Estimación dummy (falta lógica real)"
        }, status=status.HTTP_200_OK)

class CheckoutLink(APIView):
    def post(self, request):
        return Response({
            "checkout_url": "https://demo.bootlabpc.com/cart/...",
            "saldo": 120000,
            "total": 420000,
            "credito_aplicado": 300000
        }, status=status.HTTP_200_OK)

class OfertaFinal(APIView):
    def post(self, request):
        return Response({
            "msg": "Oferta final dummy confirmada"
        }, status=status.HTTP_200_OK)
