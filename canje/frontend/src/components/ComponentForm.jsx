
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

function ComponentForm({ type, data, onChange }) {
  const brands = type === 'gpu' 
    ? ['NVIDIA', 'AMD'] 
    : ['Intel', 'AMD'];

  const conditions = [
    { value: 'excelente', label: 'Excelente', description: 'Como nuevo, sin uso visible' },
    { value: 'bueno', label: 'Bueno', description: 'Signos mínimos de uso' },
    { value: 'regular', label: 'Regular', description: 'Uso visible pero funcional' }
  ];

  const accessories = type === 'gpu'
    ? ['Caja original', 'Cables de alimentación', 'Manual/CD', 'Adaptadores']
    : ['Caja original', 'Cooler original', 'Manual/CD', 'Pasta térmica'];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleAccessoryChange = (accessory, checked) => {
    const currentAccessories = data.accessories || [];
    const newAccessories = checked
      ? [...currentAccessories, accessory]
      : currentAccessories.filter(a => a !== accessory);
    onChange('accessories', newAccessories);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Brand */}
      <div className="space-y-2">
        <Label htmlFor="brand" className="text-sm font-medium">
          Marca *
        </Label>
        <select
          id="brand"
          value={data.brand || ''}
          onChange={(e) => onChange('brand', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Selecciona una marca</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label htmlFor="model" className="text-sm font-medium">
          Modelo exacto *
        </Label>
        <input
          type="text"
          id="model"
          value={data.model || ''}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder={type === 'gpu' ? 'ej: RTX 3060 Ti' : 'ej: i5-10400F'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Year */}
      <div className="space-y-2">
        <Label htmlFor="year" className="text-sm font-medium">
          Año aproximado *
        </Label>
        <select
          id="year"
          value={data.year || ''}
          onChange={(e) => onChange('year', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Selecciona el año</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Estado *</Label>
        <div className="space-y-2">
          {conditions.map(condition => (
            <div key={condition.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={condition.value}
                name="condition"
                value={condition.value}
                checked={data.condition === condition.value}
                onChange={(e) => onChange('condition', e.target.value)}
                className="text-green-600 focus:ring-green-500"
              />
              <Label htmlFor={condition.value} className="flex-1 cursor-pointer">
                <div className="font-medium">{condition.label}</div>
                <div className="text-xs text-gray-500">{condition.description}</div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div className="md:col-span-2 space-y-3">
        <Label className="text-sm font-medium">Accesorios incluidos</Label>
        <div className="grid grid-cols-2 gap-3">
          {accessories.map(accessory => (
            <div key={accessory} className="flex items-center space-x-2">
              <Checkbox
                id={accessory}
                checked={(data.accessories || []).includes(accessory)}
                onCheckedChange={(checked) => handleAccessoryChange(accessory, checked)}
              />
              <Label htmlFor={accessory} className="text-sm cursor-pointer">
                {accessory}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ComponentForm;
