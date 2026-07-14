"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { ComponentProps } from "react";
import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  MathUtils,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
} from "three";

import { useDocumentVisibility } from "@/hooks/use-document-visibility";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type OrbitConfig = {
  radius: number;
  verticalScale: number;
  depth: number;
  speed: number;
  phase: number;
  inclination: number;
  tilt: number;
  scale: number;
  variant: "communications" | "relay" | "weather";
};

const ORBITS: OrbitConfig[] = [
  {
    radius: 1.42,
    verticalScale: 0.68,
    depth: 0.28,
    speed: 0.11,
    phase: 2.5,
    inclination: 0.5,
    tilt: 0.12,
    scale: 0.74,
    variant: "communications",
  },
  {
    radius: 1.72,
    verticalScale: 0.74,
    depth: 0.34,
    speed: -0.078,
    phase: 5.2,
    inclination: -0.45,
    tilt: 0.7,
    scale: 0.58,
    variant: "relay",
  },
  {
    radius: 1.95,
    verticalScale: 0.64,
    depth: 0.38,
    speed: 0.056,
    phase: 0.72,
    inclination: 0.18,
    tilt: -0.5,
    scale: 0.42,
    variant: "weather",
  },
];

const EARTH_TEXTURES = [
  "/textures/earth/earth-atmosphere.jpg",
  "/textures/earth/earth-normal.jpg",
  "/textures/earth/earth-lights.png",
  "/textures/earth/earth-clouds.png",
];

function SolarArray({ side }: { side: -1 | 1 }) {
  const verticalDividers = [-0.18, -0.09, 0, 0.09, 0.18];
  const horizontalDividers = [-0.068, 0, 0.068];

  return (
    <group position={[side * 0.48, 0, 0]}>
      <mesh position={[side * -0.26, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.018, 0.022]} />
        <meshStandardMaterial
          color="#4d5660"
          metalness={0.92}
          roughness={0.25}
        />
      </mesh>

      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.018, 0.25]} />
        <meshPhysicalMaterial
          color="#07111d"
          metalness={0.64}
          roughness={0.24}
          clearcoat={0.38}
          clearcoatRoughness={0.25}
        />
      </mesh>

      <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.215]} />
        <meshStandardMaterial
          color="#0d2747"
          emissive="#06182b"
          emissiveIntensity={0.18}
          metalness={0.52}
          roughness={0.3}
          side={DoubleSide}
        />
      </mesh>

      {verticalDividers.map((offset) => (
        <mesh key={offset} position={[offset, 0.017, 0]}>
          <boxGeometry args={[0.006, 0.006, 0.225]} />
          <meshStandardMaterial
            color="#9eabb7"
            metalness={0.9}
            roughness={0.22}
          />
        </mesh>
      ))}

      {horizontalDividers.map((offset) => (
        <mesh key={offset} position={[0, 0.017, offset]}>
          <boxGeometry args={[0.51, 0.006, 0.006]} />
          <meshStandardMaterial
            color="#8a98a6"
            metalness={0.9}
            roughness={0.24}
          />
        </mesh>
      ))}
    </group>
  );
}

function CommunicationsDish() {
  return (
    <group position={[0.24, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh castShadow>
        <sphereGeometry
          args={[0.16, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.05]}
        />
        <meshPhysicalMaterial
          color="#b7c0c9"
          metalness={0.86}
          roughness={0.24}
          clearcoat={0.28}
          clearcoatRoughness={0.3}
          side={BackSide}
        />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 12]} />
        <meshStandardMaterial
          color="#606a74"
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.215, 0]}>
        <sphereGeometry args={[0.026, 16, 12]} />
        <meshStandardMaterial
          color="#d8dee4"
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
}

function SatelliteModel({ variant }: { variant: OrbitConfig["variant"] }) {
  const bodyColor =
    variant === "weather"
      ? "#6f7781"
      : variant === "relay"
        ? "#2d333a"
        : "#8c7445";

  return (
    <group rotation={[0.12, -0.3, 0.08]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.105, 0.125, 0.34, 32]} />
        <meshPhysicalMaterial
          color={bodyColor}
          metalness={0.84}
          roughness={0.34}
          clearcoat={0.22}
          clearcoatRoughness={0.42}
        />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.132, 0.132, 0.08, 32]} />
        <meshStandardMaterial
          color="#161a1f"
          metalness={0.94}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[-0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.083, 0.096, 0.12, 24]} />
        <meshStandardMaterial
          color="#a7afb8"
          metalness={0.9}
          roughness={0.26}
        />
      </mesh>

      <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.105, 0.12, 24]} />
        <meshStandardMaterial
          color="#252b31"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      <mesh position={[0, 0.105, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.092, 0.014, 12, 32]} />
        <meshStandardMaterial
          color="#b29354"
          metalness={0.74}
          roughness={0.42}
        />
      </mesh>

      <SolarArray side={-1} />
      <SolarArray side={1} />

      {variant !== "weather" && <CommunicationsDish />}

      {variant === "weather" && (
        <group position={[0.22, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.095, 0.18, 24]} />
            <meshPhysicalMaterial
              color="#d2d7dc"
              metalness={0.9}
              roughness={0.2}
              clearcoat={0.32}
            />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <sphereGeometry args={[0.055, 20, 14]} />
            <meshStandardMaterial
              color="#10151b"
              metalness={0.72}
              roughness={0.18}
            />
          </mesh>
        </group>
      )}

      <mesh position={[-0.24, 0.055, 0]}>
        <sphereGeometry args={[0.018, 12, 8]} />
        <meshBasicMaterial color="#d44343" toneMapped={false} />
      </mesh>
      <mesh position={[-0.24, -0.055, 0]}>
        <sphereGeometry args={[0.014, 12, 8]} />
        <meshBasicMaterial color="#54d5ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function OrbitingSatellite({
  active,
  config,
}: {
  active: boolean;
  config: OrbitConfig;
}) {
  const satelliteRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!satelliteRef.current) return;

    const elapsed = active ? clock.getElapsedTime() : 0;
    const angle = config.phase + elapsed * config.speed;
    const x = Math.cos(angle) * config.radius;
    const y = Math.sin(angle) * config.radius * config.verticalScale;
    const z = Math.sin(angle + 0.85) * config.depth;

    satelliteRef.current.position.set(x, y, z);
    satelliteRef.current.rotation.z = angle + Math.PI / 2;
    satelliteRef.current.rotation.y = Math.sin(angle * 1.35) * 0.18;
  });

  return (
    <group rotation={[config.inclination, config.tilt, 0]}>
      <mesh scale={[1, config.verticalScale, 1]}>
        <torusGeometry args={[config.radius, 0.0028, 8, 224]} />
        <meshBasicMaterial
          color="#7ca8ce"
          transparent
          opacity={0.14}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={satelliteRef} scale={config.scale}>
        <SatelliteModel variant={config.variant} />
      </group>
    </group>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.075}>
      <sphereGeometry args={[0.92, 72, 72]} />
      <shaderMaterial
        transparent
        side={BackSide}
        blending={AdditiveBlending}
        depthWrite={false}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vWorldPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          varying vec3 vWorldPosition;

          void main() {
            vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
            float fresnel = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 3.2);
            vec3 color = mix(vec3(0.06, 0.36, 0.62), vec3(0.42, 0.86, 1.0), fresnel);
            gl_FragColor = vec4(color, fresnel * 0.72);
          }
        `}
      />
    </mesh>
  );
}

function LoadingEarth() {
  return (
    <group rotation={[0.08, -0.85, -0.08]}>
      <mesh>
        <sphereGeometry args={[0.92, 48, 48]} />
        <meshStandardMaterial
          color="#07111d"
          metalness={0.12}
          roughness={0.72}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
}

function GlobeWorld({ active }: { active: boolean }) {
  const sceneRef = useRef<Group>(null);
  const earthRef = useRef<Group>(null);
  const cloudsRef = useRef<Mesh>(null);
  const starsRef = useRef<Points>(null);
  const gl = useThree((state) => state.gl);

  const [surfaceTexture, normalTexture, lightsTexture, cloudsTexture] =
    useLoader(TextureLoader, EARTH_TEXTURES);

  const normalScale = useMemo(() => new Vector2(0.56, 0.56), []);

  useEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

    surfaceTexture.colorSpace = SRGBColorSpace;
    lightsTexture.colorSpace = SRGBColorSpace;
    cloudsTexture.colorSpace = SRGBColorSpace;

    for (const texture of [
      surfaceTexture,
      normalTexture,
      lightsTexture,
      cloudsTexture,
    ]) {
      texture.wrapS = RepeatWrapping;
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    }
  }, [cloudsTexture, gl, lightsTexture, normalTexture, surfaceTexture]);

  const { starPositions, starColors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const blueWhite = new Color("#d9efff");
    const coolBlue = new Color("#6ba9d9");

    for (let index = 0; index < 420; index += 1) {
      const phi = Math.acos(1 - 2 * ((index + 0.5) / 420));
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      const radius = 2.15 + (index % 17) * 0.042;

      positions.push(
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      );

      const color = blueWhite.clone().lerp(coolBlue, (index % 19) / 18);
      colors.push(color.r, color.g, color.b);
    }

    return {
      starPositions: new Float32Array(positions),
      starColors: new Float32Array(colors),
    };
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!sceneRef.current || !earthRef.current || !starsRef.current) return;

    const elapsed = active ? clock.getElapsedTime() : 0;

    if (active) {
      earthRef.current.rotation.y += delta * 0.022;
      if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.012;
      starsRef.current.rotation.y -= delta * 0.006;
    }

    sceneRef.current.rotation.x = MathUtils.lerp(
      sceneRef.current.rotation.x,
      pointer.y * 0.055 + Math.sin(elapsed * 0.18) * 0.012,
      0.026,
    );
    sceneRef.current.rotation.y = MathUtils.lerp(
      sceneRef.current.rotation.y,
      pointer.x * 0.07,
      0.026,
    );
  });

  return (
    <group ref={sceneRef} position={[0.08, -0.02, 0]}>
      <group ref={earthRef} rotation={[0.08, -1.18, -0.1]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.92, 96, 96]} />
          <meshPhysicalMaterial
            map={surfaceTexture}
            normalMap={normalTexture}
            normalScale={normalScale}
            metalness={0.02}
            roughness={0.76}
            clearcoat={0.16}
            clearcoatRoughness={0.72}
          />
        </mesh>

        <mesh scale={1.002}>
          <sphereGeometry args={[0.92, 96, 96]} />
          <meshBasicMaterial
            map={lightsTexture}
            transparent
            opacity={0.78}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <mesh ref={cloudsRef} scale={1.009}>
          <sphereGeometry args={[0.92, 80, 80]} />
          <meshPhysicalMaterial
            map={cloudsTexture}
            transparent
            opacity={0.38}
            alphaTest={0.025}
            depthWrite={false}
            roughness={0.96}
            metalness={0}
          />
        </mesh>

        <mesh scale={1.013}>
          <sphereGeometry args={[0.92, 44, 44]} />
          <meshBasicMaterial
            color="#68b7d3"
            wireframe
            transparent
            opacity={0.025}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <Atmosphere />
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
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.013}
          vertexColors
          transparent
          opacity={0.7}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <ambientLight intensity={0.1} />
      <hemisphereLight args={["#8bbfe0", "#020409", 0.32]} />
      <directionalLight
        position={[3.6, 2.8, 4.2]}
        color="#f4fbff"
        intensity={2.65}
        castShadow
      />
      <directionalLight
        position={[-2.8, -1.2, 1.6]}
        color="#245f87"
        intensity={0.46}
      />
      <pointLight
        position={[2.4, 1.2, -1.5]}
        color="#55b7ff"
        intensity={1.25}
        distance={6}
      />
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
        camera={{ position: [0, 0, 4.75], fov: 34, near: 0.1, far: 100 }}
        dpr={[1, 1.65]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          premultipliedAlpha: true,
        }}
        onCreated={({ gl: renderer }) => {
          renderer.toneMapping = ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.08;
          renderer.outputColorSpace = SRGBColorSpace;
        }}
        frameloop={active ? "always" : "demand"}
        shadows
        fallback={
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(69,148,199,0.22),transparent_68%)]" />
        }
      >
        <Suspense fallback={<LoadingEarth />}>
          <GlobeWorld active={active} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export const EmranDigitalCore = memo(DigitalCoreCanvas);
