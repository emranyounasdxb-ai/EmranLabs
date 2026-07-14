"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { ComponentProps } from "react";
import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  CanvasTexture,
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
};

const EARTH_TEXTURES = [
  "/textures/earth/earth-atmosphere.jpg",
  "/textures/earth/earth-normal.jpg",
  "/textures/earth/earth-lights.png",
  "/textures/earth/earth-clouds.png",
];

const ORBITS: OrbitConfig[] = [
  {
    radius: 1.42,
    verticalScale: 0.58,
    depth: 0.3,
    speed: 0.065,
    phase: 0.35,
    inclination: 0.48,
    tilt: 0.18,
    scale: 0.43,
  },
  {
    radius: 1.68,
    verticalScale: 0.63,
    depth: 0.36,
    speed: -0.048,
    phase: 3.45,
    inclination: -0.38,
    tilt: 0.72,
    scale: 0.34,
  },
];

function seededValue(index: number, seed: number) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createGlowTexture(inner: string, middle: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.32, middle);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function CameraRig({ active }: { active: boolean }) {
  const { camera, pointer } = useThree();

  useFrame(({ clock }, delta) => {
    const elapsed = active ? clock.getElapsedTime() : 0;
    const damping = 1 - Math.pow(0.001, delta);
    const targetX = pointer.x * 0.22 + Math.sin(elapsed * 0.13) * 0.055;
    const targetY = pointer.y * 0.14 + Math.cos(elapsed * 0.11) * 0.04;
    const targetZ = 6.25 + Math.sin(elapsed * 0.09) * 0.07;

    camera.position.x = MathUtils.lerp(camera.position.x, targetX, damping * 0.09);
    camera.position.y = MathUtils.lerp(camera.position.y, targetY, damping * 0.09);
    camera.position.z = MathUtils.lerp(camera.position.z, targetZ, damping * 0.07);
    camera.lookAt(0.32 + pointer.x * 0.045, pointer.y * 0.025, 0);
  });

  return null;
}

function NebulaField({ active }: { active: boolean }) {
  const groupRef = useRef<Group>(null);
  const cyanTexture = useMemo(
    () => createGlowTexture("rgba(61,223,214,0.75)", "rgba(22,97,111,0.28)"),
    [],
  );
  const violetTexture = useMemo(
    () => createGlowTexture("rgba(123,92,255,0.6)", "rgba(55,38,108,0.24)"),
    [],
  );

  useEffect(
    () => () => {
      cyanTexture.dispose();
      violetTexture.dispose();
    },
    [cyanTexture, violetTexture],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current || !active) return;
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(elapsed * 0.035) * 0.025;
    groupRef.current.position.x = Math.sin(elapsed * 0.045) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, -4.5]}>
      <mesh position={[-2.8, 1.15, 0]} rotation={[0, 0, -0.18]} scale={[5.4, 3.3, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={cyanTexture}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[2.45, 1.1, -0.5]} rotation={[0, 0, 0.22]} scale={[4.8, 3.4, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={violetTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.3, -2.2, -0.8]} rotation={[0, 0, -0.08]} scale={[6.8, 2.8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={cyanTexture}
          transparent
          opacity={0.11}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SpaceParticles({ active }: { active: boolean }) {
  const farRef = useRef<Points>(null);
  const nearRef = useRef<Points>(null);

  const farParticles = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const cold = new Color("#8ebbd6");
    const teal = new Color("#53d6cf");

    for (let index = 0; index < 760; index += 1) {
      positions.push(
        (seededValue(index, 1) - 0.5) * 14,
        (seededValue(index, 2) - 0.5) * 8,
        -2 - seededValue(index, 3) * 7,
      );
      const color = cold.clone().lerp(teal, seededValue(index, 4) * 0.55);
      colors.push(color.r, color.g, color.b);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, []);

  const nearParticles = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const white = new Color("#e9f6ff");
    const violet = new Color("#9f8cff");

    for (let index = 0; index < 180; index += 1) {
      positions.push(
        (seededValue(index, 11) - 0.5) * 9,
        (seededValue(index, 12) - 0.5) * 5.5,
        -0.4 - seededValue(index, 13) * 4.8,
      );
      const color = white.clone().lerp(violet, seededValue(index, 14) * 0.42);
      colors.push(color.r, color.g, color.b);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!active) return;
    if (farRef.current) {
      farRef.current.rotation.y -= delta * 0.004;
      farRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.015;
    }
    if (nearRef.current) {
      nearRef.current.rotation.y += delta * 0.008;
      nearRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.08) * 0.04;
    }
  });

  return (
    <>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farParticles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[farParticles.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.52}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          sizeAttenuation
        />
      </points>
      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nearParticles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nearParticles.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          vertexColors
          transparent
          opacity={0.58}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}

function HolographicDepth({ active }: { active: boolean }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !active) return;
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.z = elapsed * 0.012;
    groupRef.current.rotation.y = Math.sin(elapsed * 0.08) * 0.08;
  });

  return (
    <group ref={groupRef} position={[-1.4, -0.35, -2.1]} rotation={[0.12, -0.18, -0.4]}>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          position={[index * 0.18, index * 0.06, index * -0.34]}
          rotation={[0.15 + index * 0.2, 0.3, index * 0.48]}
          scale={1.1 + index * 0.42}
        >
          <torusGeometry args={[1.15, 0.0035, 8, 160, Math.PI * 1.52]} />
          <meshBasicMaterial
            color={index === 1 ? "#7f70d8" : "#2d9c9e"}
            transparent
            opacity={0.1 - index * 0.018}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[-0.5, -0.15, -0.7]} rotation={[0.5, 0.2, 0.1]}>
        <octahedronGeometry args={[0.17, 0]} />
        <meshPhysicalMaterial
          color="#6cc9c5"
          transparent
          opacity={0.12}
          roughness={0.15}
          metalness={0.5}
          wireframe
          depthWrite={false}
        />
      </mesh>
      <mesh position={[1.55, 0.72, -1.15]} rotation={[0.35, 0.55, 0.2]}>
        <icosahedronGeometry args={[0.23, 1]} />
        <meshPhysicalMaterial
          color="#9183ef"
          transparent
          opacity={0.09}
          roughness={0.2}
          metalness={0.42}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function SolarPanel({ side }: { side: -1 | 1 }) {
  const verticalDividers = [-0.19, -0.095, 0, 0.095, 0.19];
  const horizontalDividers = [-0.07, 0, 0.07];

  return (
    <group position={[side * 0.47, 0, 0]}>
      <mesh position={[side * -0.255, 0, 0]} castShadow>
        <boxGeometry args={[0.17, 0.018, 0.024]} />
        <meshStandardMaterial color="#707980" metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.018, 0.25]} />
        <meshPhysicalMaterial
          color="#050a12"
          metalness={0.58}
          roughness={0.22}
          clearcoat={0.48}
          clearcoatRoughness={0.23}
        />
      </mesh>
      <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.216]} />
        <meshStandardMaterial
          color="#0d2440"
          emissive="#061221"
          emissiveIntensity={0.12}
          metalness={0.54}
          roughness={0.26}
          side={DoubleSide}
        />
      </mesh>
      {verticalDividers.map((offset) => (
        <mesh key={offset} position={[offset, 0.017, 0]}>
          <boxGeometry args={[0.005, 0.005, 0.224]} />
          <meshStandardMaterial color="#85919b" metalness={0.9} roughness={0.24} />
        </mesh>
      ))}
      {horizontalDividers.map((offset) => (
        <mesh key={offset} position={[0, 0.017, offset]}>
          <boxGeometry args={[0.51, 0.005, 0.005]} />
          <meshStandardMaterial color="#7e8b96" metalness={0.9} roughness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function SatelliteModel() {
  return (
    <group rotation={[0.14, -0.32, 0.08]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.105, 0.12, 0.34, 32]} />
        <meshPhysicalMaterial
          color="#8a744c"
          metalness={0.82}
          roughness={0.34}
          clearcoat={0.18}
          clearcoatRoughness={0.42}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.132, 0.132, 0.075, 32]} />
        <meshStandardMaterial color="#171c22" metalness={0.92} roughness={0.22} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.082, 0.096, 0.13, 24]} />
        <meshStandardMaterial color="#aab1b8" metalness={0.9} roughness={0.26} />
      </mesh>
      <mesh position={[0.21, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.106, 0.14, 24]} />
        <meshStandardMaterial color="#252b31" metalness={0.9} roughness={0.25} />
      </mesh>
      <SolarPanel side={-1} />
      <SolarPanel side={1} />
      <group position={[0.235, 0.015, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.145, 30, 18, 0, Math.PI * 2, 0, Math.PI / 2.08]} />
          <meshPhysicalMaterial
            color="#bfc6cc"
            metalness={0.86}
            roughness={0.22}
            clearcoat={0.25}
            side={BackSide}
          />
        </mesh>
        <mesh position={[0, 0.105, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.18, 12]} />
          <meshStandardMaterial color="#667079" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.205, 0]}>
          <sphereGeometry args={[0.022, 14, 10]} />
          <meshStandardMaterial color="#dce1e5" metalness={0.88} roughness={0.18} />
        </mesh>
      </group>
      <mesh position={[-0.245, 0.052, 0]}>
        <sphereGeometry args={[0.014, 12, 8]} />
        <meshBasicMaterial color="#df5d54" toneMapped={false} />
      </mesh>
    </group>
  );
}

function OrbitingSatellite({ active, config }: { active: boolean; config: OrbitConfig }) {
  const satelliteRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!satelliteRef.current) return;
    const elapsed = active ? clock.getElapsedTime() : 0;
    const angle = config.phase + elapsed * config.speed;

    satelliteRef.current.position.set(
      Math.cos(angle) * config.radius,
      Math.sin(angle) * config.radius * config.verticalScale,
      Math.sin(angle + 0.82) * config.depth,
    );
    satelliteRef.current.rotation.z = angle + Math.PI / 2;
    satelliteRef.current.rotation.y = Math.sin(angle * 1.2) * 0.16;
  });

  return (
    <group rotation={[config.inclination, config.tilt, 0]}>
      <mesh scale={[1, config.verticalScale, 1]}>
        <torusGeometry args={[config.radius, 0.0022, 8, 220]} />
        <meshBasicMaterial
          color="#7ea2be"
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group ref={satelliteRef} scale={config.scale}>
        <SatelliteModel />
      </group>
    </group>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.034}>
      <sphereGeometry args={[0.9, 72, 72]} />
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
            float rim = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 5.2);
            vec3 color = mix(vec3(0.04, 0.22, 0.42), vec3(0.36, 0.78, 1.0), rim);
            gl_FragColor = vec4(color, rim * 0.32);
          }
        `}
      />
    </mesh>
  );
}

function EarthSurface({
  dayTexture,
  nightTexture,
}: {
  dayTexture: ReturnType<typeof useLoader<TextureLoader>>[number];
  nightTexture: ReturnType<typeof useLoader<TextureLoader>>[number];
}) {
  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunDirection: { value: [0.8, 0.34, 0.52] },
    }),
    [dayTexture, nightTexture],
  );

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[0.9, 96, 96]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldNormal;

          void main() {
            vUv = uv;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D dayTexture;
          uniform sampler2D nightTexture;
          uniform vec3 sunDirection;
          varying vec2 vUv;
          varying vec3 vWorldNormal;

          void main() {
            vec3 normal = normalize(vWorldNormal);
            float lightAmount = dot(normal, normalize(sunDirection));
            float daylight = smoothstep(-0.12, 0.24, lightAmount);
            float directLight = max(lightAmount, 0.0);

            vec3 day = texture2D(dayTexture, vUv).rgb;
            vec3 night = texture2D(nightTexture, vUv).rgb;
            vec3 daylightColor = day * (0.16 + directLight * 0.96);
            vec3 nightColor = night * pow(1.0 - daylight, 1.45) * 1.18;
            vec3 color = daylightColor * daylight + day * 0.075 * (1.0 - daylight) + nightColor;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function LoadingWorld() {
  return (
    <group position={[2.05, 0.18, -0.25]}>
      <mesh>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshStandardMaterial color="#07101a" roughness={0.76} metalness={0.08} />
      </mesh>
      <Atmosphere />
    </group>
  );
}

function EarthSystem({ active }: { active: boolean }) {
  const earthRef = useRef<Group>(null);
  const cloudsRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const gl = useThree((state) => state.gl);
  const [dayTexture, normalTexture, nightTexture, cloudsTexture] = useLoader(
    TextureLoader,
    EARTH_TEXTURES,
  );
  const haloTexture = useMemo(
    () => createGlowTexture("rgba(81,190,235,0.45)", "rgba(24,78,121,0.16)"),
    [],
  );
  const normalScale = useMemo(() => new Vector2(0.4, 0.4), []);

  useEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    dayTexture.colorSpace = SRGBColorSpace;
    nightTexture.colorSpace = SRGBColorSpace;
    cloudsTexture.colorSpace = SRGBColorSpace;

    for (const texture of [dayTexture, normalTexture, nightTexture, cloudsTexture]) {
      texture.wrapS = RepeatWrapping;
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    }
  }, [cloudsTexture, dayTexture, gl, nightTexture, normalTexture]);

  useEffect(
    () => () => {
      haloTexture.dispose();
    },
    [haloTexture],
  );

  useFrame(({ clock }, delta) => {
    if (!earthRef.current) return;
    if (active) {
      earthRef.current.rotation.y += delta * 0.018;
      if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.024;
      if (haloRef.current) {
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 0.52) * 0.025;
        haloRef.current.scale.set(2.9 * pulse, 2.9 * pulse, 1);
      }
    }
  });

  return (
    <group position={[2.05, 0.18, -0.25]}>
      <mesh ref={haloRef} position={[0, 0, -0.36]} scale={[2.9, 2.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={haloTexture}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group ref={earthRef} rotation={[0.06, -1.2, -0.08]}>
        <EarthSurface dayTexture={dayTexture} nightTexture={nightTexture} />
        <mesh scale={1.002}>
          <sphereGeometry args={[0.9, 80, 80]} />
          <meshPhysicalMaterial
            normalMap={normalTexture}
            normalScale={normalScale}
            color="#b5d9ef"
            transparent
            opacity={0.075}
            metalness={0.04}
            roughness={0.32}
            clearcoat={0.9}
            clearcoatRoughness={0.58}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={cloudsRef} scale={1.008}>
          <sphereGeometry args={[0.9, 80, 80]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.24}
            alphaTest={0.018}
            depthWrite={false}
            roughness={0.96}
            metalness={0}
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
    </group>
  );
}

function WorldScene({ active }: { active: boolean }) {
  return (
    <>
      <fog attach="fog" args={["#040711", 5.8, 14]} />
      <CameraRig active={active} />
      <NebulaField active={active} />
      <SpaceParticles active={active} />
      <HolographicDepth active={active} />
      <EarthSystem active={active} />

      <ambientLight intensity={0.08} />
      <hemisphereLight args={["#8cb9d2", "#010308", 0.24]} />
      <directionalLight position={[4.6, 3.5, 5.4]} color="#f5fbff" intensity={2.2} castShadow />
      <directionalLight position={[-3.4, -1.8, 2.1]} color="#275b7f" intensity={0.38} />
      <pointLight position={[1.2, 0.8, 1.4]} color="#61cfe4" intensity={0.72} distance={7} />
      <pointLight position={[-2.8, 1.7, -1.8]} color="#7258c8" intensity={0.42} distance={8} />
    </>
  );
}

function DigitalCoreCanvas(props: ComponentProps<"div">) {
  const reducedMotion = useReducedMotion();
  const visible = useDocumentVisibility();
  const active = visible && !reducedMotion;

  return (
    <div {...props}>
      <Canvas
        camera={{ position: [0, 0, 6.25], fov: 40, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          premultipliedAlpha: true,
        }}
        onCreated={({ gl: renderer }) => {
          renderer.toneMapping = ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.02;
          renderer.outputColorSpace = SRGBColorSpace;
        }}
        frameloop={active ? "always" : "demand"}
        shadows
        fallback={<div className="h-full w-full bg-[#040711]" />}
      >
        <Suspense fallback={<LoadingWorld />}>
          <WorldScene active={active} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export const EmranDigitalCore = memo(DigitalCoreCanvas);
