
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import StepComponent from '@/components/steps/StepComponent';
import StepPrevaluation from '@/components/steps/StepPrevaluation';
import StepChooseProduct from '@/components/steps/StepChooseProduct';
import StepConfirmation from '@/components/steps/StepConfirmation';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

const STEPS = [
  { id: 1, title: 'Tu componente', icon: '🔧' },
  { id: 2, title: 'Pre-valuación', icon: '💰' },
  { id: 3, title: 'Elegí qué comprar', icon: '🛒' },
  { id: 4, title: 'Confirmación', icon: '✅' }
];

function TradeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    component: null,
    prevaluation: null,
    selectedProduct: null,
    checkoutData: null
  });
  const { toast } = useToast();

  // Load progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('bootlab-trade-wizard');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWizardData(parsed.data || {});
        setCurrentStep(parsed.step || 1);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('bootlab-trade-wizard', JSON.stringify({
      step: currentStep,
      data: wizardData
    }));
  }, [currentStep, wizardData]);

  const updateWizardData = (key, value) => {
    setWizardData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return wizardData.component && 
               wizardData.component.photos && 
               wizardData.component.photos.length >= 3 &&
               (wizardData.component.type !== 'gpu' || wizardData.component.rayTracing);
      case 2:
        return wizardData.prevaluation;
      case 3:
        return wizardData.selectedProduct;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepComponent
            data={wizardData.component}
            onUpdate={(data) => updateWizardData('component', data)}
            onNext={nextStep}
            canContinue={canContinue()}
          />
        );
      case 2:
        return (
          <StepPrevaluation
            componentData={wizardData.component}
            data={wizardData.prevaluation}
            onUpdate={(data) => updateWizardData('prevaluation', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <StepChooseProduct
            creditData={wizardData.prevaluation}
            data={wizardData.selectedProduct}
            onUpdate={(data) => updateWizardData('selectedProduct', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <StepConfirmation
            wizardData={wizardData}
            onUpdate={(data) => updateWizardData('checkoutData', data)}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Desktop Stepper - Left Sidebar */}
        <div className="hidden lg:block w-80 bg-gray-50 border-r border-gray-200">
          <Stepper 
            steps={STEPS} 
            currentStep={currentStep} 
            orientation="vertical"
          />
        </div>

        {/* Mobile Stepper - Top */}
        <div className="lg:hidden w-full bg-gray-50 border-b border-gray-200 p-4">
          <Stepper 
            steps={STEPS} 
            currentStep={currentStep} 
            orientation="horizontal"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <Footer 
            currentStep={currentStep}
            wizardData={wizardData}
            canContinue={canContinue()}
            onNext={nextStep}
            onPrev={prevStep}
          />
        </div>
      </div>
    </div>
  );
}

export default TradeWizard;
