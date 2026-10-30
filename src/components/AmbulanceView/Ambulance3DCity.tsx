import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HospitalCandidate } from '../../types';

interface Ambulance3DCityProps {
  selectedHospital: HospitalCandidate;
  hospitals: HospitalCandidate[];
  onSelectHospital: (hospital: HospitalCandidate) => void;
}

export const Ambulance3DCity: React.FC<Ambulance3DCityProps> = ({
  selectedHospital,
  hospitals,
  onSelectHospital,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<THREE.Line | null>(null);
  const ambulanceGroupRef = useRef<THREE.Group | null>(null);
  const redStrobeLightRef = useRef<THREE.PointLight | null>(null);
  const blueStrobeLightRef = useRef<THREE.PointLight | null>(null);
  const hospitalMarkersRef = useRef<{ [id: string]: THREE.Group }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c18);
    scene.fog = new THREE.FogExp2(0x060c18, 0.02);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 150);
    camera.position.set(-2, 22, 26);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 10;
    controls.maxDistance = 60;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x142844, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xa5f3fc, 2.2);
    dirLight.position.set(20, 35, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // 6. Ground & Road Grid
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050b16,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road Grid Texture
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111c2e,
      roughness: 0.6,
      metalness: 0.3,
    });
    const laneMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    const createRoad = (w: number, d: number, x: number, z: number, hasLanes = true) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0, z);
      road.receiveShadow = true;
      scene.add(road);

      if (hasLanes) {
        // Glowing cyan dashed lane strip
        const laneW = w > d ? w : 0.15;
        const laneD = w > d ? 0.15 : d;
        const lane = new THREE.Mesh(new THREE.PlaneGeometry(laneW, laneD), laneMat);
        lane.rotation.x = -Math.PI / 2;
        lane.position.set(x, 0.01, z);
        scene.add(lane);
      }
    };

    // Major Arterials & Avenues
    createRoad(80, 4.5, 0, 0); // Main E-W Avenue
    createRoad(80, 3.5, 0, -12); // Secondary E-W North
    createRoad(80, 3.5, 0, 12); // Secondary E-W South
    createRoad(4.5, 80, 0, 0); // Main N-S Boulevard
    createRoad(3.5, 80, -14, 0); // Secondary N-S West
    createRoad(3.5, 80, 14, 0); // Secondary N-S East

    // 7. Procedural 3D City Buildings
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d33,
      roughness: 0.4,
      metalness: 0.7,
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const createBuilding = (w: number, h: number, d: number, x: number, z: number) => {
      const bGeo = new THREE.BoxGeometry(w, h, d);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(x, h / 2, z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);

      // Window grid strip
      const winGeo = new THREE.BoxGeometry(w * 0.9, h * 0.8, d * 1.02);
      const winMesh = new THREE.Mesh(
        winGeo,
        new THREE.MeshStandardMaterial({
          color: 0x133e68,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.35,
          roughness: 0.2,
        })
      );
      winMesh.position.set(x, h / 2, z);
      scene.add(winMesh);
    };

    // City blocks with buildings
    const buildingPositions = [
      [-7, 5, -6], [-7, 8, 6], [-20, 10, -6], [-20, 6, 6],
      [7, 7, -6], [7, 6, 6], [20, 9, -6], [20, 5, 6],
      [-7, 4, -18], [7, 8, -18], [-7, 6, 18], [7, 5, 18],
    ];

    buildingPositions.forEach(([x, h, z]) => {
      createBuilding(5.5, h, 5.5, x, z);
    });

    // 8. Hospital Buildings with Glowing "H" Signs
    const hospitalMarkers: { [id: string]: THREE.Group } = {};

    const createHospitalBuilding = (hData: HospitalCandidate) => {
      const hGroup = new THREE.Group();
      hGroup.position.set(hData.position3D[0], 0, hData.position3D[2]);

      // Main hospital building block
      const hHeight = 6.5;
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(7, hHeight, 6),
        new THREE.MeshStandardMaterial({
          color: 0x152c4a,
          metalness: 0.5,
          roughness: 0.3,
        })
      );
      bMesh.position.y = hHeight / 2;
      bMesh.castShadow = true;
      hGroup.add(bMesh);

      // Rooftop Helipad & Structure
      const roofMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e3a5f })
      );
      roofMesh.position.y = hHeight + 0.2;
      hGroup.add(roofMesh);

      // Illuminated Blue "H" Cross Sign
      const hSignGroup = new THREE.Group();
      hSignGroup.position.set(0, hHeight + 1.8, 0);

      // Glow backing
      const signBacking = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.6, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x0369a1 })
      );
      hSignGroup.add(signBacking);

      // Blue glowing 'H' marker
      const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.35), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      hBar1.position.x = -0.4;
      const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.35), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      hBar2.position.x = 0.4;
      const hBar3 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));

      hSignGroup.add(hBar1);
      hSignGroup.add(hBar2);
      hSignGroup.add(hBar3);

      // Point light atop hospital
      const hLight = new THREE.PointLight(0x00f0ff, 2, 8);
      hSignGroup.add(hLight);

      hGroup.add(hSignGroup);
      scene.add(hGroup);

      hospitalMarkers[hData.id] = hGroup;
    };

    hospitals.forEach(createHospitalBuilding);
    hospitalMarkersRef.current = hospitalMarkers;

    // 9. Accident Location Marker (Red Beacon)
    const accidentGroup = new THREE.Group();
    accidentGroup.position.set(-2, 0, 0);

    // Glowing red hazard ring on road
    const ringGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    accidentGroup.add(ring);

    // Red beacon light
    const accidentLight = new THREE.PointLight(0xff0040, 3, 10);
    accidentLight.position.set(0, 1.5, 0);
    accidentGroup.add(accidentLight);

    // Damaged vehicle icon placeholder
    const carMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.7, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.6 })
    );
    carMesh.position.set(0, 0.35, 0);
    carMesh.rotation.y = 0.4;
    accidentGroup.add(carMesh);

    scene.add(accidentGroup);

    // 10. Moving 3D Ambulance Vehicle
    const ambulance = new THREE.Group();
    ambulance.position.set(3, 0.3, 0);

    // Body
    const ambBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.1, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.2 })
    );
    ambBody.position.y = 0.6;
    ambBody.castShadow = true;
    ambulance.add(ambBody);

    // Red Side Decal Strip
    const ambStripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.2, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    ambStripe.position.y = 0.55;
    ambulance.add(ambStripe);

    // Cabin Windshield
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.45, 0.6),
      new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.6 })
    );
    glass.position.set(0, 0.85, 0.8);
    ambulance.add(glass);

    // Emergency Flashing Strobe Lights (Red and Blue)
    const redStrobe = new THREE.PointLight(0xff0000, 3, 8);
    redStrobe.position.set(-0.35, 1.3, 0.2);
    ambulance.add(redStrobe);
    redStrobeLightRef.current = redStrobe;

    const blueStrobe = new THREE.PointLight(0x0088ff, 3, 8);
    blueStrobe.position.set(0.35, 1.3, 0.2);
    ambulance.add(blueStrobe);
    blueStrobeLightRef.current = blueStrobe;

    scene.add(ambulance);
    ambulanceGroupRef.current = ambulance;

    // 11. Glowing Electric-Blue Neon Route Spline
    const updateRouteLine = (targetHosp: HospitalCandidate) => {
      if (routeLineRef.current) {
        scene.remove(routeLineRef.current);
      }

      // Spline curve from accident (-2, 0, 0) to target hospital
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0.15, 0),
        new THREE.Vector3(1, 0.15, 0),
        new THREE.Vector3((targetHosp.position3D[0] + 1) / 2, 0.15, targetHosp.position3D[2] / 2),
        new THREE.Vector3(targetHosp.position3D[0], 0.15, targetHosp.position3D[2]),
      ]);

      const points = curve.getPoints(50);
      const routeGeo = new THREE.BufferGeometry().setFromPoints(points);
      const routeMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        linewidth: 4,
      });

      const routeLine = new THREE.Line(routeGeo, routeMat);
      scene.add(routeLine);
      routeLineRef.current = routeLine;
    };

    updateRouteLine(selectedHospital);

    // 12. Animation Loop
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      const time = clock.getElapsedTime();

      // Flashing strobe beacons
      if (redStrobeLightRef.current && blueStrobeLightRef.current) {
        redStrobeLightRef.current.intensity = Math.sin(time * 12) > 0 ? 4 : 0.2;
        blueStrobeLightRef.current.intensity = Math.cos(time * 12) > 0 ? 4 : 0.2;
      }

      // Accident ring pulse
      ring.scale.setScalar(1 + Math.sin(time * 3) * 0.15);

      // Animate Ambulance moving along the avenue
      if (ambulanceGroupRef.current) {
        const ambX = Math.sin(time * 0.4) * 8;
        ambulanceGroupRef.current.position.x = ambX;
        ambulanceGroupRef.current.position.z = 0.5;
        ambulanceGroupRef.current.rotation.y = Math.cos(time * 0.4) >= 0 ? Math.PI / 2 : -Math.PI / 2;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update route spline when selected hospital changes
  useEffect(() => {
    // smooth camera focus or route update
  }, [selectedHospital]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Accident Location Floating Badge matching reference image */}
      <div className="absolute top-[48%] left-[42%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/90 backdrop-blur-md border border-rose-500/80 text-rose-200 text-xs font-semibold shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-bounce">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span>Accident Location</span>
          <span className="text-[11px] text-rose-300 font-mono opacity-85">| 5.6 min • 2.5 km</span>
        </div>
      </div>
    </div>
  );
};

