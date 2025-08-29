
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import ComponentForm from '@/components/ComponentForm';
import RayTracingBanner from '@/components/RayTracingBanner';
import { api } from '@/lib/api';

function StepComponent({ data, onUpdate, onNext, canContinue }) {
  const [componentType, setComponentType] = useState(data?.type || 'gpu');
  const [formData, setFormData] = useState(data || {
    type: 'gpu',
    brand: '',
    model: '',
    year: '',
    condition: '',
    accessories: [],
    rayTracing: false,
    photos: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTabChange = (value) => {
    setComponentType(value);
    const newData = { ...formData, type: value };
    if (value === 'cpu') {
      newData.rayTracing = false; // Reset ray tracing for CPU
    }
    setFormData(newData);
    onUpdate(newData);
  };

  const handleFormChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handlePhotosChange = (photos) => {
    const newData = { ...formData, photos };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleCalculateCredit = async () => {
    if (!canContinue) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos requeridos y sube al menos 3 fotos.",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'gpu' && !formData.rayTracing) {
      toast({
        title: "GPU no elegible",
        description: "Solo aceptamos GPUs con Ray Tracing (RTX 2060+ / AMD RDNA2+)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        condition: formData.condition,
        ray_tracing: !!formData.rayTracing,
        year: formData.year ? parseInt(formData.year) : undefined,
        accessories: formData.accessories || [],
        photos: formData.photos || [],
      };

      const prevaluationData = await api.prevaluar(payload);
      // Ej.: { credito_id, pre_valuacion, rango, vigencia_horas, mensaje }

      // Guardá lo necesario en el estado del wizard para el siguiente paso:
      onUpdate({
        ...formData,
        creditoId: prevaluationData.credito_id,
        preValuacion: prevaluationData.pre_valuacion,
        rango: prevaluationData.rango,
        vigenciaHoras: prevaluationData.vigencia_horas,
      });

      toast({ title: "¡Crédito calculado!", description: prevaluationData.mensaje || "Listo." });
      onNext();
    } catch (error) {
      console.error('Error calculating credit: ', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo calcular el credito, Intenta Nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isGpuNotEligible = formData.type === 'gpu' && !formData.rayTracing;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tu componente</h1>
        <p className="text-gray-600">
          Contanos sobre el componente que querés intercambiar por crédito.
        </p>
      </div>

      {isGpuNotEligible && <RayTracingBanner />}

      <Tabs value={componentType} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="gpu" className="text-lg py-3">
            🎮 GPU
          </TabsTrigger>
          <TabsTrigger value="cpu" className="text-lg py-3">
            🔧 CPU
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gpu" className="space-y-6">
          <ComponentForm
            type="gpu"
            data={formData}
            onChange={handleFormChange}
          />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rayTracing"
                checked={formData.rayTracing}
                onCheckedChange={(checked) => handleFormChange('rayTracing', checked)}
              />
              <Label htmlFor="rayTracing" className="text-sm font-medium">
                Mi GPU tiene Ray Tracing (obligatorio)
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Solo aceptamos GPUs RTX 2060 o superior, y equivalentes AMD RDNA2+
            </p>
          </div>
        </TabsContent>

        <TabsContent value="cpu" className="space-y-6">
          <ComponentForm
            type="cpu"
            data={formData}
            onChange={handleFormChange}
          />
        </TabsContent>
      </Tabs>

      <PhotoUpload
        photos={formData.photos}
        onChange={handlePhotosChange}
        minPhotos={3}
      />

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleCalculateCredit}
          disabled={!canContinue || isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          {isLoading ? 'Calculando...' : 'Calcular crédito'}
        </Button>
      </div>
    </div>
  );
}

export default StepComponent;
