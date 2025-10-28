import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

# Evita warnings de STATIC_ROOT durante los tests
@pytest.fixture(autouse=True)
def _tmp_static_root(settings, tmp_path):
    root = tmp_path / "static_root"
    root.mkdir(parents=True, exist_ok=True)   # <- clave
    settings.STATIC_ROOT = str(root)

