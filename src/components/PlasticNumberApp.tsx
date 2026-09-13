import { useState } from 'react';

/**
 * FUNCIÓN ASÍNCRONA PARA EL CÁLCULO DEL NÚMERO PLÁSTICO (ρ)
 * 
 * Calcula la raíz real de la ecuación polinómica: x³ - x - 1 = 0
 * Utiliza el metodo de Newton-Raphson escalado con BigInt para evitar la pérdida
 * de precisión de los números de punto flotante de JavaScript (IEEE 754), 
 * lo que permite calcular miles de cifras decimales exactas.
 */
async function calculatePlasticNumber(digits: number): Promise<{freqs: number[], timeMs: number, digitsStr: string}> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const start = performance.now();
            
            // Factor de escala: Convertimos nuestro objetivo de decimales (digits) a una potencia de 10 (10^N)
            const N = BigInt(digits);
            const ten2N = 10n ** (2n * N); // 10^(2N) precalculado
            const ten3N = 10n ** (3n * N); // 10^(3N) precalculado

            // Estimación inicial escalada. (ρ ≈ 1.324717...)
            // Lo multiplicamos por 10^N para trabajar puramente con números enteros
            let X = (1324717n * (10n ** N)) / 1000000n; 
            
            // METODO DE NEWTON-RAPHSON: X_n+1 = X_n - F(X_n) / F'(X_n) (adaptado para la escala 10^N)
            for (let i = 0; i < 30; i++) {
                // F(X) = X³ - X - 1
                const F = X ** 3n - X * ten2N - ten3N;
                if (F === 0n) break; // Raíz exacta encontrada
                
                // Derivada: F'(X) = 3X² - 1
                const dF = 3n * (X ** 2n) - ten2N;
                
                // Siguiente iteración
                const nextX = X - (F / dF);
                if (nextX === X) break; // Convergencia absoluta alcanzada
                X = nextX;
            }

            // Convertir el entero gigante a una cadena de texto
            const str = X.toString();
            // Descartamos posibles errores de redondeo al final cortando a la longitud exacta
            const actualStr = str.substring(0, digits + 1); 
            
            // Histograma
            // Contamos la frecuencia de aparición de cada dígito (del 0 al 9)
            const freqs = new Array(10).fill(0);
            for (let i = 0; i < actualStr.length; i++) {
                freqs[parseInt(actualStr[i], 10)]++;
            }
            
            resolve({
                freqs,
                timeMs: performance.now() - start,
                digitsStr: actualStr.substring(0, 1) + "." + actualStr.substring(1, 100) + "..." // preview
            });
        }, 50);
    });
}

export default function PlasticNumberApp() {
    const [digits, setDigits] = useState<number>(10000);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{freqs: number[], timeMs: number, digitsStr: string} | null>(null);

    const handleCalculate = async () => {
        setLoading(true);
        setResult(null);
        const res = await calculatePlasticNumber(digits);
        setResult(res);
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', margin: 0 }}>
            {/* Panel Izquierdo: Controles */}
            <div style={{ width: '320px', padding: '2rem', background: '#f8fafc', borderRight: '2px solid #e2e8f0', zIndex: 10 }}>
                <h2 style={{ marginTop: 0, color: '#0f172a' }}>Número Plástico</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Calcula las cifras significativas de ρ (raíz real de x³ = x + 1).
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cantidad de Cifras:</label>
                    <input 
                        type="number" 
                        value={digits} 
                        onChange={e => setDigits(Number(e.target.value))} 
                        min="10" 
                        max="200000"
                        style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                    />
                    <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.5rem' }}>
                        * Nota: Calcular 1GB (mil millones) colapsaría el navegador. Limitado a 200,000 cifras (tarda ~3 segs).
                    </small>
                </div>

                <button
                    onClick={handleCalculate}
                    disabled={loading}
                    style={{ width: '100%', padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                    {loading ? 'CALCULANDO...' : 'CALCULAR Y ANALIZAR'}
                </button>
                
                {result && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Información</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Tiempo: {result.timeMs.toFixed(0)} ms</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', wordBreak: 'break-all', color: '#64748b' }}>
                            <strong>Muestra:</strong> {result.digitsStr}
                        </p>
                    </div>
                )}
            </div>

            {/* Panel Derecho: Histograma */}
            <div style={{ flex: 1, position: 'relative', background: '#1e293b', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#f8fafc', textAlign: 'center', marginTop: 0 }}>Histograma de Dígitos (0-9)</h2>
                {result ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px', marginTop: '2rem' }}>
                        {result.freqs.map((freq, i) => {
                            const maxFreq = Math.max(...result.freqs);
                            const heightPercent = (freq / maxFreq) * 100;
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '4px' }}>
                                        {freq}
                                    </div>
                                    <div style={{ 
                                        width: '100%', 
                                        maxWidth: '60px', 
                                        height: `${heightPercent}%`, 
                                        background: '#10b981', 
                                        borderTopLeftRadius: '6px', 
                                        borderTopRightRadius: '6px',
                                        transition: 'height 0.3s ease-out'
                                    }}></div>
                                    <div style={{ color: '#f8fafc', marginTop: '12px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        {i}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ color: '#94a3b8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', textAlign: 'center' }}>
                        Inicia el cálculo para ver la distribución<br/>
                        de los dígitos del Número Plástico.
                    </div>
                )}
            </div>
        </div>
    );
}
