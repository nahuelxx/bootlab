# canje/tests/factories.py
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from canje.models import CreditRequest, CheckoutIntent

CREDIT_QUERY_KEY = getattr(settings, "CANJE_CREDIT_QUERY_KEY", "credit")

def make_credit_request(*, expired=False, expires_at=None, **overrides):
    """
    Crea un CreditRequest listo para usar en tests.
    - Si expired=True, lo marca como ya vencido.
    - Si expires_at es None, ponemos uno válido por defecto (ahora + 48h).
    """
    if expires_at is None:
        expires_at = (timezone.now() - timedelta(hours=1)) if expired else (timezone.now() + timedelta(hours=48))

    payload = dict(
        type='gpu',
        brand='NVIDIA',
        model='RTX 3070 Ti',
        condition='excelente',
        year=2021,
        ray_tracing=True,
        accessories=['Caja', 'Manual'],
        photos=['a', 'b', 'c'],
        pre_valuacion=350000,
        rango_min=330000,
        rango_max=370000,
        vigencia_horas=48,
        expires_at=expires_at,  # SIEMPRE mandamos un valor concreto
    )
    payload.update(overrides)
    return CreditRequest.objects.create(**payload)

def make_checkout_intent(
    *,
    credit_request: CreditRequest | None = None,
    product_id: str = "12345",
    product_name: str = "PC Workstation RTX 3070",
    product_price: int = 1_200_000,
    **overrides,
) -> CheckoutIntent:
    """
    Crea un CheckoutIntent consistente con la lógica del backend.
    """
    cr = credit_request or make_credit_request()

    credit_applied = min(cr.pre_valuacion, product_price)
    balance = max(0, product_price - credit_applied)
    checkout_url=f"https://bootlabpc.tiendanube.com/cart/add/{product_id}?{CREDIT_QUERY_KEY}={cr.id}"

    payload = dict(
        credit_request=cr,
        product_id=product_id,
        product_name=product_name,
        product_price=product_price,
        credit_applied=credit_applied,
        balance=balance,
        checkout_url=checkout_url,
        status="created",
    )
    payload.update(overrides)
    return CheckoutIntent.objects.create(**payload)