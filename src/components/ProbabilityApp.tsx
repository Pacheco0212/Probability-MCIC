import { useState } from 'react';
import DiceUI from './DiceUI';
import SierpinskiScene from './SierpinskiScene';
import HistogramScene from './HistogramScene';

/**
 * FUNCIÓN CENTRAL DE PROBABILIDAD TEÓRICA
 * Simula el lanzamiento de un dado de n caras un número n de veces.
 * 
 * Matemáticamente, esto genera una "Distribución Uniforme Discreta", donde la probabilidad P(X = x) = 1/n para cada cara.
 * 
 * @param caras Número de caras del dado (espacio muestral n).
 * @param lanzamientos Cantidad de veces a repetir el experimento (ley de grandes números).
 * @returns Un arreglo numérico con la secuencia de resultados.
 */
function simularDadosTS(caras: number, lanzamientos: number): number[] {
    return Array.from({ length: lanzamientos }, (): number => {
        // Math.random() genera [0, 1), al multiplicar por 'caras' obtenemos [0, caras).
        // Math.floor trunca los decimales y sumamos 1 para que el rango sea [1, caras].
        return Math.floor(Math.random() * caras) + 1;
    });
}

export default function ProbabilityApp() {
  const [faces, setFaces] = useState<number>(3); 
  const [rolls, setRolls] = useState<number>(100); 
  const [results, setResults] = useState<number[]>([]);

  const handleRoll = () => {
    const nuevosResultados = simularDadosTS(faces, rolls);
    setResults(prev => [...prev, ...nuevosResultados]);
  };

  const handleClear = () => {
      setResults([]);
  };

  const handleFacesChange = (newFaces: number) => {
      setFaces(newFaces);
      setResults([]); 
  };

  return (
      <div style={{ display: 'flex', height: '100%', width: '100%', margin: 0, overflow: 'hidden' }}>

        {/* Panel Izquierdo: Controles */}
        <div style={{ width: '320px', padding: '2rem', background: '#f8fafc', borderRight: '2px solid #e2e8f0', zIndex: 10 }}>
          <h2 style={{ marginTop: 0, color: '#0f172a' }}>Probabilidad Visual</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              n=3: Juego del Caos<br/>
              n≠3: Histograma Uniforme
          </p>
          <DiceUI
              faces={faces} setFaces={handleFacesChange}
              rolls={rolls} setRolls={setRolls}
              onRoll={handleRoll} results={results}
          />
          <button
              onClick={handleClear}
              style={{ width: '100%', padding: '0.8rem', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}
          >
              LIMPIAR RESULTADOS
          </button>
        </div>

        {/* Panel Derecho: Visualizaciones */}
        <div style={{ flex: 1, position: 'relative', background: '#1e293b' }}>
          {faces === 3 ? (
              <SierpinskiScene results={results} />
          ) : (
              <HistogramScene faces={faces} results={results} />
          )}
        </div>

      </div>
  );
}
