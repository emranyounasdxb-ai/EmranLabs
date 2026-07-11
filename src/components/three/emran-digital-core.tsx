"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { ComponentProps } from "react";
import { memo, useMemo, useRef } from "react";
import type { Group, Points } from "three";
import { AdditiveBlending, Color } from "three";

import { useDocumentVisibility } from "@/hooks/use-document-visibility";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function CoreNetwork({ active }: { active: boolean }) {
  const groupRef = useRef<Group>(null);
  const pointsRef = useRef<Points>(null);

  const { positions, colors } = useMemo(() => {
    const positionValues: number[] = [];
    const colorValues: number[] = [];
    const signal = new Color("#17e3c0");
    const violet = new Color("#7b5cff");

    for (let index = 0; index < 96; index += 1) {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / 96);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      const radius = 1.16 + (index % 7) * 0.018;
      positionValues.push(
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      );

      const color = signal.clone().lerp(violet, (index % 12) / 11);
      colorValues.push(color.r, color.g, color.b);
    }

    return {
      positions: new Float32Array(positionValues),
      colors: new Float32Array(colorValues),
    };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!active || !groupRef.current || !pointsRef.current) return;

    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.rotation.x = Math.sin(elapsed * 0.18) * 0.08;
    pointsRef.current.rotation.z -= delta * 0.035;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.56, 32, 32]} />
        <meshStandardMaterial
          color="#102822"
          emissive="#17e3c0"
          emissiveIntensity={0.16}
          roughness={0.58}
          metalness={0.22}
          transparent
          opacity={0.46}
        />
      </mesh>
      <mesh rotation={[0.35, 0.2, 0]}>
        <torusGeometry args={[0.92, 0.004, 8, 128]} />
        <meshBasicMaterial color="#17e3c0" transparent opacity={0.34} />
      </mesh>
      <mesh rotation={[1.1, 0.45, 0.7]}>
        <torusGeometry args={[1.2, 0.003, 8, 128]} />
        <meshBasicMaterial color="#7b5cff" transparent opacity={0.24} />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.026}
          vertexColors
          transparent
          opacity={0.82}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 2, 2]} color="#17e3c0" intensity={2.1} />
      <pointLight position={[-2, -1, 1.5]} color="#7b5cff" intensity={1.2} />
    </group>
  );
}

function DigitalCoreCanvas(props: ComponentProps<"div">) {
  const reducedMotion = useReducedMotion();
  const visible = useDocumentVisibility();
  const active = visible && !reducedMotion;

  return (
    <div {...props}>
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        dpr={[1, 1.45]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "demand"}
        fallback={
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(23,227,192,0.2),transparent_68%)]" />
        }
      >
        <CoreNetwork active={active} />
      </Canvas>
    </div>
  );
}

export const EmranDigitalCore = memo(DigitalCoreCanvas);
