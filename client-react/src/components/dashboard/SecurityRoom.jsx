import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Room() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#050805" roughness={1} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#060a06" roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-8, 3, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#050905" roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[8, 3, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#050905" roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#030503" roughness={1} />
      </mesh>
    </>
  );
}

function Desk() {
  return (
    <group position={[0, -0.6, 2.5]}>
      {/* Desk surface */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 0.08, 1.8]} />
        <meshStandardMaterial color="#0a120a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Desk front panel */}
      <mesh position={[0, -0.35, 0.86]}>
        <boxGeometry args={[7, 0.62, 0.06]} />
        <meshStandardMaterial color="#080e08" roughness={0.8} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-3.3, -0.6, 0]}>
        <boxGeometry args={[0.1, 1.2, 1.6]} />
        <meshStandardMaterial color="#060c06" roughness={0.8} />
      </mesh>
      {/* Right leg */}
      <mesh position={[3.3, -0.6, 0]}>
        <boxGeometry args={[0.1, 1.2, 1.6]} />
        <meshStandardMaterial color="#060c06" roughness={0.8} />
      </mesh>
      {/* Keyboard tray */}
      <mesh position={[0, 0.05, 0.5]}>
        <boxGeometry args={[2.2, 0.03, 0.7]} />
        <meshStandardMaterial color="#0d160d" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Control panel left */}
      <mesh position={[-2.2, 0.05, 0.2]}>
        <boxGeometry args={[1.8, 0.04, 1.2]} />
        <meshStandardMaterial color="#0c140c" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Control panel right */}
      <mesh position={[2.2, 0.05, 0.2]}>
        <boxGeometry args={[1.8, 0.04, 1.2]} />
        <meshStandardMaterial color="#0c140c" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, -0.9, 4.2]}>
      {/* Seat */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.12, 1.4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.7, -0.64]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.4, 1.4, 0.1]} />
        <meshStandardMaterial color="#090909" roughness={0.9} />
      </mesh>
      {/* Arm left */}
      <mesh position={[-0.75, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.5, 1.2]} />
        <meshStandardMaterial color="#080808" roughness={0.9} />
      </mesh>
      {/* Arm right */}
      <mesh position={[0.75, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.5, 1.2]} />
        <meshStandardMaterial color="#080808" roughness={0.9} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#060606" roughness={0.8} metalness={0.5} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 5]} />
        <meshStandardMaterial color="#060606" roughness={0.8} metalness={0.5} />
      </mesh>
    </group>
  );
}

function ScreenBezel() {
  return (
    <group position={[0, 2.2, -5.8]}>
      {/* Outer bezel */}
      <mesh>
        <boxGeometry args={[9.6, 5.6, 0.12]} />
        <meshStandardMaterial color="#050a05" roughness={0.6} metalness={0.6} />
      </mesh>
      {/* Screen glow plane */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[9.2, 5.2]} />
        <meshStandardMaterial color="#001a00" emissive="#001a00" emissiveIntensity={0.4} />
      </mesh>
      {/* Screen edge light */}
      <pointLight color="#003300" intensity={1.5} distance={6} position={[0, 0, 0.5]} />
    </group>
  );
}

function GlowStrip({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = 0.15 + Math.sin(clock.elapsedTime * 0.8) * 0.05;
    }
  });
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[7, 0.04, 0.04]} />
        <meshStandardMaterial color="#003300" emissive="#00ff41" emissiveIntensity={0.6} />
      </mesh>
      <pointLight ref={ref} color="#00ff41" intensity={0.2} distance={3} decay={2} />
    </group>
  );
}

function AlertFlash({ active }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = active
        ? 0.4 + Math.sin(clock.elapsedTime * 5) * 0.4
        : 0;
    }
  });
  return <pointLight ref={ref} color="#ff0000" intensity={0} position={[0, 5, 0]} distance={15} decay={2} />;
}

export default function SecurityRoom({ hasAlert }) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.8, 6.5], fov: 60 }}
        gl={{ antialias: true }}
        style={{ background: '#000000' }}
      >
        <fog attach="fog" args={['#000000', 8, 22]} />
        <ambientLight intensity={0.04} />
        <directionalLight color="#001a00" intensity={0.3} position={[0, 6, 2]} />

        {/* Ceiling strip lights */}
        <GlowStrip position={[-2, 6.8, -2]} />
        <GlowStrip position={[2, 6.8, -2]} />

        <AlertFlash active={hasAlert} />
        <Room />
        <Desk />
        <Chair />
        <ScreenBezel />
      </Canvas>
    </div>
  );
}
