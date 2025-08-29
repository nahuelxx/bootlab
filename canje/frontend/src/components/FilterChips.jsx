
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

function FilterChips({ products, filters, onFiltersChange, category }) {
  const getUniqueValues = (key) => {
    return [...new Set(products.map(product => product[key]))].filter(Boolean);
  };

  const brands = getUniqueValues('brand');
  const series = getUniqueValues('series');
  
  const priceRanges = [
    { label: 'Hasta $300k', value: '0-300000' },
    { label: '$300k - $600k', value: '300000-600000' },
    { label: '$600k - $1M', value: '600000-1000000' },
    { label: 'Más de $1M', value: '1000000' }
  ];

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: filters[key] === value ? '' : value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      brand: '',
      series: '',
      priceRange: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Brand Filters */}
        {brands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center mr-2">Marca:</span>
            {brands.map(brand => (
              <Button
                key={brand}
                variant={filters.brand === brand ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('brand', brand)}
                className={filters.brand === brand ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {brand}
              </Button>
            ))}
          </div>
        )}

        {/* Series Filters */}
        {series.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center mr-2">Serie:</span>
            {series.map(serie => (
              <Button
                key={serie}
                variant={filters.series === serie ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('series', serie)}
                className={filters.series === serie ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {serie}
              </Button>
            ))}
          </div>
        )}

        {/* Price Range Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center mr-2">Precio:</span>
          {priceRanges.map(range => (
            <Button
              key={range.value}
              variant={filters.priceRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('priceRange', range.value)}
              className={filters.priceRange === range.value ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterChips;
