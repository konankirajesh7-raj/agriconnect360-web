import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function Terrain() {
  const mesh = useRef()
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(300, 300, 128, 128)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      pos.setZ(i, Math.sin(x * 0.05) * 2 + Math.cos(y * 0.04) * 1.5 + Math.sin(x * 0.1 + y * 0.08) * 0.5)
    }
    g.computeVertexNormals()
    return g
  }, [])

  const mat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2d5a1e',
      roughness: 0.95,
      metalness: 0,
      flatShading: false,
      vertexColors: false,
    })
  }, [])

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={geo} material={mat} />
  )
}
