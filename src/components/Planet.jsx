import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export default function Planet({ data, time, globalSpeed, onClick, selected }) {
  const ref = useRef();
  const { radius, distance, color, name } = data;

  useFrame(() => {
    const angle = time.current * data.speed * globalSpeed;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    ref.current.position.set(x, 0, z);
    ref.current.rotation.y += 0.005 + data.speed * 0.002;
  });

  return (
    <group ref={ref} onClick={() => onClick(data)}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial metalness={0.2} roughness={0.7} color={color} />
      </mesh>
      {selected && (
        <Html distanceFactor={10} position={[0, radius + 0.3, 0]}>
          <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
