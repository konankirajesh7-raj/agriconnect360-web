import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function AgriculturalDrone() {
  const group = useRef()
  const rotors = [useRef(), useRef(), useRef(), useRef()]

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.position.x = Math.sin(t * 0.3) * 40
    group.current.position.z = Math.sin(t * 0.6) * 20
    group.current.position.y = 15 + Math.sin(t * 0.5) * 3
    const nx = Math.cos(t * 0.3) * 40 * 0.3
    const nz = Math.cos(t * 0.6) * 20 * 0.6
    group.current.rotation.y = Math.atan2(nx, nz)
    group.current.rotation.z = Math.sin(t * 0.3) * 0.1
    rotors.forEach(r => { if (r.current) r.current.rotation.y += 0.8 })
  })

  const arms = [[1.2, 0, 1.2], [-1.2, 0, 1.2], [1.2, 0, -1.2], [-1.2, 0, -1.2]]

  return (
    <group ref={group}>
      <mesh><octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
      {arms.map((pos, i) => (
        <group key={i}>
          <mesh position={[pos[0] / 2, 0, pos[2] / 2]}>
            <boxGeometry args={[Math.abs(pos[0]) * 1.1, 0.05, 0.05]} />
            <meshStandardMaterial color="#444" metalness={0.7} />
          </mesh>
          <mesh ref={rotors[i]} position={pos}>
            <cylinderGeometry args={[0.4, 0.4, 0.03, 16]} />
            <meshStandardMaterial color="#666" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.3, -0.2, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial emissive="red" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.3, -0.2, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial emissive="green" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}
