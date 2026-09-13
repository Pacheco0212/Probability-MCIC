import { useMemo } from 'react';

interface HistogramProps {
    faces: number;
    results: number[];
}

export default function HistogramScene({ faces, results }: HistogramProps) {
    // CÁLCULO DE FRECUENCIAS (ESTADÍSTICA DESCRIPTIVA)
    // Se utiliza el hook useMemo para memorizar el cálculo y no recalcular 
    // innecesariamente si los resultados no han cambiado.
    const frequencies = useMemo(() => {
        // Inicializamos un arreglo donde cada índice representa una cara del dado (0 a faces-1)
        const freqs = new Array(faces).fill(0);
        
        // Iteramos sobre todos los resultados obtenidos en la simulación
        results.forEach(r => {
            // Validamos que el resultado esté dentro del espacio muestral [1, faces]
            if (r >= 1 && r <= faces) {
                // Incrementamos la frecuencia absoluta del resultado correspondiente
                freqs[r - 1]++;
            }
        });
        return freqs; // Retorna el arreglo de frecuencias absolutas
    }, [faces, results]);

    // Encontramos la frecuencia máxima para escalar dinámicamente las barras CSS
    const maxFreq = Math.max(...frequencies, 1); // El 1 evita división por cero
    
    // Si no hay resultados
    if (results.length === 0) {
        return (
            <div style={{ color: '#94a3b8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', textAlign: 'center', padding: '2rem' }}>
                Realiza lanzamientos para ver el histograma de frecuencias.<br/>
                La gráfica mostrará la distribución uniforme de probabilidad.
            </div>
        );
    }

    return (
        <div style={{ height: '100%', padding: '2rem 4rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: '#f8fafc', textAlign: 'center', marginTop: 0 }}>Distribución de Probabilidad (D{faces})</h2>
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Total de lanzamientos: {results.length}</p>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px', marginTop: '2rem' }}>
                {frequencies.map((freq, i) => {
                    const heightPercent = (freq / maxFreq) * 100;
                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px', opacity: freq > 0 ? 1 : 0 }}>
                                {freq}
                            </div>
                            <div style={{ 
                                width: '100%', 
                                maxWidth: '80px', 
                                height: `${heightPercent}%`, 
                                background: '#3b82f6', 
                                borderTopLeftRadius: '6px', 
                                borderTopRightRadius: '6px',
                                minHeight: '2px',
                                transition: 'height 0.3s ease-out'
                            }}></div>
                            <div style={{ color: '#f8fafc', marginTop: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {i + 1}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
