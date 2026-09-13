import * as THREE from 'three';
import fs from 'fs';
const geom = new THREE.CylinderGeometry(1.5, 1.5, 2, 3);
console.log("Positions:", geom.attributes.position.count);
