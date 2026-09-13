import * as THREE from 'three';
import { getLogicalFaces } from './src/utils/geometry';
const geom = new THREE.CylinderGeometry(1.5, 1.5, 2, 3);
let allFaces = getLogicalFaces(geom);
allFaces = allFaces.filter(f => Math.abs(f.normal.y) < 0.1);
console.log(allFaces.length);
