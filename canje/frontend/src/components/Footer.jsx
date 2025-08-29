
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Footer({ currentStep, wizardData, canContinue, onNext, onPrev }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCreditAmount = () => {
    return wizardData.prevaluation?.pre_valuacion || 0;
  };

  const getSelectedProductPrice = () => {
    return wizardData.selectedProduct?.price || 0;
  };

  const getBalance = () => {
    const credit = getCreditAmount();
    const productPrice = getSelectedProductPrice();
    return Math.max(0, productPrice - credit);
  };

  const showPricing = currentStep >= 2;

  return (
    <div className="bg-white border-t border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Pricing Info */}
        {showPricing && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {wizardData.prevaluation && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Crédito:</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(getCreditAmount())}
                </span>
              </div>
            )}
            
            {wizardData.selectedProduct && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Total seleccionado:</span>
                  <span className="font-semibold">
                    {formatPrice(getSelectedProductPrice())}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Saldo a pagar:</span>
                  <span className={`font-semibold ${getBalance() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatPrice(getBalance())}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={onPrev}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver</span>
            </Button>
          )}

          {currentStep < 4 && (
            <Button
              onClick={onNext}
              disabled={!canContinue}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <span>
                {currentStep === 1 ? 'Calcular crédito' : 
                 currentStep === 2 ? 'Aceptar y elegir qué comprar' :
                 'Continuar'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Footer;
