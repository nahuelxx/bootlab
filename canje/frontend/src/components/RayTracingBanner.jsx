
import React from 'react';
import { AlertTriangle } from 'lucide-react';

function RayTracingBanner() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium text-orange-800 mb-1">
          GPU no elegible para canje
        </h4>
        <p className="text-sm text-orange-700">
          Solo aceptamos GPUs con Ray Tracing. Modelos compatibles: RTX 2060 o superior, 
          y equivalentes AMD RDNA2+ (RX 6600 XT, RX 6700 XT, etc.).
        </p>
      </div>
    </div>
  );
}

export default RayTracingBanner;
