import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FLOORS_DATA, DEPARTMENTS_DATA } from '../../data/mockData';
import type { DepartmentData } from '../../types';

interface Hospital3DSceneProps {
  currentFloor: string;
  selectedDepartment: DepartmentData | null;
  onSelectDepartment: (dept: DepartmentData) => void;
  viewMode: 'departments' | 'resources' | 'patientFlow';
}

const FLOOR_HEIGHT = 3.7;
const FLOOR_ORDER = ['GF', '1F', '2F', '3F'];

const FLOOR_COLORS: Record<string, string> = {
  GF: '#16b8c9',
  '1F': '#f59e42',
  '2F': '#8b82ed',
  '3F': '#ec83b9',
};

function Material({
  color,
  opacity = 1,
}: {
  color: string;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.65}
      metalness={0.08}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Bed frame */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.45, 0.18, 0.85]} />
        <Material color="#d8e7ef" />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[1.35, 0.12, 0.76]} />
        <Material color="#f5fbff" />
      </mesh>

      {/* Pillow */}
      <mesh position={[-0.48, 0.58, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.48]} />
        <Material color="#b9e6ed" />
      </mesh>

      {/* Headboard */}
      <mesh position={[-0.76, 0.48, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.9]} />
        <Material color="#5e8799" />
      </mesh>

      {/* Legs */}
      {[-0.55, 0.55].map((x) =>
        [-0.28, 0.28].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.16, z]}>
            <boxGeometry args={[0.08, 0.35, 0.08]} />
            <Material color="#819ba8" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Monitor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.55, 0.42, 0.1]} />
        <Material color="#172d43" />
      </mesh>

      <mesh position={[0, 0.65, 0.06]}>
        <boxGeometry args={[0.44, 0.3, 0.02]} />
        <Material color="#29d5c6" />
      </mesh>

      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <Material color="#8fa8b7" />
      </mesh>

      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.42, 0.05, 0.25]} />
        <Material color="#8fa8b7" />
      </mesh>
    </group>
  );
}

function MedicalCabinet({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.7, 1.3, 0.5]} />
        <Material color="#d5e7ed" />
      </mesh>

      {[0.35, 0.7, 1.05].map((y) => (
        <mesh key={y} position={[0, y, 0.26]}>
          <boxGeometry args={[0.55, 0.025, 0.02]} />
          <Material color="#69a9b7" />
        </mesh>
      ))}
    </group>
  );
}

function NurseStation() {
  return (
    <group position={[0, 0, 1.15]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.5, 0.75, 0.75]} />
        <Material color="#d4e7ed" />
      </mesh>

      <mesh position={[0, 0.95, -0.05]}>
        <boxGeometry args={[2.3, 0.08, 0.6]} />
        <Material color="#39b9c5" />
      </mesh>

      <Monitor position={[-0.65, 0.35, -0.15]} />
      <Monitor position={[0.65, 0.35, -0.15]} />
    </group>
  );
}

function OperatingTable() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.8, 0.2, 0.85]} />
        <Material color="#c4e8ed" />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.25, 0.55, 0.25]} />
        <Material color="#829ba8" />
      </mesh>

      <mesh position={[0, 1.65, -0.3]}>
        <boxGeometry args={[0.75, 0.12, 0.75]} />
        <Material color="#d7edf1" />
      </mesh>

      <mesh position={[0, 1.25, -0.3]}>
        <cylinderGeometry args={[0.035, 0.035, 0.75, 12]} />
        <Material color="#8ca9b5" />
      </mesh>
    </group>
  );
}

function Room({
  department,
  label,
  position,
  selected,
  color,
  viewMode,
  onSelect,
}: {
  department?: DepartmentData;
  label: string;
  position: [number, number, number];
  selected: boolean;
  color: string;
  viewMode: 'departments' | 'resources' | 'patientFlow';
  onSelect: () => void;
}) {
  const load = department
    ? department.bedsOccupied / Math.max(department.totalBeds, 1)
    : 0.55;

  const roomColor =
    viewMode === 'resources'
      ? load > 0.85
        ? '#ed6b64'
        : load > 0.65
        ? '#eab75c'
        : '#49bfa4'
      : selected
      ? '#45c8d4'
      : '#dcecf1';

  const isSurgical = label.toLowerCase().includes('surgical') ||
    label.toLowerCase().includes('icu');

  const isEmergency = label.toLowerCase().includes('emergency') ||
    label.toLowerCase().includes('trauma');

  return (
    <group position={position}>
      {/* Room floor */}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <planeGeometry args={[4.55, 5.5]} />
        <meshStandardMaterial
          color={roomColor}
          roughness={0.85}
          transparent
          opacity={selected ? 0.95 : 0.72}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.45, -2.72]}>
        <boxGeometry args={[4.55, 2.85, 0.12]} />
        <Material color="#a9c5d0" />
      </mesh>

      {/* Left partition */}
      <mesh position={[-2.25, 1.3, -0.2]}>
        <boxGeometry args={[0.1, 2.6, 5]} />
        <Material color="#d3e3e9" opacity={0.85} />
      </mesh>

      {/* Right partition */}
      <mesh position={[2.25, 1.3, -0.2]}>
        <boxGeometry args={[0.1, 2.6, 5]} />
        <Material color="#d3e3e9" opacity={0.85} />
      </mesh>

      {/* Back window */}
      <mesh position={[0, 1.75, -2.64]}>
        <boxGeometry args={[2.1, 1.1, 0.035]} />
        <Material color="#55b7d3" opacity={0.7} />
      </mesh>

      {/* Beds */}
      {!isSurgical && (
        <>
          <Bed position={[-1.05, 0, -1.1]} />
          <Bed position={[0.9, 0, -1.1]} />
        </>
      )}

      {isSurgical && <OperatingTable />}

      {/* Equipment */}
      <Monitor position={[-1.55, 0, 0.8]} />
      <MedicalCabinet position={[1.6, 0, -1.7]} />

      {/* Nurse desk */}
      {isEmergency && <NurseStation />}

      {/* Department label */}
      <Html
        position={[0, 2.85, -0.5]}
        center
        distanceFactor={13}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: selected ? '#0cbbc9' : '#102b40',
            color: 'white',
            padding: '6px 11px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: `1px solid ${color}`,
            boxShadow: '0 3px 12px #001b2b55',
          }}
        >
          {label}
        </div>
      </Html>

      {/* Department status */}
      <Html
        position={[0, 2.45, -0.5]}
        center
        distanceFactor={14}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: '#e5faff',
            background: '#102b40dd',
            padding: '3px 7px',
            borderRadius: '4px',
            fontSize: '9px',
            whiteSpace: 'nowrap',
          }}
        >
          {department
            ? `${department.bedsOccupied}/${department.totalBeds} beds`
            : 'Department zone'}
        </div>
      </Html>
    </group>
  );
}

function Floor({
  floor,
  floorIndex,
  currentFloor,
  selectedDepartment,
  viewMode,
  onSelectDepartment,
}: {
  floor: (typeof FLOORS_DATA)[number];
  floorIndex: number;
  currentFloor: string;
  selectedDepartment: DepartmentData | null;
  viewMode: 'departments' | 'resources' | 'patientFlow';
  onSelectDepartment: (dept: DepartmentData) => void;
}) {
  const y = floorIndex * FLOOR_HEIGHT;
  const isActive = currentFloor === floor.id;
  const color = FLOOR_COLORS[floor.id] || '#45c8d4';

  return (
    <group position={[0, y, 0]}>
      {/* Floor slab */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[15, 0.22, 8.3]} />
        <meshStandardMaterial
          color={isActive ? color : '#b6cbd4'}
          roughness={0.7}
          transparent
          opacity={isActive ? 0.8 : 0.48}
        />
      </mesh>

      {/* Corridor */}
      <mesh
        position={[0, 0.13, 2.95]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[14.5, 1.8]} />
        <Material color="#edf5f7" />
      </mesh>

      {/* Three department rooms */}
      {floor.departments.map((deptId, index) => {
        const department = DEPARTMENTS_DATA[deptId];

        const fallbackNames: Record<string, string> = {
          ward_cardio: 'Cardiology Ward',
          ward_neuro: 'Neurology Ward',
          ward_ortho: 'Orthopaedic Ward',
          post_op: 'Post-Operative Care',
          blood_bank: 'Blood Bank',
        };

        const label =
          department?.shortName ||
          department?.name ||
          fallbackNames[deptId] ||
          deptId.replaceAll('_', ' ').toUpperCase();

        const x = (index - 1) * 5;

        return (
          <Room
            key={deptId}
            department={department}
            label={label}
            position={[x, 0.15, -0.1]}
            selected={selectedDepartment?.id === deptId}
            color={color}
            viewMode={viewMode}
            onSelect={() => {
              if (department) onSelectDepartment(department);
            }}
          />
        );
      })}

      {/* Floor name */}
      <Html
        position={[-8.1, 1.6, 2.9]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: 'white',
            background: color,
            borderRadius: '7px',
            padding: '7px 12px',
            fontSize: '12px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {floor.id}
        </div>
      </Html>

      {/* Front balcony rail */}
      <mesh position={[0, 0.65, 4.05]}>
        <boxGeometry args={[15, 0.08, 0.08]} />
        <Material color="#73d3df" opacity={0.8} />
      </mesh>

      {/* Support columns */}
      {[-7.1, 7.1].map((x) => (
        <mesh key={x} position={[x, 1.5, 3.95]}>
          <boxGeometry args={[0.15, 3, 0.15]} />
          <Material color="#8cb9c6" />
        </mesh>
      ))}
    </group>
  );
}

function HospitalBuilding({
  currentFloor,
  selectedDepartment,
  viewMode,
  onSelectDepartment,
}: Hospital3DSceneProps) {
  return (
    <group>
      {/* All four floors */}
      {FLOOR_ORDER.map((floorId, index) => {
        const floor = FLOORS_DATA.find((f) => f.id === floorId);
        if (!floor) return null;

        return (
          <Floor
            key={floorId}
            floor={floor}
            floorIndex={index}
            currentFloor={currentFloor}
            selectedDepartment={selectedDepartment}
            viewMode={viewMode}
            onSelectDepartment={onSelectDepartment}
          />
        );
      })}

      {/* Roof */}
      <mesh position={[0, FLOOR_HEIGHT * 4, 0]}>
        <boxGeometry args={[15.5, 0.25, 8.7]} />
        <Material color="#d7e7ed" />
      </mesh>

      {/* Exterior side walls */}
      {[-7.55, 7.55].map((x) => (
        <mesh key={x} position={[x, 7, 0]}>
          <boxGeometry args={[0.16, 14.1, 8.4]} />
          <Material color="#9dc5d2" opacity={0.38} />
        </mesh>
      ))}

      {/* Back exterior wall */}
      <mesh position={[0, 7, -4.15]}>
        <boxGeometry args={[15.2, 14.1, 0.14]} />
        <Material color="#a7d4df" opacity={0.3} />
      </mesh>

      {/* Front glass entrance */}
      <mesh position={[0, 0.9, 4.25]}>
        <boxGeometry args={[5.2, 1.8, 0.08]} />
        <Material color="#42c3d7" opacity={0.4} />
      </mesh>

      {/* Entrance doors */}
      <mesh position={[-0.75, 0.9, 4.32]}>
        <boxGeometry args={[1.2, 1.75, 0.04]} />
        <Material color="#b7e8ef" opacity={0.65} />
      </mesh>

      <mesh position={[0.75, 0.9, 4.32]}>
        <boxGeometry args={[1.2, 1.75, 0.04]} />
        <Material color="#b7e8ef" opacity={0.65} />
      </mesh>

      {/* Entrance sign */}
      <Html position={[0, 2.2, 4.5]} center distanceFactor={11}>
        <div
          style={{
            background: '#092b40',
            color: '#60e4e8',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #4bd5e0',
            fontSize: '13px',
            fontWeight: 900,
            whiteSpace: 'nowrap',
            letterSpacing: '2px',
          }}
        >
          RESQ TWIN HOSPITAL
        </div>
      </Html>
    </group>
  );
}

export const Hospital3DScene: React.FC<Hospital3DSceneProps> = (props) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '520px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background:
          'radial-gradient(circle at 50% 40%, #183b52 0%, #081725 75%)',
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [19, 15, 23],
          fov: 38,
          near: 0.1,
          far: 150,
        }}
      >
        <color attach="background" args={['#091927']} />

        <ambientLight intensity={1.1} />

        <directionalLight
          position={[10, 20, 10]}
          intensity={2}
          castShadow
        />

        <pointLight position={[-10, 8, 8]} intensity={1.3} color="#31c7dc" />
        <pointLight position={[10, 12, -8]} intensity={1.2} color="#8b8df5" />

        <HospitalBuilding {...props} />

        <gridHelper
          args={[40, 40, '#285064', '#173448']}
          position={[0, -0.2, 0]}
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={13}
          maxDistance={48}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 6, 0]}
        />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          color: '#d5f5fa',
          background: '#102d42dd',
          border: '1px solid #3a8296',
          padding: '9px 13px',
          borderRadius: '9px',
          fontSize: '11px',
          pointerEvents: 'none',
        }}
      >
        DRAG TO ROTATE · SCROLL TO ZOOM
      </div>
    </div>
  );
};

export default Hospital3DScene;