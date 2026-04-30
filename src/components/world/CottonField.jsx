import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function CottonField({ position = [0, 0, 0] }) {
  const mesh = useRef()
  const count = 2000
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const randoms = useMemo(() => {
    const r = []
    for (let i = 0; i < count; i++) r.push({
      x: (Math.random() - 0.5) * 30, z: (Math.random() - 0.5) * 30,
      h: 0.6 + Math.random() * 0.4, r: Math.random()
    })
    return r
  }, [])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.elapsedTime
    randoms.forEach((s, i) => {
      const wind = Math.sin(t * 1.5 + s.r * 6.28) * 0.05
      dummy.position.set(s.x, s.h / 2, s.z)
      dummy.scale.set(1, s.h, 1)
      dummy.rotation.set(wind, 0, wind * 0.5)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position}>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <cylinderGeometry args={[0.02, 0.04, 1, 4]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.9} />
      </instancedMesh>
      {Array.from({ length: 120 }, (_, i) => {
        const x = (Math.random() - 0.5) * 28
        const z = (Math.random() - 0.5) * 28
        return (
          <mesh key={i} position={[x, 0.7 + Math.random() * 0.3, z]}>
            <sphereGeometry args={[0.12 + Math.random() * 0.06, 6, 6]} />
            <meshStandardMaterial color="white" roughness={1}
              emissive="#fffef0" emissiveIntensity={0.1} />
          </mesh>
        )
      })}
    </group>
  )
}
