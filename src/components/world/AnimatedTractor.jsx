import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-60, 0.5, -20), new THREE.Vector3(-30, 0.5, -10),
  new THREE.Vector3(0, 0.5, -25), new THREE.Vector3(30, 0.5, -15),
  new THREE.Vector3(50, 0.5, -30), new THREE.Vector3(60, 0.5, -20),
  new THREE.Vector3(40, 0.5, -5), new THREE.Vector3(10, 0.5, 0),
  new THREE.Vector3(-20, 0.5, -10), new THREE.Vector3(-60, 0.5, -20),
], true)

function Wheel({ position, size = 0.6 }) {
  const ref = useRef()
  useFrame(() => { if (ref.current) ref.current.rotation.x += 0.05 })
  return (
    <group position={position}>
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[size, size * 0.35, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function AnimatedTractor() {
  const group = useRef()
  const progress = useRef(0)

  useFrame(() => {
    if (!group.current) return
    progress.current = (progress.current + 0.0003) % 1
    const pt = path.getPoint(progress.current)
    const tan = path.getTangent(progress.current)
    group.current.position.copy(pt)
    group.current.lookAt(pt.x + tan.x, pt.y, pt.z + tan.z)
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[3, 1.5, 2]} />
        <meshStandardMaterial color="#E85D04" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.8, 0.6, 0]}>
        <boxGeometry args={[1.5, 0.8, 1.8]} />
        <meshStandardMaterial color="#D44D00" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.3, 1.8, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.5]} />
        <meshPhysicalMaterial color="#88ccee" transmission={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[1.2, 2, -0.5]}>
        <cylinderGeometry args={[0.06, 0.06, 1.2]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <mesh position={[2.5, 0.6, 0.5]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial emissive="#FFD700" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[2.5, 0.6, 0.5]} color="#FFD700" intensity={2} distance={8} />
      <mesh position={[2.5, 0.6, -0.5]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial emissive="#FFD700" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[2.5, 0.6, -0.5]} color="#FFD700" intensity={2} distance={8} />
      <Wheel position={[-1, 0, 1.2]} size={0.8} />
      <Wheel position={[-1, 0, -1.2]} size={0.8} />
      <Wheel position={[1.8, 0, 1]} size={0.5} />
      <Wheel position={[1.8, 0, -1]} size={0.5} />
    </group>
  )
}
