interface DiceUIProps {
    faces: number;
    setFaces: (val: number) => void;
    rolls: number;
    setRolls: (val: number) => void;
    onRoll: () => void;
    results: number[];
}

export default function DiceUI({ faces, setFaces, rolls, setRolls, onRoll, results }: DiceUIProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label>Número de Caras (n): </label>
                <input
                    type="number"
                    min="2"
                    value={faces}
                    onChange={(e) => setFaces(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
            </div>

            <div>
                <label>Cantidad de tiros: </label>
                <input
                    type="number"
                    min="1"
                    value={rolls}
                    onChange={(e) => setRolls(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
            </div>

            <button
                onClick={onRoll}
                style={{ padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
                TIRAR DADO
            </button>

            {results.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                    <h3>Resultados:</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {results.join(', ')}
                    </p>
                    <p>Total: {results.reduce((a, b) => a + b, 0)}</p>
                </div>
            )}
        </div>
    );
}