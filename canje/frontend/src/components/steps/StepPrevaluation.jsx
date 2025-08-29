
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

function StepPrevaluation({ componentData, data, onUpdate, onNext, onPrev }) {
  const [prevaluationData, setPrevaluationData] = useState(data);
  const [isLoading, setIsLoading] = useState(!data);
  const { toast } = useToast();

  useEffect(() => {
    if (!data && componentData) {
      fetchPrevaluation();
    }
  }, [componentData, data]);

  const fetchPrevaluation = async () => {
    setIsLoading(true);
    
    try {
    const result = await api.prevaluar({
      type: componentData.type,
      brand: componentData.brand,
      model: componentData.model,
      condition: componentData.condition,
      ray_tracing: !!componentData.rayTracing,
      year: componentData.year ? parseInt(componentData.year) : undefined,
      accessories: componentData.accessories || [],
      photos: (componentData.photos || []).map(p => p.dataUrl ?? p),
    });

    setPrevaluationData(result);
    onUpdate(result);
  } catch (error) {
    console.error('Error fetching prevaluation:', error);
    toast({
      title: "Error",
      description: error.message || "No se pudo obtener la pre-valuación. Intenta nuevamente.",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatComponent = () => {
    if (!componentData) return '';
    return `${componentData.brand} ${componentData.model} (${componentData.year})`;
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-valuación</h1>
          <p className="text-gray-600">
            Estamos analizando tu componente...
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <DollarSign className="w-8 h-8 text-green-600" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prevaluationData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-valuación</h1>
          <p className="text-gray-600">
            Hubo un problema al obtener la pre-valuación.
          </p>
        </div>

        <div className="text-center">
          <Button onClick={fetchPrevaluation} className="bg-green-600 hover:bg-green-700">
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-valuación</h1>
        <p className="text-gray-600">
          Aquí está la valuación estimada de tu componente.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Component Summary */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Componente a intercambiar</h3>
          <p className="text-sm text-gray-600 mt-1">{formatComponent()}</p>
          <p className="text-xs text-gray-500 mt-1">
            Estado: {componentData?.condition} • {componentData?.accessories?.length || 0} accesorios incluidos
          </p>
        </div>

        {/* Valuation Amount */}
        <div className="px-6 py-8 text-center">
          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-600">Crédito estimado</p>
            <p className="text-4xl font-bold text-green-600">
              {formatPrice(prevaluationData.pre_valuacion)}
            </p>
            <p className="text-sm text-gray-500">
              Rango: {formatPrice(prevaluationData.rango[0])} - {formatPrice(prevaluationData.rango[1])}
            </p>
          </div>

          {/* Validity */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
            <Clock className="w-4 h-4" />
            <span>Válido por {prevaluationData.vigencia_horas} horas</span>
          </div>

          {/* Legal Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Importante
              </p>
              <p className="text-sm text-blue-700">
                {prevaluationData.mensaje}. El valor final puede ajustarse tras la verificación técnica del componente.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex-1"
        >
          Volver a editar
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          Aceptar y elegir qué comprar
        </Button>
      </div>
    </div>
  );
}

export default StepPrevaluation;
