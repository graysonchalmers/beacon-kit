import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Shape({ shape, color }: { shape: "box" | "torus" | "sphere"; color: string }) {
  const m = useRef<Mesh>(null);
  useFrame((_, dt) => { if (m.current && !reduced) { m.current.rotation.y += dt * 0.6; m.current.rotation.x += dt * 0.2; } });
  return (
    <mesh ref={m} rotation={[0.5, 0.6, 0]}>
      {shape === "box" && <boxGeometry args={[1.4, 1.4, 1.4]} />}
      {shape === "torus" && <torusKnotGeometry args={[0.8, 0.28, 128, 16]} />}
      {shape === "sphere" && <icosahedronGeometry args={[1.1, 1]} />}
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

export default function Scene({ shape, color }: { shape: "box" | "torus" | "sphere"; color: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} gl={{ preserveDrawingBuffer: true }} frameloop={reduced ? "demand" : "always"}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 3]} intensity={1.5} />
      <Shape shape={shape} color={color} />
    </Canvas>
  );
}
