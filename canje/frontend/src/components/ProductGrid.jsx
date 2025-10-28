import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1635865165118-917ed9e20936";

function ProductGrid({
  products = [],
  isLoading,
  creditAmount,
  onProductSelect,
  calculateBalance,
  formatPrice,
}) {
  // Normalizamos para evitar undefined/null
  const list = Array.isArray(products) ? products : [];
  const safeProducts = Array.isArray(products) ? products : [];
{safeProducts.map((product, index) => {
  const specs = Array.isArray(product.specs) ? product.specs : [];
  // ...
  {specs.slice(0,3).map}
})}


  // 1) Estado de carga (skeleton)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2) Estado vacío
  if (!list.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
        <p className="text-gray-600">Intenta ajustar los filtros para ver más opciones.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((product, index) => {
        const price = Number(product?.price) || 0;
        const specs = Array.isArray(product?.specs) ? product.specs : [];
        const image = product?.image || FALLBACK_IMG;

        const balance = typeof calculateBalance === "function"
          ? calculateBalance(price)
          : Math.max(0, price - Number(creditAmount || 0));

        const isAffordable = balance === 0;

        return (
          <motion.div
            key={product?.id ?? `p-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Imagen */}
            <div className="aspect-video bg-gray-100 relative">
              <img
                className="w-full h-full object-cover"
                alt={`${product?.name ?? "Producto"} image`}
                src={image}
                loading="lazy"
              />
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {isAffordable && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Compatible
                  </Badge>
                )}
                {!!product?.condition && (
                  <Badge variant="secondary">{product.condition}</Badge>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {product?.name ?? "Producto"}
                </h3>
                {(product?.brand || product?.series) && (
                  <p className="text-sm text-gray-600">
                    {product?.brand}
                    {product?.brand && product?.series ? " • " : ""}
                    {product?.series}
                  </p>
                )}
              </div>

              {/* Specs (blindeadas) */}
              {!!specs.length && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {specs.slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Precios */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="font-semibold text-gray-900">
                    {typeof formatPrice === "function" ? formatPrice(price) : price}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tu crédito:</span>
                  <span className="font-semibold text-green-600">
                    -
                    {typeof formatPrice === "function"
                      ? formatPrice(Math.min(creditAmount || 0, price))
                      : Math.min(creditAmount || 0, price)}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Saldo a pagar:</span>
                    <span className={`font-bold ${balance > 0 ? "text-orange-600" : "text-green-600"}`}>
                      {typeof formatPrice === "function" ? formatPrice(balance) : balance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acción */}
              <Button
                onClick={() => onProductSelect?.(product)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Aplicar crédito y continuar
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ProductGrid;