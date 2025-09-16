import React from "react";
import { PLANETS } from "../data/planets";

export default function Orbits() {
  return (
    <group>
      {PLANETS.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[p.distance - 0.001, p.distance + 0.001, 128]} />
          <meshBasicMaterial transparent opacity={0.15} side={2} />
        </mesh>
      ))}
    </group>
  );
}
