# BootLab Backend (Django)
📌 Propósito del proyecto

BootLab Canje es una app de reacondicionamiento de PCs y componentes.
Su flujo principal permite que un usuario entregue una GPU o CPU usada y reciba un crédito estimado para comprar productos en BootLab (GPUs nuevas, usadas y PCs reacondicionadas).

El objetivo es que el sistema funcione como un wizard paso a paso (4 pasos) que guía al usuario desde la carga de su componente hasta la confirmación del canje.

Pasos:

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Front: pega tu HTML en templates/pages/home.html y assets en static/.

🧩 Flujo del Wizard (app canje)

1-StepComponent.jsx
El usuario carga su componente (tipo: GPU/CPU, marca, modelo, año, accesorios).
Sube al menos 3 fotos.
Si es GPU, debe tener Ray Tracing (RTX 2060+ o AMD RDNA2+).
Botón Calcular crédito → envía la info a la API /prevaluar/.

2-StepPrevaluation.jsx
Muestra la pre-valuación estimada (crédito, rango y vigencia).
Los datos vienen del endpoint /prevaluar/.
Se guardan en el estado global del wizard.

3-StepChooseProduct.jsx
Lista de productos (mockeados por ahora, más adelante vendrán de un endpoint /products).
Se puede filtrar por marca, serie, rango de precio.
Al seleccionar un producto, se envía la combinación product_id + credito_id al endpoint /checkout-link/.
Se devuelve un checkout_url y datos de balance.

4-StepConfirmation.jsx
Resumen final: componente entregado, crédito obtenido, producto elegido.
Muestra saldo a pagar.
Botón para abrir el carrito en Tiendanube (mock por ahora).
--------------------------------------------------------------------------

📂 Archivos clave

src/lib/api.js
Centraliza todas las llamadas al backend.
prevaluar(payload) → POST a /api/canje/prevaluar/
checkoutLink(payload) → POST a /api/canje/checkout-link/
Mantiene la única fuente de verdad de endpoints → evita duplicación de fetch en distintos componentes.

.env y .env.prod
Variables de entorno para front y back.
.env (dev) → apunta a http://localhost:8000/api/canje
.env.prod (producción) → apunta al dominio real (ej: https://bootlabpc.com/api/canje)
También se usan flags como VITE_ALLOW_BYPASS_RAY=true para forzar casos de prueba en dev.

src/lib/normalizers.js
Funciones utilitarias para formatear datos antes de enviarlos o después de recibirlos:
normalizeComponent(formData) → asegura que el payload al backend tenga la estructura esperada.
normalizePrevaluationResponse(apiResponse) → limpia la respuesta y la adapta al front.
Garantiza consistencia y evita errores por campos opcionales, nulos o nombres distintos.
-------------------------------------------------------------------------
📈 Avances clave y aprendizajes

1-Conexión Django + React mediante API centralizada (api.js), evitando fetch duplicados.

2-Validaciones: mínimo 3 fotos y GPU con Ray Tracing obligatorio (simulado con bypass en dev).

3-Normalización de datos: se encapsularon transformaciones en normalizers.js para legibilidad y escalabilidad.

4-Toasts de feedback: cada error/success notifica al usuario sin romper el flujo.

5-Primeros mocks: catálogo de productos generado en front → paso previo a un endpoint real /products.

6-Errores sólidos en API: se reciben 200 (OK) y 400 (Bad Request) reales desde Django DRF, confirmando integración.
--------------------------------------------------------------------------
1) Modelos: CreditRequest y CheckoutIntent

CreditRequest guarda lo que declara el usuario (tipo, marca, modelo, año, estado, ray_tracing, accessories, photos) y el resultado de la prevaluación (pre_valuacion, rango_min, rango_max, vigencia_horas, expires_at).
Incluye is_expired() para saber si la prevaluación venció.

CheckoutIntent representa el intento de compra con crédito: FK al CreditRequest, datos del producto (product_id, product_name, product_price), cálculo del crédito aplicado (credit_applied) y saldo (balance), y el checkout_url hacia Tiendanube.

¿Por qué? Separar prevaluación de compra nos da historial, consistencia y claridad de estados.

2) Serializers claros

PrevaluationInputSerializer: valida el input del usuario (si es GPU exige ray_tracing; mínimo 3 fotos).

PrevaluationOutputSerializer: define el contrato de salida (ids y números que el front necesita).

CheckoutLinkInputSerializer: valida credito_id, product_id y product_price (entero y > 0).

CheckoutIntentSerializer: salida estándar del checkout (checkout_url, total, credito_aplicado, saldo).

¿Por qué? Fijan contratos estables entre front y back y centralizan validaciones.

3) Vistas (lógica dummy + validaciones)

POST /api/canje/prevaluar/:

Valida entrada. 2) Calcula un monto dummy (base por tipo + ajuste por condition).

Guarda CreditRequest con rango y vencimiento (48h). 4) Devuelve credito_id, pre_valuacion, rango, vigencia_horas.

POST /api/canje/checkout-link/:

Valida entrada. 2) Busca el CreditRequest y verifica que no esté vencido.

Calcula credit_applied = min(pre_valuacion, product_price) y saldo.

Construye checkout_url = <TIENDANUBE_BASE>/cart/add/<product_id>?cr=<id>, guarda CheckoutIntent y responde.

POST /api/canje/oferta-final/: stub para el Día 5 (deja el endpoint listo para evolucionar).

¿Por qué? La lógica dummy nos permite integrar el flujo completo hoy y reemplazarla luego por reglas reales sin romper contratos.

4) settings.py (CORS, estáticos, env)

CORS/CSRF de dev abiertos a localhost:5173 y localhost:3000.

Staticfiles: en dev usamos StaticFilesStorage (sin collectstatic); en prod queda configurado Whitenoise.

Config runtime: TIENDANUBE_BASE y CANJE_CREDIT_QUERY_KEY por env (con defaults seguros).

¿Por qué? Evita fricción en dev (CORS, warnings) y deja listo el camino a prod.

5) Tests con pytest (cobertura útil)

Prevaluación

OK con datos válidos (devuelve credito_id, montos y rango).

Rechaza GPU sin ray tracing.

Rechaza menos de 3 fotos.

Checkout link

OK (calcula credito_aplicado y saldo, y arma checkout_url con ?cr=).

Rechaza credito_id inexistente.

Rechaza prevaluación vencida.

Rechaza precio 0.

Factories (make_credit_request, make_checkout_intent) para crear casos realistas rápido.

Fixture STATIC_ROOT temporal para correr sin warnings de estáticos.

¿Por qué? Los tests amarran el contrato API y evitan regresiones cuando cambiemos la lógica.
El front puede consumir:

POST /api/canje/prevaluar/ → recibe credito_id, pre_valuacion, rango, vigencia_horas.

POST /api/canje/checkout-link/ → recibe checkout_url, total, credito_aplicado, saldo.

Pasamos de endpoints sueltos a un flujo completo, versionable y testeado.

Acordamos contratos estables para el front (serializers) y controlamos estados (vencimiento, errores comunes).

Dejamos el código listo para escalar: integrar catálogo real de productos y “oferta final” sin reescribir lo ya probado.
------------------------------------------------------------------------
📌 Current Work – Día 4 

Imaginá que tenías una tienda de juguetes:

Al principio, ponías fotos falsas de juguetes dibujadas en cartón (los mocks) para mostrarle a tus amigos cómo se vería tu tienda.

Pero después dijiste: “che, quiero que los juguetes que aparezcan sean reales, que estén en mi depósito”.
Eso es lo que hicimos en este día.

1. Borramos los juguetes de cartón (mocks)

En tu código del frontend (React), tenías un bloque con productos inventados:

const product = (category) => {
  return {
    'gpu-nueva': [ ...productos inventados... ],
    'gpu-usada': [ ... ],
    'pc-reacondicionada': [ ... ]
  }[category];
};


Eso funcionaba solo para pruebas, pero no servía en la vida real. Lo eliminamos.

2. Conectamos la tienda del frente con el depósito (backend ↔ frontend)

Ahora, en vez de mostrar cartón, teníamos que ir al backend (Django) a buscar los productos que realmente existen en la base de datos.

En el backend ya tenías un modelo Product con campos como:

name (nombre del producto)

brand (marca)

series (serie)

price (precio)

category (tipo: gpu-nueva, gpu-usada, pc-reacondicionada)

etc.

También tenías una vista (ProductsList) que responde a:

GET /api/canje/products/?category=gpu-nueva


y devuelve productos reales en formato JSON.

El frontend debía pedir esos datos, no inventarlos.
Para eso usamos fetchProducts que llama a api.products(...).

3. El cartero que llevaba mal la dirección (bug en api.js 🐞)

Al principio, el archivo api.js armaba mal las direcciones (URLs):

Escribía cosas como:

/products/?category=gpu-nueva/


(notá ese / de más después del ?).

Django veía eso como raro y no devolvía nada.

👉 Lo corregimos para que siempre construya la URL limpia:

/products/?category=gpu-nueva

4. Normalizamos lo que vuelve (arrays o {items:[]})

El backend a veces devolvía así:

{"items": [ { "id": 1, "name": "RTX 4060 Ti", ... } ]}


y otras veces:

[ { "id": 1, "name": "RTX 4060 Ti", ... } ]


👉 En api.js hicimos que no importe cómo venga, siempre lo transformamos en un array de productos.
Así el frontend ya no se confunde.

5. React ya muestra productos reales

Una vez que corregimos esas dos cosas (URL y normalización), el ProductGrid empezó a mostrar productos de verdad en la interfaz.
Los filtros (FilterChips) también pudieron funcionar, porque ahora operaban sobre datos reales.

✅ Conclusión Día 4:
Pasamos de mostrar productos inventados (mocks) a mostrar productos reales guardados en la base de datos.
El frontend ahora pide los datos correctos al backend, el backend responde, y ambos se entienden sin problemas.
-----------------------------------------------------------------------------------------

📝 Nota para mi yo del futuro (y otros devs)

*El wizard es el corazón del proyecto. Si algo no funciona, revisá primero los endpoints (prevaluar, checkout-link) y la lógica de validación.
*api.js siempre debe ser la interfaz única entre React y Django. No dupliques fetch.
*Si el proyecto escala, migrar de mocks (StepChooseProduct) a un endpoint de catálogo real será clave.
*Usá .env para separar dev/prod y no hardcodees URLs.
*normalizers.js es tu amigo cuando las estructuras empiecen a crecer.