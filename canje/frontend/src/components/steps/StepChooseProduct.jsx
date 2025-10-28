import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ProductGrid from '@/components/ProductGrid';
import FilterChips from '@/components/FilterChips';
import { api } from '@/lib/api';
import { getCreditAmount } from '@/utils/normalizers';

function StepChooseProduct({ creditData, data, onUpdate, onNext, onPrev }) {
  const [selectedCategory, setSelectedCategory] = useState('gpu-nueva');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    series: '',
    priceRange: ''
  });
  const { toast } = useToast();

  // 🚩 Al cambiar de categoría, reseteamos filtros y pedimos productos
  useEffect(() => {
    setFilters({ brand: '', series: '', priceRange: '' }); // <--
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Reaplicar filtros cuando cambien productos o filtros
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, filters]);

const fetchProducts = async () => {
  setIsLoading(true);
  try {
    const raw = await api.products({ category: selectedCategory });
    const items = (raw || []).map((p, i) => ({
      id: p.id ?? i,
      name: p.name ?? p.title ?? 'Producto',
      brand: p.brand ?? '',
      series: p.series ?? '',
      price: Number(p.price ?? 0),
      specs: Array.isArray(p.specs) ? p.specs : [],
      condition: p.condition ?? '',
      image: p.image_url || p.image || null,
    }));
    setProducts(items);
    setFilteredProducts(items);
  } catch (error) {
    console.error('Error fetching products:', error);
    toast({
      title: "Error",
      description: "No se pudieron cargar los productos. Intenta nuevamente.",
      variant: "destructive"
    });
    setProducts([]);
    setFilteredProducts([]);
  } finally {
    setIsLoading(false);
  }
};

  const applyFilters = (source = products) => {
    const base = Array.isArray(source) ? source : [];
    let result = base;

    if (filters.brand)  result = result.filter(p => p.brand === filters.brand);
    if (filters.series) result = result.filter(p => p.series === filters.series);

    // Soportar "min-max", "min-" y "min" (solo piso)
    if (filters.priceRange) { // <--
      const [minStr, maxStr] = String(filters.priceRange).split('-'); // <-- soporta "1000000-" o "1000000"
      const min = Number(minStr || 0);
      const max = maxStr === undefined || maxStr === '' ? null : Number(maxStr);
      result = result.filter(p => (max == null ? p.price >= min : (p.price >= min && p.price <= max)));
    }

    setFilteredProducts(result);
  };

const handleProductSelect = async (product) => {
  try {
    const checkoutData = await api.checkoutLink({
      product_id: product.id,
      credito_id: creditData?.credito_id,
      product_price: Number(product.price),
      product_name: product.name,
    });

    onUpdate({ ...product, checkoutData });
    toast({ title: "¡Producto seleccionado!", description: `${product.name} agregado con tu crédito.` });
    onNext();
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: err.message || "No se pudo procesar la selección.", variant: "destructive" });
  }
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateBalance = (productPrice) =>
    Math.max(0, Number(productPrice) - Number(creditData?.pre_valuacion || 0));

  const categories = [
    { id: 'gpu-nueva', label: 'GPU Nueva', icon: '🆕' },
    { id: 'gpu-usada', label: 'GPU Usada (≤4 meses)', icon: '♻️' },
    { id: 'pc-reacondicionada', label: 'PC Reacondicionada', icon: '🖥️' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Elegí qué comprar</h1>
        <p className="text-gray-600">
          Usa tu crédito de {formatPrice(getCreditAmount(creditData))} para comprar productos en bootLab.
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm py-3">
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <FilterChips
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
              category={selectedCategory}
            />

            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              creditAmount={creditData?.pre_valuacion || 0}
              onProductSelect={handleProductSelect}
              calculateBalance={calculateBalance}
              formatPrice={formatPrice}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-start pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
        >
          Volver a pre-valuación
        </Button>
      </div>
    </div>
  );
}

export default StepChooseProduct;
