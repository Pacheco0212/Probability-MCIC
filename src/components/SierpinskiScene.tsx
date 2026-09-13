import { useEffect, useRef } from 'react';

interface SierpinskiProps {
    results: number[];
}

export default function SierpinskiScene({ results }: SierpinskiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Definir los 3 vértices del triángulo equilátero
        const width = canvas.width;
        const height = canvas.height;
        const margin = 50;

        const p1 = { x: width / 2, y: margin }; // Arriba (Vértice 1)
        const p2 = { x: margin, y: height - margin }; // Abajo Izquierda (Vértice 2)
        const p3 = { x: width - margin, y: height - margin }; // Abajo Derecha (Vértice 3)

        const vertices = [p1, p2, p3];

        // Dibujar el triángulo base y las etiquetas
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.stroke();

        ctx.font = '24px Arial';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText('1', p1.x, p1.y - 15);
        ctx.fillText('2', p2.x - 20, p2.y + 20);
        ctx.fillText('3', p3.x + 20, p3.y + 20);

        // Dibujar los vértices como puntos
        ctx.fillStyle = '#ef4444';
        vertices.forEach(v => {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        if (results.length === 0) return;

        // Iniciar en un punto aleatorio dentro del triángulo (En el centro)
        let currentPoint = { x: width / 2, y: height / 2 + 50 };

        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';

        // CÁLCULO DEL FRACTAL (EL JUEGO DEL CAOS)
        results.forEach((roll) => {
            // Buscamos el vértice asociado a la cara que cayó (cara 1 -> vértice 0, etc.)
            const targetVertex = vertices[roll - 1];
            if (!targetVertex) return; 

            // ALGORITMO DEL PUNTO MEDIO (GEOMETRÍA ANALÍTICA)
            // Para encontrar el punto medio exacto entre dos coordenadas P1(x1, y1) y P2(x2, y2),
            // sumamos sus componentes y dividimos entre 2: M = ( (x1+x2)/2 , (y1+y2)/2 )
            const nextPoint = {
                x: (currentPoint.x + targetVertex.x) / 2,
                y: (currentPoint.y + targetVertex.y) / 2
            };

            // Dibujar la línea desde el punto actual al vértice (solo si son pocos tiros para no saturar)
            if (results.length <= 100) {
                ctx.beginPath();
                ctx.moveTo(currentPoint.x, currentPoint.y);
                ctx.lineTo(targetVertex.x, targetVertex.y);
                ctx.stroke();
            }

            // Dibujar el nuevo punto calculado
            ctx.beginPath();
            // Si hay demasiados puntos, los hacemos más pequeños (radio 1) para mayor precisión del fractal
            ctx.arc(nextPoint.x, nextPoint.y, results.length > 1000 ? 1 : 3, 0, Math.PI * 2);
            ctx.fill();

            // El punto medio recién calculado se convierte en el origen para el siguiente tiro
            currentPoint = nextPoint;
        });

    }, [results]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas 
                ref={canvasRef} 
                width={800}
                height={800} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            {results.length === 0 && (
                <div style={{ position: 'absolute', color: '#94a3b8', fontSize: '1.2rem' }}>
                    Realiza lanzamientos con un dado de 3 caras para ver el Fractal.
                </div>
            )}
        </div>
    );
}
