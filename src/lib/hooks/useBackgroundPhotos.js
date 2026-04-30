import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

// Demo photos for when no real uploads exist yet
const DEMO_PHOTOS = [
  { id: 'd1', uploader_name: 'Ramesh Naidu', uploader_role: 'farmer', uploader_district: 'Guntur', uploader_village: 'Tenali', photo_url: 'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=400', caption: 'Golden paddy ready for harvest', category: 'crop_harvest', status: 'featured', is_promotion: false, display_type: 'statewide' },
  { id: 'd2', uploader_name: 'Lakshmi Devi', uploader_role: 'farmer', uploader_district: 'Krishna', uploader_village: 'Vijayawada', photo_url: 'https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&w=400', caption: 'Fresh vegetables from our farm', category: 'produce', status: 'approved', is_promotion: false, display_type: 'district' },
  { id: 'd3', uploader_name: 'Venkat Rao', uploader_role: 'farmer', uploader_district: 'Guntur', uploader_village: 'Mangalagiri', photo_url: 'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&w=400', caption: 'Tractor ploughing season begins', category: 'machinery', status: 'approved', is_promotion: false, display_type: 'local' },
  { id: 'd4', uploader_name: 'AP Seeds Ltd', uploader_role: 'supplier', uploader_district: 'Guntur', photo_url: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=400', caption: 'Premium Hybrid Seeds — 20% Off', category: 'promotion', status: 'approved', is_promotion: true, promotion_priority: 8, display_type: 'promotion' },
  { id: 'd5', uploader_name: 'Srinivas Cotton Mill', uploader_role: 'factory', uploader_district: 'Guntur', photo_url: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=400', caption: 'Now buying Grade-A cotton', category: 'factory_product', status: 'approved', is_promotion: true, promotion_priority: 6, display_type: 'district' },
  { id: 'd6', uploader_name: 'Suresh Kumar', uploader_role: 'farmer', uploader_district: 'Krishna', photo_url: 'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&w=400', caption: 'Drip irrigation installed this week', category: 'irrigation', status: 'featured', is_promotion: false, display_type: 'statewide' },
  { id: 'd7', uploader_name: 'Ravi Teja', uploader_role: 'farmer', uploader_district: 'Guntur', uploader_village: 'Narasaraopet', photo_url: 'https://images.pexels.com/photos/1382394/pexels-photo-1382394.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/1382394/pexels-photo-1382394.jpeg?auto=compress&w=400', caption: 'Chilli harvest — record yield!', category: 'crop_harvest', status: 'approved', is_promotion: false, display_type: 'local' },
  { id: 'd8', uploader_name: 'Krishna Fertilizers', uploader_role: 'supplier', uploader_district: 'Krishna', photo_url: 'https://images.pexels.com/photos/2518861/pexels-photo-2518861.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/2518861/pexels-photo-2518861.jpeg?auto=compress&w=400', caption: 'Organic fertilizer now available', category: 'promotion', status: 'approved', is_promotion: true, promotion_priority: 5, display_type: 'promotion' },
  { id: 'd9', uploader_name: 'Farm Labour Union', uploader_role: 'labour', uploader_district: 'Guntur', uploader_village: 'Ponnur', photo_url: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=400', caption: 'Harvest workers available — Book now', category: 'labour_work', status: 'approved', is_promotion: false, display_type: 'district' },
  { id: 'd10', uploader_name: 'Prasad Reddy', uploader_role: 'farmer', uploader_district: 'Anantapur', photo_url: 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&w=400', caption: 'Groundnut field looking beautiful', category: 'farm_field', status: 'approved', is_promotion: false, display_type: 'statewide' },
  { id: 'd11', uploader_name: 'Anjali Farms', uploader_role: 'farmer', uploader_district: 'West Godavari', photo_url: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&w=400', caption: 'Banana plantation thriving', category: 'farm_field', status: 'approved', is_promotion: false, display_type: 'district' },
  { id: 'd12', uploader_name: 'Rajesh Cattle', uploader_role: 'farmer', uploader_district: 'Guntur', photo_url: 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&w=600', thumbnail_url: 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&w=400', caption: 'Our dairy herd', category: 'livestock', status: 'approved', is_promotion: false, display_type: 'local' },
]

export function useBackgroundPhotos() {
  const [photos, setPhotos] = useState(null)
  const [loading, setLoading] = useState(true)

  const organize = useCallback((data) => ({
    featured: data.filter(p => p.status === 'featured'),
    promotions: data.filter(p => p.is_promotion && p.status === 'approved'),
    farmerPhotos: data.filter(p => p.uploader_role === 'farmer' && !p.is_promotion),
    supplierPhotos: data.filter(p => p.uploader_role === 'supplier'),
    factoryPhotos: data.filter(p => p.uploader_role === 'factory'),
    labourPhotos: data.filter(p => p.uploader_role === 'labour'),
  }), [])

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('background_photos')
        .select('*')
        .in('status', ['approved', 'featured'])
        .order('promotion_priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50)

      if (error || !data || data.length === 0) {
        // Use demo photos as fallback
        setPhotos(organize(DEMO_PHOTOS))
      } else {
        setPhotos(organize(data))
      }
    } catch {
      setPhotos(organize(DEMO_PHOTOS))
    } finally {
      setLoading(false)
    }
  }, [organize])

  useEffect(() => {
    fetchPhotos()
    const interval = setInterval(fetchPhotos, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchPhotos])

  return { photos, loading, refetch: fetchPhotos }
}
