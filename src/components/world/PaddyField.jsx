import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function PaddyField({ position = [0, 0, 0] }) {
  const mesh = useRef()
  const count = 6000
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const [matrices, randoms] = useMemo(() => {
    const m = []
    const r = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40
      const z = (Math.random() - 0.5) * 40
      const h = 0.8 + Math.random() * 0.6
      const rot = Math.random() * 0.3 - 0.15
      dummy.position.set(x, h / 2, z)
      dummy.scale.set(1, h, 1)
      dummy.rotation.set(rot, Math.random() * Math.PI * 2, rot * 0.5)
      dummy.updateMatrix()
      m.push(dummy.matrix.clone())
      r[i] = Math.random()
    }
    return [m, r]
  }, [count])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const r = randoms[i]
      dummy.position.set(
        matrices[i].elements[12],
        matrices[i].elements[13],
        matrices[i].elements[14]
      )
      dummy.scale.set(
        matrices[i].elements[0],
        matrices[i].elements[5],
        matrices[i].elements[10]
      )
      const wind = Math.sin(t * 2 + r * 6.28 + dummy.position.x * 0.5) * 0.08
      dummy.rotation.set(wind, r * Math.PI * 2, wind * 0.5)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position}>
      <instancedMesh ref={mesh} args={[null, null, count]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 1.2, 4]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.8} />
      </instancedMesh>
    </group>
  )
}
