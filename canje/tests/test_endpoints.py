import pytest
from .factories import make_credit_request, make_checkout_intent  # <-- ahora importamos ambos
from urllib.parse import urlparse, parse_qs, urlsplit
from tienda.models import Product
from django.utils import timezone

# -------- /prevaluar/ --------
@pytest.mark.django_db
def test_prevaluar_ok(api_client):
    payload = {
        "type": "gpu",
        "brand": "NVIDIA",
        "model": "RTX 3070 Ti",
        "condition": "excelente",
        "year": 2021,
        "ray_tracing": True,
        "accessories": ["Caja", "Manual"],
        "photos": ["a", "b", "c"]
    }
    url = "/api/canje/prevaluar/"
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 200
    data = resp.json()
    assert {"credito_id","pre_valuacion","rango","vigencia_horas","mensaje"} <= set(data.keys())
    assert isinstance(data["credito_id"], int)
    assert isinstance(data["pre_valuacion"], int)
    assert isinstance(data["rango"], list) and len(data["rango"]) == 2


@pytest.mark.django_db
def test_prevaluar_rechaza_gpu_sin_rt(api_client):
    payload = {
        "type": "gpu",
        "brand": "NVIDIA",
        "model": "GTX 1060",
        "condition": "excelente",
        "year": 2018,
        "ray_tracing": False,            # <- clave
        "accessories": [],
        "photos": ["a", "b", "c"]
    }
    url = "/api/canje/prevaluar/"
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 400
    assert "no elegible" in str(resp.data).lower()


@pytest.mark.django_db
def test_prevaluar_rechaza_menos_de_3_fotos(api_client):
    payload = {
        "type": "cpu",
        "brand": "AMD",
        "model": "Ryzen 5 5600",
        "condition": "muy bueno",
        "year": 2022,
        "ray_tracing": False,
        "accessories": [],
        "photos": ["a", "b"]            # <- solo 2
    }
    url = "/api/canje/prevaluar/"
    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 400
    assert "al menos 3 fotos" in str(resp.data).lower()


# -------- /checkout-link/ --------
@pytest.mark.django_db
def test_checkout_ok(api_client):
    cr = make_credit_request(pre_valuacion=350_000)
    payload = {
        "credito_id": cr.id,
        "product_id": "SKU123",
        "product_price": 1_200_000,
        "product_name": "PC Workstation RTX 3070",
    }
    resp = api_client.post("/api/canje/checkout-link/", payload, format="json")
    assert resp.status_code == 200
    data = resp.json()
    assert {"checkout_url","saldo","total","credito_aplicado"} <= set(data.keys())
    assert data["total"] == 1_200_000
    assert data["credito_aplicado"] == 350_000
    assert data ["saldo"] == 850_000
    assert "?cr={}".format(cr.id) in data["checkout_url"] or "?credit={}".format(cr.id) in data["checkout_url"]

@pytest.mark.django_db
def test_checkout_credito_inexistente(api_client):
    payload = {"credito_id": 999999, "product_id": "X", "product_price": 100000}
    resp = api_client.post("/api/canje/checkout-link/", payload, format="json")
    assert resp.status_code == 400
    assert "credito_id" in str(resp.data).lower()

@pytest.mark.django_db
def test_checkout_credito_expirado(api_client):
    cr = make_credit_request()
    cr.expires_at = timezone.now() - timezone.timedelta(hours=1)
    cr.save(update_fields=["expires_at"])
    payload = {"credito_id": cr.id, "product_id": "X", "product_price": 100000}
    resp = api_client.post("/api/canje/checkout-link/", payload, format="json")
    assert resp.status_code == 400
    assert "expir" in str(resp.data).lower()

@pytest.mark.django_db
def test_checkout_price_must_be_positive(api_client):
    cr = make_credit_request()
    payload = {"credito_id": cr.id, "product_id": "X", "product_price": 0}
    resp = api_client.post("/api/canje/checkout-link/", payload, format="json")
    assert resp.status_code == 400
    assert "product_price" in str(resp.data).lower()


# -------- Modelo: usar make_checkout_intent (factory) --------
@pytest.mark.django_db
def test_checkout_intent_factory_computa_campos():
    cr = make_credit_request(pre_valuacion=350000)
    ck = make_checkout_intent(
        credit_request=cr,
        product_id="ABC",
        product_name="Algo",
        product_price=1_200_000,
    )

    assert ck.product_price == 1_200_000
    assert ck.credit_applied == 350000
    assert ck.balance == 1_200_000 - 350000

    # 1) chequeo simple por substring (rápido y robusto)
    assert f"?cr={cr.id}" in ck.checkout_url

    # 2) chequeo estricto parseando la query
    parsed = urlsplit(ck.checkout_url)       # <-- SIEMPRE string acá
    qs = parse_qs(parsed.query)              # dict[str, list[str]]
    assert qs.get("cr") == [str(cr.id)]

# ---------- FACTORY SIMPLE ----------
def make_product(**overrides):
    defaults = dict(
        name="RTX 4060 Ti",
        brand="NVIDIA",
        series="RTX 40",
        category="gpu-nueva",
        price=450000,
        condition="",
        specs=["8GB GDDR6"],
        image_url="",
        is_active=True,
    )
    defaults.update(overrides)
    return Product.objects.create(**defaults)

# ---------- TESTS ----------

@pytest.mark.django_db
def test_products_requires_category(api_client):
    resp = api_client.get("/api/canje/products/")
    assert resp.status_code == 400
    assert "category" in str(resp.content).lower()

@pytest.mark.django_db
def test_products_by_category_returns_list(api_client):
    make_product(category="gpu-nueva", name="A")
    make_product(category="gpu-usada", name="B")
    resp = api_client.get("/api/canje/products/?category=gpu-nueva")
    assert resp.status_code == 200
    data = resp.json()
    # Contrato final: lista
    assert isinstance(data, list)
    assert all(isinstance(p, dict) for p in data)
    # Todos de la categoría pedida
    assert all(p['category'] == "gpu-nueva" for p in data)

@pytest.mark.django_db
def test_products_filters_brand_series(api_client):
    make_product(category="gpu-nueva", brand="NVIDIA", series="RTX 40", name="A")
    make_product(category="gpu-nueva", brand="NVIDIA", series="RTX 30", name="B")
    make_product(category="gpu-nueva", brand="AMD",    series="RX 7000", name="C")

    url = "/api/canje/products/?category=gpu-nueva&brand=NVIDIA&series=RTX 40"
    resp = api_client.get(url)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["brand"] == "NVIDIA"
    assert data[0]["series"] == "RTX 40"

@pytest.mark.django_db
def test_products_filters_price_range(api_client):
    make_product(category="gpu-nueva", price=300_000, name="barata")
    make_product(category="gpu-nueva", price=600_000, name="media")
    make_product(category="gpu-nueva", price=1_100_000, name="cara")

    url = "/api/canje/products/?category=gpu-nueva&min_price=350000&max_price=900000"
    resp = api_client.get(url)
    assert resp.status_code == 200
    data = resp.json()
    prices = [p["price"] for p in data]
    assert all(350_000 <= p <= 900_000 for p in prices)
    # Debe incluir 600k, excluir 300k y 1.1M
    assert 600_000 in prices
    assert 300_000 not in prices
    assert 1_100_000 not in prices

@pytest.mark.django_db
def test_products_only_active(api_client):
    make_product(category="gpu-nueva", name="visible", is_active=True)
    make_product(category="gpu-nueva", name="oculta",  is_active=False)

    resp = api_client.get("/api/canje/products/?category=gpu-nueva")
    assert resp.status_code == 200
    data = resp.json()
    names = [p["name"] for p in data]
    assert "visible" in names
    assert "oculta" not in names