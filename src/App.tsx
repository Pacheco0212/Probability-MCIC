import { useState } from 'react';
import ProbabilityApp from './components/ProbabilityApp';
import PlasticNumberApp from './components/PlasticNumberApp';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dice' | 'plastic'>('dice');

  return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', margin: 0, overflow: 'hidden' }}>
        
        {/* Barra de Navegación Superior */}
        <div style={{ display: 'flex', background: '#0f172a', padding: '0 2rem' }}>
            <div style={{ padding: '1rem', color: 'white', fontWeight: 'bold', marginRight: '2rem' }}>
                Eduardo ProbaLabs
            </div>
            <button 
                onClick={() => setActiveTab('dice')}
                style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'dice' ? '3px solid #3b82f6' : '3px solid transparent',
                    color: activeTab === 'dice' ? '#3b82f6' : '#cbd5e1',
                    padding: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }}
            >
                Simulador Probabilístico
            </button>
            <button 
                onClick={() => setActiveTab('plastic')}
                style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'plastic' ? '3px solid #10b981' : '3px solid transparent',
                    color: activeTab === 'plastic' ? '#10b981' : '#cbd5e1',
                    padding: '1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }}
            >
                Número Plástico (ρ)
            </button>
        </div>

        {/* Contenedor Principal */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {activeTab === 'dice' && <ProbabilityApp />}
            {activeTab === 'plastic' && <PlasticNumberApp />}
        </div>
      </div>
  );
}