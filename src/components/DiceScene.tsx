import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, usePlane, useSphere } from '@react-three/cannon';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getLogicalFaces } from '../utils/geometry';

// 1. El suelo donde rebotará el dado
function Floor() {
    const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -2, 0] }));
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <mesh ref={ref as any} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#cbd5e1" />
        </mesh>
    );
}

// 1.5 Paredes invisibles
function Walls() {
    usePlane(() => ({ position: [0, 0, -8], rotation: [0, 0, 0] })); 
    usePlane(() => ({ position: [0, 0, 8], rotation: [0, Math.PI, 0] })); 
    usePlane(() => ({ position: [-8, 0, 0], rotation: [0, Math.PI / 2, 0] })); 
    usePlane(() => ({ position: [8, 0, 0], rotation: [0, -Math.PI / 2, 0] })); 
    return null;
}

// 2. El objeto físico (El "Dado")
function OrbDice({ trigger, index, faces, predeterminedResult }: { trigger: number, index: number, faces: number, predeterminedResult: number }) {
    // Geometría
    const { geometry, logicalFaces } = useMemo(() => {
        let geom: THREE.BufferGeometry;
        let isPrism = false;
        
        const safeFaces = Math.max(2, faces || 6); // Prevenir crash si el usuario borra el input (faces = 0)
        
        if (safeFaces === 4) geom = new THREE.TetrahedronGeometry(1.2, 0);
        else if (safeFaces === 6) geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        else if (safeFaces === 8) geom = new THREE.OctahedronGeometry(1.2, 0);
        else if (safeFaces === 12) geom = new THREE.DodecahedronGeometry(1.2, 0);
        else if (safeFaces === 20) geom = new THREE.IcosahedronGeometry(1.2, 0);
        else {
            geom = new THREE.CylinderGeometry(1.5, 1.5, 2, safeFaces);
            isPrism = true;
        }

        let allFaces = getLogicalFaces(geom);
        
        if (isPrism) {
            allFaces = allFaces.filter(f => Math.abs(f.normal.y) < 0.1);
        }
        
        return { geometry: geom, logicalFaces: allFaces };
    }, [faces]);

    // Física
    const [ref, api] = useSphere(() => ({ mass: 1, position: [0, -10, 0], args: [1.2], linearDamping: 0.1, angularDamping: 0.1 }));

    // Suscripciones para leer estado físico
    const velocity = useRef([0, 0, 0]);
    const angularVelocity = useRef([0, 0, 0]);
    const quaternion = useRef([0, 0, 0, 1]);
    const position = useRef([0, 0, 0]);
    
    useEffect(() => {
        const unsubVel = api.velocity.subscribe(v => velocity.current = v);
        const unsubAngVel = api.angularVelocity.subscribe(v => angularVelocity.current = v);
        const unsubQuat = api.quaternion.subscribe(q => quaternion.current = q);
        const unsubPos = api.position.subscribe(p => position.current = p);
        return () => { unsubVel(); unsubAngVel(); unsubQuat(); unsubPos(); };
    }, [api]);

    // Efecto de tiro
    useEffect(() => {
        if (trigger > 0) {
            const rand = new Uint32Array(6);
            window.crypto.getRandomValues(rand);
            const r = (i: number) => (rand[i] / 0xffffffff - 0.5);

            const offsetX = (index % 4) * 2.5 - 3.75;
            const offsetZ = Math.floor(index / 4) * 2.5 - 3.75;

            api.position.set(offsetX, 8 + index, offsetZ); 
            api.velocity.set(r(0) * 8, 5, r(1) * 8); 
            api.angularVelocity.set(r(2) * 30, r(3) * 30, r(4) * 30); 
        }
    }, [trigger, api, index]);

    // Lógica para determinar el resultado por puras físicas
    useFrame(() => {
        if (!ref.current || logicalFaces.length === 0 || trigger === 0 || !predeterminedResult) return;
        
        const speed = new THREE.Vector3(...velocity.current).length();
        const angSpeed = new THREE.Vector3(...angularVelocity.current).length();
        const posY = position.current[1];

        if (posY < 1.5 && speed < 0.2 && angSpeed < 0.2) {
            const currentQ = new THREE.Quaternion(...quaternion.current);
            
            // Forzamos visualmente que la cara resultante quede apuntando perfectamente hacia arriba
            const targetFaceIdx = (predeterminedResult - 1) % logicalFaces.length;
            const targetFace = logicalFaces[targetFaceIdx];
            
            if (targetFace) {
                const targetQ = new THREE.Quaternion().setFromUnitVectors(targetFace.normal, new THREE.Vector3(0, 1, 0));
                
                // Interpolar muy suavemente para que parezca que el dado se asienta de manera natural
                currentQ.slerp(targetQ, 0.15);
                api.quaternion.set(currentQ.x, currentQ.y, currentQ.z, currentQ.w);
                
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
            }
        }
    });

    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <mesh ref={ref as any} castShadow geometry={geometry}>
            <meshStandardMaterial color="#3b82f6" flatShading={true} />
            
            {/* Números en las caras */}
            {logicalFaces.map((face, idx) => {
                const safeFaces = Math.max(2, faces || 6);
                const num = (idx % safeFaces) + 1;
                const textPos = face.center.clone().add(face.normal.clone().multiplyScalar(0.02));
                return (
                    <group key={idx} position={textPos} quaternion={[face.quaternion.x, face.quaternion.y, face.quaternion.z, face.quaternion.w]}>
                        <Text 
                            fontSize={safeFaces === 20 || safeFaces > 12 ? 0.4 : 0.6} 
                            color="white" 
                            anchorX="center" 
                            anchorY="middle"
                            rotation={[0, Math.PI, 0]} 
                        >
                            {String(num)}
                        </Text>
                    </group>
                );
            })}
        </mesh>
    );
}

// 3. El lienzo principal
export default function DiceScene({ rollTrigger, rolls, faces, predeterminedResults }: { rollTrigger: number, rolls: number, faces: number, predeterminedResults: number[] }) {
    const safeRolls = Math.max(1, rolls || 1); 
    
    return (
        <Canvas shadows camera={{ position: [0, 8, 12], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight castShadow position={[10, 10, 5]} intensity={1.5} />

            {/* El motor de físicas */}
            <Physics defaultContactMaterial={{ restitution: 0.6, friction: 0.1 }}>
                <Floor />
                <Walls />
                {Array.from({ length: safeRolls }).map((_, i) => (
                    <OrbDice 
                        key={`dice-${i}`} 
                        trigger={rollTrigger} 
                        index={i} 
                        faces={faces} 
                        predeterminedResult={predeterminedResults[i] || 1} 
                    />
                ))}
            </Physics>

            <OrbitControls />
            <Environment preset="city" />
        </Canvas>
    );
}