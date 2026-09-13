import * as THREE from 'three';

function getLogicalFaces(geometry) {
    geometry = geometry.clone();
    geometry.computeVertexNormals();
    
    const pos = geometry.attributes.position;
    const index = geometry.index;
    
    const faces = [];
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
        
        // Find if we already have a face with this normal
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
        // also get quaternion to look along normal
        const dummy = new THREE.Object3D();
        dummy.position.copy(center);
        dummy.lookAt(center.clone().add(f.normal));
        return { normal: f.normal, center: center, quaternion: dummy.quaternion };
    });
}

console.log("Dodeca:", getLogicalFaces(new THREE.DodecahedronGeometry(1, 0)).length);
console.log("Box:", getLogicalFaces(new THREE.BoxGeometry(1, 1, 1)).length);
console.log("Icosa:", getLogicalFaces(new THREE.IcosahedronGeometry(1, 0)).length);
console.log("Octa:", getLogicalFaces(new THREE.OctahedronGeometry(1, 0)).length);
console.log("Tetra:", getLogicalFaces(new THREE.TetrahedronGeometry(1, 0)).length);
