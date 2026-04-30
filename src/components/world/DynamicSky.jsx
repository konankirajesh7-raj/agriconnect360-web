import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'

function FluffyCloud({ position, scale = 1 }) {
  const group = useRef()
  const speed = 0.01 + Math.random() * 0.02
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.x = position[0] + Math.sin(clock.elapsedTime * speed) * 5
    }
  })
  const puffs = [
    [0, 0, 0, 2.5], [-1.8, 0.3, 0.2, 2], [1.5, 0.2, -0.3, 2.2],
    [0.5, 0.6, 0.1, 1.8], [-0.8, 0.5, -0.2, 1.6], [2, -0.1, 0.3, 1.5],
  ]
  return (
    <group ref={group} position={position} scale={scale}>
      {puffs.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[s, 10, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export default function DynamicSky() {
  return (
    <>
      <Sky sunPosition={[80, 30, 30]} turbidity={3} rayleigh={0.5}
        mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Stars radius={200} depth={50} count={2000} factor={4} fade speed={0.3} />
      <FluffyCloud position={[-40, 28, -50]} scale={2.5} />
      <FluffyCloud position={[50, 32, -70]} scale={2} />
      <FluffyCloud position={[10, 30, -40]} scale={3} />
      <FluffyCloud position={[-60, 35, -30]} scale={1.8} />
      <FluffyCloud position={[30, 26, -20]} scale={2.2} />
      <fog attach="fog" args={['#c8ddf0', 100, 280]} />
    </>
  )
}
