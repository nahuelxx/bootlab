
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

function Stepper({ steps, currentStep, orientation = 'vertical' }) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`p-6 ${isVertical ? 'space-y-6' : 'flex space-x-4 overflow-x-auto'}`}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isUpcoming = step.id > currentStep;

        return (
          <div 
            key={step.id} 
            className={`flex items-center ${isVertical ? 'w-full' : 'flex-shrink-0'}`}
          >
            <div className="flex items-center">
              {/* Step Circle */}
              <motion.div
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'step-completed' : ''}
                  ${isActive ? 'step-active' : ''}
                  ${isUpcoming ? 'step-inactive' : ''}
                `}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </motion.div>

              {/* Step Content */}
              <div className={`ml-3 ${isVertical ? 'flex-1' : ''}`}>
                <p className={`text-sm font-medium ${
                  isActive ? 'text-green-600' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-400'
                }`}>
                  Paso {step.id}
                </p>
                <p className={`text-sm ${
                  isActive ? 'text-gray-900' : 
                  isCompleted ? 'text-gray-700' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`
                ${isVertical ? 'ml-5 mt-4 w-px h-8' : 'mx-4 w-8 h-px'}
                ${isCompleted ? 'bg-green-300' : 'bg-gray-300'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
