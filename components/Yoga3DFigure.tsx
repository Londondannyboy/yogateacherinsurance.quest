'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

// Meditation figure composed of geometric shapes
function MeditatingFigure() {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle breathing motion
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.scale.y = 1 + breathe;
    }
    if (glowRef.current) {
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -0.3, 0]}>
        {/* Aura/Glow behind figure */}
        <mesh ref={glowRef} position={[0, 0.8, -0.5]}>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Head */}
        <Sphere args={[0.25, 32, 32]} position={[0, 1.4, 0]}>
          <MeshDistortMaterial
            color="#60a5fa"
            emissive="#1d4ed8"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.8}
            distort={0.1}
            speed={2}
          />
        </Sphere>

        {/* Neck */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
          <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.2} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.7, 0]}>
          <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
          <MeshDistortMaterial
            color="#3b82f6"
            emissive="#1e40af"
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.7}
            distort={0.05}
            speed={1.5}
          />
        </mesh>

        {/* Left Arm - meditation pose */}
        <group position={[-0.35, 0.6, 0]} rotation={[0, 0, -0.3]}>
          <mesh position={[0, -0.15, 0.1]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.2} />
          </mesh>
          {/* Forearm */}
          <mesh position={[-0.15, -0.35, 0.25]} rotation={[0.8, 0.3, 0.5]}>
            <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.2} />
          </mesh>
        </group>

        {/* Right Arm - meditation pose */}
        <group position={[0.35, 0.6, 0]} rotation={[0, 0, 0.3]}>
          <mesh position={[0, -0.15, 0.1]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.2} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0.15, -0.35, 0.25]} rotation={[0.8, -0.3, -0.5]}>
            <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.2} />
          </mesh>
        </group>

        {/* Crossed Legs - Lotus position */}
        {/* Left leg */}
        <mesh position={[-0.2, 0.15, 0.1]} rotation={[0.2, 0.5, 1.3]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <meshStandardMaterial color="#3b82f6" emissive="#1e40af" emissiveIntensity={0.2} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.2, 0.15, 0.1]} rotation={[0.2, -0.5, -1.3]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <meshStandardMaterial color="#3b82f6" emissive="#1e40af" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

// Energy rings orbiting the figure
function EnergyRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.3;
      ring1Ref.current.rotation.y = t * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.2 + 1;
      ring2Ref.current.rotation.z = t * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.25;
      ring3Ref.current.rotation.z = t * 0.15 + 2;
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      <Ring ref={ring1Ref} args={[1.3, 1.35, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} side={THREE.DoubleSide} />
      </Ring>
      <Ring ref={ring2Ref} args={[1.5, 1.55, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.2} side={THREE.DoubleSide} />
      </Ring>
      <Ring ref={ring3Ref} args={[1.7, 1.75, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
}

// Floating particles
function Particles({ count = 50 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1;
      temp.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * radius,
        ],
        scale: 0.02 + Math.random() * 0.03,
        speed: 0.2 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      const matrix = new THREE.Matrix4();
      const y = particle.position[1] + Math.sin(t * particle.speed + particle.offset) * 0.3;
      matrix.setPosition(
        particle.position[0],
        y,
        particle.position[2]
      );
      matrix.scale(new THREE.Vector3(particle.scale, particle.scale, particle.scale));
      mesh.current!.setMatrixAt(i, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#93c5fd" transparent opacity={0.6} />
    </instancedMesh>
  );
}

export function Yoga3DFigure() {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient light for base illumination */}
        <ambientLight intensity={0.4} />

        {/* Main directional light */}
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />

        {/* Blue accent light from below */}
        <pointLight position={[0, -2, 2]} intensity={0.5} color="#3b82f6" />

        {/* Purple accent light */}
        <pointLight position={[-2, 2, -2]} intensity={0.3} color="#8b5cf6" />

        <MeditatingFigure />
        <EnergyRings />
        <Particles count={40} />
      </Canvas>
    </div>
  );
}
