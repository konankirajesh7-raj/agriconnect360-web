import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import Terrain from './world/Terrain'
import PaddyField from './world/PaddyField'
import CottonField from './world/CottonField'
import AnimatedTractor from './world/AnimatedTractor'
import AgriculturalDrone from './world/AgriculturalDrone'
import DynamicSky from './world/DynamicSky'
import Village from './world/Village'
import { FeaturedPhotoPanels, PromotionPhotoPanels, FarmerPhotoPanels, FactoryPhotoPanels, LabourPhotoPanels } from './world/PhotoPanels'
import { useBackgroundPhotos } from '../lib/hooks/useBackgroundPhotos'

function AutoCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    const r = 80
    camera.position.x = Math.sin(t * 0.05) * r
    camera.position.z = Math.cos(t * 0.05) * r
    camera.position.y = 40 + Math.sin(t * 0.08) * 10
    camera.lookAt(0, 0, -15)
  })
  return null
}

function Lights() {
  return (
    <>
      <ambientLight color="#b0c4de" intensity={0.5} />
      <directionalLight position={[50, 80, 30]} intensity={2} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={200}
        shadow-camera-left={-80} shadow-camera-right={80}
        shadow-camera-top={80} shadow-camera-bottom={-80} color="#FFF5E0" />
      <hemisphereLight skyColor="#87CEEB" groundColor="#8B7355" intensity={0.5} />
    </>
  )
}

function CommunityPhotoWorld({ photos }) {
  if (!photos) return null
  return (
    <>
      <FeaturedPhotoPanels photos={photos.featured} />
      <PromotionPhotoPanels photos={photos.promotions} />
      <FarmerPhotoPanels photos={photos.farmerPhotos} />
      <FactoryPhotoPanels photos={photos.factoryPhotos} />
      <LabourPhotoPanels photos={photos.labourPhotos} />
    </>
  )
}

function SceneContent({ photos }) {
  return (
    <Suspense fallback={null}>
      <AutoCamera />
      <Lights />
      <DynamicSky />
      <Terrain />
      <PaddyField position={[-40, 0.1, -30]} />
      <PaddyField position={[-20, 0.1, -50]} />
      <CottonField position={[30, 0.1, -40]} />
      <AnimatedTractor />
      <AgriculturalDrone />
      <Village position={[-55, 0, 20]} />
      <CommunityPhotoWorld photos={photos} />
    </Suspense>
  )
}

export default function FarmScene3D() {
  const { photos } = useBackgroundPhotos()

  return (
    <div className="farm-scene-3d">
      <Canvas
        camera={{ position: [0, 45, 80], fov: 65, near: 0.5, far: 500 }}
        shadows
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <SceneContent photos={photos} />
      </Canvas>
    </div>
  )
}
