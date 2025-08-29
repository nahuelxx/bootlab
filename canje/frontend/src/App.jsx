
import React from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import TradeWizard from '@/components/TradeWizard';

function App() {
  return (
    <>
      <Helmet>
        <title>Reacondicioná tu PC - Canje | bootLab</title>
        <meta name="description" content="Intercambia tu GPU o CPU por crédito y compra equipos reacondicionados en bootLab. Proceso rápido y seguro." />
        <meta property="og:title" content="Reacondicioná tu PC - Canje | bootLab" />
        <meta property="og:description" content="Intercambia tu GPU o CPU por crédito y compra equipos reacondicionados en bootLab. Proceso rápido y seguro." />
      </Helmet>
      <div className="min-h-screen bg-white">
        <TradeWizard />
        <Toaster />
      </div>
    </>
  );
}

export default App;
