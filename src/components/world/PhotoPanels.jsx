import { useRef, useMemo, useState, useEffect, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

// Texture loader with error handling
function PhotoPanel({ photo, position, scale = 1, frameColor = '#5D4037', labelColor = '#4CAF50', roleLabel = '', glowColor = null, glowIntensity = 0 }) {
  const ref = useRef()
  const [texture, setTexture] = useState(null)
  const idx = useMemo(() => Math.random() * 10, [])

  useEffect(() => {
    if (!photo?.thumbnail_url) return
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    loader.load(
      photo.thumbnail_url,
      (tex) => { tex.colorSpace = THREE.SRGBColorSpace; setTexture(tex) },
      undefined,
      () => setTexture(null)
    )
  }, [photo?.thumbnail_url])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5 + idx) * 0.2
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.2 + idx) * 0.03
  })

  if (!texture) return null

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[4, 3, 0.15]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} metalness={glowIntensity > 0 ? 0.6 : 0}
          emissive={glowColor || frameColor} emissiveIntensity={glowIntensity} />
      </mesh>
      {/* Photo */}
      <mesh position={[0, 0.15, 0.08]}>
        <planeGeometry args={[3.5, 2.3]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Caption bar */}
      <mesh position={[0, -1.2, 0.08]}>
        <planeGeometry args={[3.5, 0.6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      {/* Role badge dot */}
      {roleLabel && (
        <mesh position={[1.6, 1.2, 0.1]}>
          <circleGeometry args={[0.15, 12]} />
          <meshStandardMaterial color={labelColor} emissive={labelColor} emissiveIntensity={0.5} />
        </mesh>
      )}
      {/* Glow light for promotions */}
      {glowColor && <pointLight color={glowColor} intensity={0.4} distance={8} />}
    </group>
  )
}

export function FeaturedPhotoPanels({ photos }) {
  if (!photos?.length) return null
  const positions = [[-10, 5, -18], [0, 6, -22], [10, 5, -18], [-18, 4, -12], [18, 4, -12]]
  return photos.slice(0, 5).map((p, i) => (
    <PhotoPanel key={p.id} photo={p} position={positions[i % positions.length]}
      scale={1.3} frameColor="#FFD700" labelColor="#FFD700" roleLabel="⭐"
      glowColor="#FFD700" glowIntensity={0.3} />
  ))
}

export function PromotionPhotoPanels({ photos }) {
  if (!photos?.length) return null
  const positions = [[-25, 3, -8], [25, 3, -8], [-22, 3, -22], [22, 3, -22], [-28, 4, -15], [28, 4, -15]]
  const colors = { supplier: '#FF9800', factory: '#2196F3', broker: '#9C27B0' }
  return photos.slice(0, 6).map((p, i) => (
    <PhotoPanel key={p.id} photo={p} position={positions[i % positions.length]}
      scale={1.1} frameColor={colors[p.uploader_role] || '#FF9800'}
      labelColor={colors[p.uploader_role] || '#FF9800'} roleLabel="PROMO"
      glowColor={colors[p.uploader_role] || '#FF9800'} glowIntensity={0.25} />
  ))
}

export function FarmerPhotoPanels({ photos }) {
  if (!photos?.length) return null
  const positions = [
    [-8, 2, -12], [-3, 1.8, -18], [5, 2, -14], [9, 1.8, -10],
    [-14, 2.5, -8], [-6, 1.5, -25], [6, 2, -22], [14, 2.5, -8],
    [-10, 2, -30], [0, 1.8, -35], [10, 2, -28], [-16, 2, -22],
    [16, 2, -20], [-4, 1.5, -38], [4, 2, -36]
  ]
  return photos.slice(0, 15).map((p, i) => (
    <PhotoPanel key={p.id} photo={p} position={positions[i % positions.length]}
      scale={0.85 + Math.random() * 0.3} frameColor="#5D4037" labelColor="#4CAF50" roleLabel="🌾" />
  ))
}

export function FactoryPhotoPanels({ photos }) {
  if (!photos?.length) return null
  const positions = [[-32, 5, -35], [32, 5, -35], [0, 6, -45], [-30, 4, -48], [30, 4, -48]]
  return photos.slice(0, 5).map((p, i) => (
    <PhotoPanel key={p.id} photo={p} position={positions[i % positions.length]}
      scale={1.2} frameColor="#37474F" labelColor="#2196F3" roleLabel="🏭"
      glowColor="#2196F3" glowIntensity={0.15} />
  ))
}

export function LabourPhotoPanels({ photos }) {
  if (!photos?.length) return null
  const positions = [[-18, 2, -5], [18, 2, -5], [-20, 2.5, -15], [20, 2.5, -15]]
  return photos.slice(0, 4).map((p, i) => (
    <PhotoPanel key={p.id} photo={p} position={positions[i % positions.length]}
      scale={0.9} frameColor="#E65100" labelColor="#FF6D00" roleLabel="👷"
      glowColor="#FF6D00" glowIntensity={0.1} />
  ))
}
