"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { ComponentProps } from "react";
import { memo, useEffect, useMemo, useRef } from "react";
import type { Group, Points } from "three";
import {
  AdditiveBlending,
  BackSide,
  Color,
  MathUtils,
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

import {
  WORLD_MAP_CITIES,
  WORLD_MAP_CONNECTIONS,
  WORLD_MAP_PATH,
} from "@/data/world-map-path";
import { useDocumentVisibility } from "@/hooks/use-document-visibility";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type OrbitConfig = {
  radius: number;
  speed: number;
  phase: number;
  inclination: number;
  tilt: number;
  scale: number;
  accent: string;
};

const ORBITS: OrbitConfig[] = [
  {
    radius: 1.18,
    speed: 0.24,
    phase: 0.25,
    inclination: 0.48,
    tilt: 0.1,
    scale: 0.86,
    accent: "#56f4dc",
  },
  {
    radius: 1.42,
    speed: -0.18,
    phase: 2.3,
    inclination: -0.62,
    tilt: 0.72,
    scale: 0.72,
    accent: "#8a72ff",
  },
  {
    radius: 1.66,
    speed: 0.12,
    phase: 4.35,
    inclination: 0.2,
    tilt: -0.54,
    scale: 0.64,
    accent: "#4ea8ff",
  },
];

function SatelliteModel({ accent }: { accent: string }) {
  const panelBars = [-0.12, -0.04, 0.04, 0.12];

  return (
    <group rotation={[0.15, -0.35, 0.08]}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.2, 0.18]} />
        <meshStandardMaterial
          color="#a8b7c7"
          metalness={0.82}
          roughness={0.28}
          emissive={accent}
          emissiveIntensity={0.08}
        />
      </mesh>

      <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.16, 20]} />
        <meshStandardMaterial color="#d5dee7" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.19, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.105, 0.085, 24, 1, true]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.72}
          roughness={0.3}
          side={BackSide}
        />
      </mesh>

      <mesh position={[0, 0.24, 0.03]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 10]} />
        <meshStandardMaterial color="#e5edf5" metalness={0.9} roughness={0.18} />
      </mesh>

      {[-0.39, 0.39].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.44, 0.018, 0.23]} />
            <meshStandardMaterial
              color="#102e58"
              emissive="#1b65b3"
              emissiveIntensity={0.2}
              metalness={0.62}
              roughness={0.34}
            />
          </mesh>
          {panelBars.map((offset) => (
            <mesh key={offset} position={[offset, 0.012, 0]}>
              <boxGeometry args={[0.008, 0.006, 0.22]} />
              <meshBasicMaterial color="#4ea8ff" transparent opacity={0.46} />
            </mesh>
          ))}
          {[-0.07, 0.07].map((z) => (
            <mesh key={z} position={[0, 0.012, z]}>
              <boxGeometry args={[0.42, 0.006, 0.006]} />
              <meshBasicMaterial color="#4ea8ff" transparent opacity={0.42} />
            </mesh>
          ))}
        </group>
      ))}

      <pointLight position={[0, 0, 0.32]} color={accent} intensity={0.7} distance={1.1} />
    </group>
  );
}

function OrbitingSatellite({ active, config }: { active: boolean; config: OrbitConfig }) {
  const satelliteRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!active || !satelliteRef.current) return;

    const angle = config.phase + clock.getElapsedTime() * config.speed;
    satelliteRef.current.position.set(
      Math.cos(angle) * config.radius,
      Math.sin(angle) * config.radius,
      0,
    );
    satelliteRef.current.rotation.z = angle + Math.PI / 2;
    satelliteRef.current.rotation.y = Math.sin(angle * 1.7) * 0.22;
  });

  return (
    <group rotation={[config.inclination, config.tilt, 0]}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[config.radius, 0.004, 8, 192]} />
        <meshBasicMaterial
          color={config.accent}
          transparent
          opacity={0.22}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <group ref={satelliteRef} scale={config.scale}>
        <SatelliteModel accent={config.accent} />
      </group>
    </group>
  );
}

function GlobeWorld({ active }: { active: boolean }) {
  const worldRef = useRef<Group>(null);
  const starsRef = useRef<Points>(null);
  const texture = useMemo(() => {
    const width = 2048;
    const height = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return new CanvasTexture(canvas);

    const ocean = context.createLinearGradient(0, 0, 0, height);
    ocean.addColorStop(0, "#020912");
    ocean.addColorStop(0.48, "#061624");
    ocean.addColorStop(1, "#02070e");
    context.fillStyle = ocean;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(73, 202, 218, 0.11)";
    context.lineWidth = 1;
    for (let longitude = 0; longitude <= width; longitude += width / 24) {
      context.beginPath();
      context.moveTo(longitude, 0);
      context.lineTo(longitude, height);
      context.stroke();
    }
    for (let latitude = 0; latitude <= height; latitude += height / 12) {
      context.beginPath();
      context.moveTo(0, latitude);
      context.lineTo(width, latitude);
      context.stroke();
    }

    const map = new Path2D(WORLD_MAP_PATH);
    context.fillStyle = "#0b3f4d";
    context.fill(map, "evenodd");
    context.strokeStyle = "rgba(81, 244, 222, 0.94)";
    context.lineWidth = 2.1;
    context.stroke(map);
    context.strokeStyle = "rgba(81, 244, 222, 0.16)";
    context.lineWidth = 7;
    context.stroke(map);

    const toCanvasPoint = (longitude: number, latitude: number) => ({
      x: ((longitude + 180) / 360) * width,
      y: ((90 - latitude) / 180) * height,
    });

    context.lineWidth = 1.2;
    for (const [fromIndex, toIndex] of WORLD_MAP_CONNECTIONS) {
      const from = WORLD_MAP_CITIES[fromIndex];
      const to = WORLD_MAP_CITIES[toIndex];
      if (!from || !to) continue;
      const start = toCanvasPoint(from[1], from[2]);
      const end = toCanvasPoint(to[1], to[2]);
      context.strokeStyle = "rgba(78, 168, 255, 0.2)";
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.quadraticCurveTo(
        (start.x + end.x) / 2,
        Math.min(start.y, end.y) - 36,
        end.x,
        end.y,
      );
      context.stroke();
    }

    for (const [, longitude, latitude] of WORLD_MAP_CITIES) {
      const point = toCanvasPoint(longitude, latitude);
      const glow = context.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        13,
      );
      glow.addColorStop(0, "rgba(255, 246, 213, 1)");
      glow.addColorStop(0.22, "rgba(255, 183, 86, 0.86)");
      glow.addColorStop(1, "rgba(255, 183, 86, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(point.x, point.y, 13, 0, Math.PI * 2);
      context.fill();
    }

    const nextTexture = new CanvasTexture(canvas);
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.wrapS = RepeatWrapping;
    nextTexture.anisotropy = 4;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  const { starPositions, starColors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const cyan = new Color("#58f5df");
    const violet = new Color("#8d76ff");

    for (let index = 0; index < 320; index += 1) {
      const phi = Math.acos(1 - 2 * ((index + 0.5) / 320));
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      const radius = 1.95 + (index % 11) * 0.035;

      positions.push(
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      );

      const color = cyan.clone().lerp(violet, (index % 17) / 16);
      colors.push(color.r, color.g, color.b);
    }

    return {
      starPositions: new Float32Array(positions),
      starColors: new Float32Array(colors),
    };
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!active || !worldRef.current || !starsRef.current) return;

    const elapsed = clock.getElapsedTime();
    worldRef.current.rotation.y += delta * 0.055;
    worldRef.current.rotation.x = MathUtils.lerp(
      worldRef.current.rotation.x,
      pointer.y * 0.08 + Math.sin(elapsed * 0.22) * 0.025,
      0.035,
    );
    worldRef.current.rotation.z = MathUtils.lerp(
      worldRef.current.rotation.z,
      -pointer.x * 0.055,
      0.035,
    );
    starsRef.current.rotation.y -= delta * 0.012;
    starsRef.current.rotation.x = Math.sin(elapsed * 0.08) * 0.045;
  });

  return (
    <group>
      <group ref={worldRef} rotation={[0.06, -0.42, -0.08]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.82, 72, 72]} />
          <meshStandardMaterial
            map={texture}
            emissive="#0d8f91"
            emissiveMap={texture}
            emissiveIntensity={0.42}
            metalness={0.18}
            roughness={0.62}
          />
        </mesh>

        <mesh scale={1.012}>
          <sphereGeometry args={[0.82, 36, 36]} />
          <meshBasicMaterial
            color="#72ffe8"
            wireframe
            transparent
            opacity={0.055}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh scale={1.055}>
          <sphereGeometry args={[0.82, 56, 56]} />
          <meshBasicMaterial
            color="#42e7ff"
            transparent
            opacity={0.11}
            side={BackSide}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh scale={0.74}>
          <sphereGeometry args={[0.82, 32, 32]} />
          <meshBasicMaterial
            color="#18d8c0"
            transparent
            opacity={0.08}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {ORBITS.map((config) => (
        <OrbitingSatellite
          key={`${config.radius}-${config.phase}`}
          active={active}
          config={config}
        />
      ))}

      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.72}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#8feeff", "#040812", 0.82]} />
      <directionalLight position={[2.6, 2.1, 3.4]} color="#d7fbff" intensity={1.45} />
      <pointLight position={[2.2, 0.7, 2]} color="#42f2da" intensity={2.6} distance={5} />
      <pointLight position={[-2.4, -1.1, 1.2]} color="#7d65ff" intensity={1.8} distance={5} />
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
        camera={{ position: [0, 0, 4.4], fov: 37 }}
        dpr={[1, 1.55]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "demand"}
        shadows
        fallback={
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(23,227,192,0.2),transparent_68%)]" />
        }
      >
        <GlobeWorld active={active} />
      </Canvas>
    </div>
  );
}

export const EmranDigitalCore = memo(DigitalCoreCanvas);
