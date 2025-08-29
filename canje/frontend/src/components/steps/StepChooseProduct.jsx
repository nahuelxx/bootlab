
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ProductGrid from '@/components/ProductGrid';
import FilterChips from '@/components/FilterChips';
import { api } from '@/lib/api';

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

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    
    try {
      // INTEGRATION POINT: Fetch products from API
      /*
      const response = await fetch(`/api/products?category=${selectedCategory}`);
      const productsData = await response.json();
      */

      // Mock products for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProducts = generateMockProducts(selectedCategory);
      setProducts(mockProducts);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockProducts = (category) => {
    const baseProducts = {
      'gpu-nueva': [
        { id: 1, name: 'RTX 4060 Ti', brand: 'NVIDIA', series: 'RTX 40', price: 450000, image: 'Modern NVIDIA RTX 4060 Ti graphics card', specs: ['8GB GDDR6', 'Ray Tracing', 'DLSS 3'] },
        { id: 2, name: 'RTX 4070', brand: 'NVIDIA', series: 'RTX 40', price: 650000, image: 'NVIDIA RTX 4070 graphics card in packaging', specs: ['12GB GDDR6X', 'Ray Tracing', 'DLSS 3'] },
        { id: 3, name: 'RX 7600 XT', brand: 'AMD', series: 'RX 7000', price: 420000, image: 'AMD Radeon RX 7600 XT graphics card', specs: ['16GB GDDR6', 'RDNA 3', 'FSR 3'] },
        { id: 4, name: 'RTX 4080', brand: 'NVIDIA', series: 'RTX 40', price: 1200000, image: 'High-end NVIDIA RTX 4080 graphics card', specs: ['16GB GDDR6X', 'Ray Tracing', 'DLSS 3'] },
      ],
      'gpu-usada': [
        { id: 5, name: 'RTX 3070 Ti', brand: 'NVIDIA', series: 'RTX 30', price: 380000, image: 'Used NVIDIA RTX 3070 Ti graphics card', specs: ['8GB GDDR6X', 'Ray Tracing', 'DLSS 2'], condition: 'Excelente' },
        { id: 6, name: 'RTX 3080', brand: 'NVIDIA', series: 'RTX 30', price: 520000, image: 'Used NVIDIA RTX 3080 graphics card', specs: ['10GB GDDR6X', 'Ray Tracing', 'DLSS 2'], condition: 'Muy bueno' },
        { id: 7, name: 'RX 6700 XT', brand: 'AMD', series: 'RX 6000', price: 350000, image: 'Used AMD RX 6700 XT graphics card', specs: ['12GB GDDR6', 'RDNA 2', 'FSR'], condition: 'Bueno' },
      ],
      'pc-reacondicionada': [
        { id: 8, name: 'PC Gaming RTX 3060', brand: 'bootLab', series: 'Gaming', price: 850000, image: 'Refurbished gaming PC with RTX 3060', specs: ['i5-11400F', 'RTX 3060', '16GB RAM', '500GB SSD'] },
        { id: 9, name: 'PC Workstation RTX 3070', brand: 'bootLab', series: 'Pro', price: 1200000, image: 'Professional workstation PC with RTX 3070', specs: ['i7-11700', 'RTX 3070', '32GB RAM', '1TB SSD'] },
        { id: 10, name: 'PC Compact RTX 3050', brand: 'bootLab', series: 'Compact', price: 650000, image: 'Compact gaming PC with RTX 3050', specs: ['i5-10400F', 'RTX 3050', '16GB RAM', '256GB SSD'] },
      ]
    };

    return baseProducts[category] || [];
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    if (filters.series) {
      filtered = filtered.filter(product => product.series === filters.series);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }

    setFilteredProducts(filtered);
  };

const handleProductSelect = async (product) => {
  try {
    // llamada real:
    const checkoutData = await api.checkoutLink({
      product_id: product.id,
      credito_id: creditData?.credito_id, // viene de la prevaluación
    });

    onUpdate({
      ...product,
      checkoutData, // { checkout_url, saldo, total, credito_aplicado }
    });

    toast({
      title: "¡Producto seleccionado!",
      description: `${product.name} agregado con tu crédito aplicado.`,
    });

    onNext();
  } catch (error) {
    console.error('Error selecting product:', error);
    toast({
      title: "Error",
      description: error.message || "No se pudo procesar la selección. Intenta nuevamente.",
      variant: "destructive"
    });
  }
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateBalance = (productPrice) => {
    return Math.max(0, productPrice - (creditData?.pre_valuacion || 0));
  };

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
          Usa tu crédito de {formatPrice(creditData?.pre_valuacion || 0)} para comprar productos en bootLab.
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
