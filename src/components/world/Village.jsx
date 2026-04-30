import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Village({ position = [0, 0, 0] }) {
  const houses = [
    [0, 0, 0], [7, 0, 2], [-6, 0, 5], [3, 0, -7], [-4, 0, -4], [8, 0, -5]
  ]

  return (
    <group position={position}>
      {houses.map((pos, i) => <House key={i} position={pos} rotation={[0, Math.random() * Math.PI, 0]} />)}
      {/* Coconut trees */}
      {[[4, 0, 8], [-8, 0, 0], [10, 0, -2]].map((p, i) => <CoconutTree key={i} position={p} />)}
      {/* Well */}
      <mesh position={[2, 0.4, 3]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 12]} />
        <meshStandardMaterial color="#888" roughness={0.9} />
      </mesh>
      {/* Warm village light */}
      <pointLight position={[2, 3, 0]} color="#FF8C00" intensity={0.6} distance={25} />
    </group>
  )
}

function House({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Walls */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[4, 2.5, 4]} />
        <meshStandardMaterial color="#d4a574" roughness={0.95} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[3.3, 1.8, 4]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.9, 2.01]}>
        <planeGeometry args={[0.8, 1.8]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>
      {/* Windows */}
      <mesh position={[1.2, 1.5, 2.01]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#FFF8E1" emissive="#FFD54F" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-1.2, 1.5, 2.01]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#FFF8E1" emissive="#FFD54F" emissiveIntensity={0.3} />
      </mesh>
      {/* Veranda */}
      <mesh position={[0, 0.08, 2.8]}>
        <boxGeometry args={[4.5, 0.15, 1.2]} />
        <meshStandardMaterial color="#b8956a" roughness={0.95} />
      </mesh>
    </group>
  )
}

function CoconutTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 8, 6]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <mesh key={i} position={[Math.cos(i * 1.05) * 1.5, 8.2, Math.sin(i * 1.05) * 1.5]}
          rotation={[0.8, i * 1.05, 0]}>
          <planeGeometry args={[3, 0.4]} />
          <meshStandardMaterial color="#2E7D32" side={2} />
        </mesh>
      ))}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.3, 7.8, Math.sin(i * 2.1) * 0.3]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ))}
    </group>
  )
}
