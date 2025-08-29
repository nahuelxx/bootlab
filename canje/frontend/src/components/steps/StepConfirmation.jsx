
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, Check, Package, CreditCard, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function StepConfirmation({ wizardData, onUpdate, onPrev }) {
  const { toast } = useToast();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleGoToCart = () => {
    const checkoutUrl = wizardData.selectedProduct?.checkoutData?.checkout_url;
    
    if (checkoutUrl) {
      // Open Tiendanube checkout in new tab
      window.open(checkoutUrl, '_blank');
      
      toast({
        title: "¡Redirigiendo a tu carrito!",
        description: "Se abrió una nueva pestaña con tu producto y crédito aplicado.",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo generar el enlace del carrito. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const handleContinueShopping = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
      description: "Pronto podrás seguir navegando productos.",
    });
  };

  const formatComponent = () => {
    const comp = wizardData.component;
    if (!comp) return '';
    return `${comp.brand} ${comp.model} (${comp.year})`;
  };

  const checkoutData = wizardData.selectedProduct?.checkoutData;
  const creditAmount = wizardData.prevaluation?.pre_valuacion || 0;
  const productPrice = wizardData.selectedProduct?.price || 0;
  const balance = checkoutData?.saldo || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Todo listo!</h1>
        <p className="text-gray-600">
          Tu canje ha sido procesado exitosamente. Aquí tienes el resumen de tu transacción.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Component Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Componente entregado</h3>
              <p className="text-sm text-gray-600">Para canje</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{formatComponent()}</p>
            <p className="text-sm text-gray-600">
              Estado: {wizardData.component?.condition}
            </p>
            <p className="text-sm text-gray-600">
              {wizardData.component?.accessories?.length || 0} accesorios incluidos
            </p>
          </div>
        </motion.div>

        {/* Credit Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Crédito obtenido</h3>
              <p className="text-sm text-gray-600">Aplicado al carrito</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(creditAmount)}
            </p>
            <p className="text-sm text-gray-600">
              Válido por {wizardData.prevaluation?.vigencia_horas || 48} horas
            </p>
          </div>
        </motion.div>

        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Producto elegido</h3>
              <p className="text-sm text-gray-600">En tu carrito</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {wizardData.selectedProduct?.name}
            </p>
            <p className="text-sm text-gray-600">
              {wizardData.selectedProduct?.brand}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(productPrice)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Payment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 border border-gray-200 rounded-lg p-6"
      >
        <h3 className="font-medium text-gray-900 mb-4">Resumen de pago</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Precio del producto:</span>
            <span className="font-medium">{formatPrice(productPrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Crédito aplicado:</span>
            <span className="font-medium text-green-600">
              -{formatPrice(Math.min(creditAmount, productPrice))}
            </span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Saldo a pagar:</span>
              <span className={`font-bold text-lg ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatPrice(balance)}
              </span>
            </div>
          </div>
          
          {balance > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              El saldo restante se puede pagar con MercadoPago en el checkout.
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 pt-6"
      >
        <Button
          onClick={handleGoToCart}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Ir al carrito en BootLab (Tiendanube)
        </Button>
        
        <Button
          variant="outline"
          onClick={handleContinueShopping}
          className="flex-1 py-3"
        >
          Seguir mirando productos
        </Button>
      </motion.div>

      {/* Back Button */}
      <div className="flex justify-start pt-4">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al paso anterior
        </Button>
      </div>
    </div>
  );
}

export default StepConfirmation;
