import * as THREE from 'three';

export interface LogicalFace {
    normal: THREE.Vector3;
    center: THREE.Vector3;
    quaternion: THREE.Quaternion;
}

export function getLogicalFaces(geometry: THREE.BufferGeometry): LogicalFace[] {
    const geom = geometry.clone();
    geom.computeVertexNormals();
    
    const pos = geom.attributes.position;
    const index = geom.index;
    
    const faces: { normal: THREE.Vector3, centroids: THREE.Vector3[] }[] = [];
    const count = index ? index.count : pos.count;
    
    for (let i = 0; i < count; i += 3) {
        const a = index ? index.getX(i) : i;
        const b = index ? index.getX(i + 1) : i + 1;
        const c = index ? index.getX(i + 2) : i + 2;
        
        const vA = new THREE.Vector3().fromBufferAttribute(pos, a);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, b);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, c);
        
        const triangle = new THREE.Triangle(vA, vB, vC);
        const normal = new THREE.Vector3();
        triangle.getNormal(normal);
        
        const centroid = new THREE.Vector3();
        triangle.getMidpoint(centroid);
        
        const existingFace = faces.find(f => f.normal.angleTo(normal) < 0.1);
        if (existingFace) {
            existingFace.centroids.push(centroid);
        } else {
            faces.push({ normal: normal.clone(), centroids: [centroid] });
        }
    }
    
    return faces.map(f => {
        const center = new THREE.Vector3();
        f.centroids.forEach(c => center.add(c));
        center.divideScalar(f.centroids.length);
        
        const dummy = new THREE.Object3D();
        dummy.position.copy(center);
        dummy.lookAt(center.clone().add(f.normal));
        
        return { normal: f.normal, center: center, quaternion: dummy.quaternion };
    });
}
