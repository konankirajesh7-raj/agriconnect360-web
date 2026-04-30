import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

const ROLE_COLORS = { farmer:'#4CAF50', supplier:'#FF9800', factory:'#2196F3', labour:'#FFC107', broker:'#9C27B0', admin:'#06b6d4' }
const ROLE_ICONS = { farmer:'👨‍🌾', supplier:'🏪', factory:'🏭', labour:'👷', broker:'🤝', admin:'🛡️' }

// Demo posts with mandal info for all AP regions
const DEMO_POSTS = [
  { id:'demo-1', user_name:'Ramesh Naidu', user_role:'farmer', user_district:'Guntur', user_mandal:'Tenali', user_village:'Tenali', media_type:'photo', media_urls:['https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=400', caption:'Golden paddy fields ready for harvest! 🌾 This season has been amazing with proper irrigation.', tags:['paddy','harvest','guntur'], category:'crop_harvest', visibility:'district', status:'featured', is_promotion:false, like_count:142, comment_count:28, share_count:15, view_count:1240, created_at:'2026-04-28T08:00:00Z' },
  { id:'demo-2', user_name:'AP Seeds Ltd', user_role:'supplier', user_district:'Guntur', user_mandal:'Guntur', user_village:'Guntur', media_type:'photo', media_urls:['https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=400', caption:'🌱 Premium Hybrid Cotton Seeds — 20% OFF this week! Free delivery to Guntur district farmers.', tags:['seeds','cotton','offer'], category:'promotion', visibility:'district', status:'approved', is_promotion:true, promotion_priority:8, like_count:89, comment_count:45, share_count:32, view_count:2100, created_at:'2026-04-28T06:00:00Z' },
  { id:'demo-3', user_name:'Lakshmi Devi', user_role:'farmer', user_district:'Guntur', user_mandal:'Tenali', user_village:'Tenali', media_type:'photo', media_urls:['https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&w=400', caption:'Fresh organic vegetables from our kitchen garden! Growing tomatoes, brinjal, and chillies 🥬🍅', tags:['organic','vegetables','kitchen_garden'], category:'produce', visibility:'village', status:'approved', is_promotion:false, like_count:67, comment_count:12, share_count:8, view_count:580, created_at:'2026-04-28T04:00:00Z' },
  { id:'demo-4', user_name:'Srinivas Cotton Mill', user_role:'factory', user_district:'Guntur', user_mandal:'Mangalagiri', user_village:'Mangalagiri', media_type:'reel', media_urls:['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=400', caption:'🏭 See how we process Grade-A cotton! Now buying at ₹7,200/quintal. Best rates in Guntur district.', tags:['cotton','mill','processing'], category:'factory', visibility:'statewide', status:'approved', is_promotion:true, promotion_priority:6, like_count:234, comment_count:56, share_count:78, view_count:4500, duration_seconds:45, created_at:'2026-04-27T12:00:00Z' },
  { id:'demo-5', user_name:'Farm Labour Union', user_role:'labour', user_district:'Guntur', user_mandal:'Mangalagiri', user_village:'Mangalagiri', media_type:'photo', media_urls:['https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=400', caption:'👷 Experienced harvest team available! 15 workers, paddy/cotton/chilli specialists. Book for Rabi season now!', tags:['labour','harvest','booking'], category:'labour_work', visibility:'district', status:'approved', is_promotion:false, like_count:45, comment_count:18, share_count:22, view_count:890, created_at:'2026-04-27T10:00:00Z' },
  { id:'demo-6', user_name:'Venkat Rao', user_role:'farmer', user_district:'Guntur', user_mandal:'Narasaraopet', user_village:'Narasaraopet', media_type:'reel', media_urls:['https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&w=400', caption:'New tractor ploughing our 5 acre field! 🚜 Mahindra 575 DI doing incredible work this season.', tags:['tractor','ploughing','machinery'], category:'machinery', visibility:'district', status:'approved', is_promotion:false, like_count:198, comment_count:34, share_count:45, view_count:3200, duration_seconds:30, created_at:'2026-04-27T08:00:00Z' },
  { id:'demo-7', user_name:'Krishna Agri Traders', user_role:'broker', user_district:'Guntur', user_mandal:'Ponnur', user_village:'Ponnur', media_type:'photo', media_urls:['https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&w=400', caption:'🤝 Looking for Grade-A groundnut! Offering ₹5,800/quintal. Direct pickup from farm.', tags:['groundnut','buying','market'], category:'market', visibility:'district', status:'approved', is_promotion:true, promotion_priority:5, like_count:56, comment_count:23, share_count:12, view_count:670, created_at:'2026-04-26T14:00:00Z' },
  { id:'demo-8', user_name:'Suresh Kumar', user_role:'farmer', user_district:'Krishna', user_mandal:'Vijayawada', user_village:'Vijayawada', media_type:'photo', media_urls:['https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&w=400', caption:'Installed drip irrigation on 3 acres! 💧 Saving 40% water compared to flood irrigation. Highly recommended!', tags:['drip','irrigation','water_saving'], category:'irrigation', visibility:'statewide', status:'featured', is_promotion:false, like_count:312, comment_count:67, share_count:89, view_count:5600, created_at:'2026-04-26T06:00:00Z' },
  { id:'demo-9', user_name:'Priya Reddy', user_role:'farmer', user_district:'Guntur', user_mandal:'Tenali', user_village:'Tenali', media_type:'carousel', media_urls:['https://images.pexels.com/photos/1382394/pexels-photo-1382394.jpeg?auto=compress&w=800','https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800','https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/1382394/pexels-photo-1382394.jpeg?auto=compress&w=400', caption:'Record chilli harvest this year! 🌶️ 3 varieties across 4 acres. Guntur Sannam yielding 25 quintals/acre!', tags:['chilli','harvest','guntur_sannam'], category:'crop_harvest', visibility:'statewide', status:'approved', is_promotion:false, like_count:456, comment_count:89, share_count:120, view_count:8900, created_at:'2026-04-25T12:00:00Z' },
  { id:'demo-10', user_name:'Anjali Farms', user_role:'farmer', user_district:'Guntur', user_mandal:'Ponnur', user_village:'Ponnur', media_type:'photo', media_urls:['https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&w=400', caption:'Our dairy herd growing strong! 🐄 Fresh milk production up 20% this quarter. Happy cows, happy farm!', tags:['dairy','cattle','livestock'], category:'livestock', visibility:'district', status:'approved', is_promotion:false, like_count:123, comment_count:34, share_count:18, view_count:1450, created_at:'2026-04-25T08:00:00Z' },
  // Posts from other districts
  { id:'demo-11', user_name:'Ravi Prakash', user_role:'farmer', user_district:'Prakasam', user_mandal:'Ongole', user_village:'Ongole', media_type:'photo', media_urls:['https://images.pexels.com/photos/2804327/pexels-photo-2804327.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2804327/pexels-photo-2804327.jpeg?auto=compress&w=400', caption:'Ongole bulls grazing in the morning sun! 🐂 Best breed from Prakasam district.', tags:['ongole','bulls','prakasam'], category:'livestock', visibility:'statewide', status:'approved', is_promotion:false, like_count:89, comment_count:15, share_count:24, view_count:1800, created_at:'2026-04-27T15:00:00Z' },
  { id:'demo-12', user_name:'Nellore Fish Farm', user_role:'supplier', user_district:'Nellore', user_mandal:'Nellore', user_village:'Nellore', media_type:'reel', media_urls:['https://images.pexels.com/photos/2131967/pexels-photo-2131967.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2131967/pexels-photo-2131967.jpeg?auto=compress&w=400', caption:'🐟 Fresh water prawns from Nellore! Premium quality aquaculture. Bulk orders welcome.', tags:['prawns','aquaculture','nellore'], category:'produce', visibility:'statewide', status:'approved', is_promotion:true, promotion_priority:7, like_count:167, comment_count:38, share_count:52, view_count:3400, duration_seconds:35, created_at:'2026-04-27T09:00:00Z' },
  { id:'demo-13', user_name:'Kurnool Rice Mill', user_role:'factory', user_district:'Kurnool', user_mandal:'Kurnool', user_village:'Kurnool', media_type:'photo', media_urls:['https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&w=400', caption:'🏭 State-of-the-art rice processing facility! Buying paddy at best MSP rates from all Rayalaseema farmers.', tags:['rice','mill','kurnool'], category:'factory', visibility:'statewide', status:'featured', is_promotion:true, promotion_priority:9, like_count:278, comment_count:62, share_count:44, view_count:5200, created_at:'2026-04-26T11:00:00Z' },
  { id:'demo-14', user_name:'Harvest Hands', user_role:'labour', user_district:'East Godavari', user_mandal:'Kakinada', user_village:'Kakinada', media_type:'photo', media_urls:['https://images.pexels.com/photos/2880507/pexels-photo-2880507.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/2880507/pexels-photo-2880507.jpeg?auto=compress&w=400', caption:'👷 Professional sugarcane harvesting team — 20 workers ready for East Godavari and West Godavari!', tags:['sugarcane','labour','godavari'], category:'labour_work', visibility:'statewide', status:'approved', is_promotion:false, like_count:34, comment_count:11, share_count:19, view_count:720, created_at:'2026-04-26T08:00:00Z' },
  { id:'demo-15', user_name:'Anantapur Groundnut Co', user_role:'broker', user_district:'Anantapur', user_mandal:'Anantapur', user_village:'Anantapur', media_type:'photo', media_urls:['https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=800'], thumbnail_url:'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=400', caption:'🤝 Anantapur is the groundnut capital! Buying at ₹6,200/quintal this week. Premium quality only.', tags:['groundnut','anantapur','market'], category:'market', visibility:'statewide', status:'approved', is_promotion:true, promotion_priority:6, like_count:98, comment_count:27, share_count:31, view_count:1650, created_at:'2026-04-25T16:00:00Z' },
]

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago'
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function computeScore(post, userDistrict, userVillage) {
  const hoursOld = Math.max(1, (Date.now() - new Date(post.created_at).getTime()) / 3600000)
  return (
    (post.status === 'featured' ? 1000 : 0) +
    ((post.promotion_priority || 0) * 100) +
    (post.user_village === userVillage && userVillage ? 50 : 0) +
    ((post.like_count || 0) * 2) +
    ((post.comment_count || 0) * 3) +
    ((post.view_count || 0) * 0.1) +
    ((1 / hoursOld) * 20)
  )
}

export { ROLE_COLORS, ROLE_ICONS, timeAgo }

export function useCommunityFeed() {
  const { user, farmerProfile, userRole, isAdmin } = useAuth()
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [myLikes, setMyLikes] = useState(new Set())
  const [mySaves, setMySaves] = useState(new Set())
  const realtimeRef = useRef(null)

  const district = farmerProfile?.district || 'Guntur'
  const mandal = farmerProfile?.mandal || farmerProfile?.village || 'Tenali'
  const village = farmerProfile?.village || 'Tenali'
  const role = userRole || 'farmer'

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase.from('community_posts').select('*')
      if (isAdmin) {
        query = query.order('created_at', { ascending: false }).limit(200)
      } else {
        query = query.in('status', ['approved', 'featured']).order('created_at', { ascending: false }).limit(100)
      }
      const { data, error } = await query
      if (error || !data || data.length === 0) {
        setAllPosts(DEMO_POSTS)
      } else {
        setAllPosts(data)
      }
    } catch {
      setAllPosts(DEMO_POSTS)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  // Fetch user likes & saves
  const fetchInteractions = useCallback(async () => {
    if (!user?.id) return
    try {
      const [likesRes, savesRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', user.id),
        supabase.from('post_saves').select('post_id').eq('user_id', user.id),
      ])
      if (likesRes.data) setMyLikes(new Set(likesRes.data.map(l => l.post_id)))
      if (savesRes.data) setMySaves(new Set(savesRes.data.map(s => s.post_id)))
    } catch { /* ignore */ }
  }, [user?.id])

  useEffect(() => {
    fetchPosts()
    fetchInteractions()
    const interval = setInterval(fetchPosts, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchPosts, fetchInteractions])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel('community-feed-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAllPosts(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setAllPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
        } else if (payload.eventType === 'DELETE') {
          setAllPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()
    realtimeRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Smart sort
  const sortedPosts = [...allPosts].sort((a, b) => computeScore(b, district, village) - computeScore(a, district, village))

  // Organized feeds
  const featuredPosts = sortedPosts.filter(p => p.status === 'featured')
  const reels = sortedPosts.filter(p => p.media_type === 'reel' || p.media_type === 'short_video')
  const photos = sortedPosts.filter(p => p.media_type === 'photo' || p.media_type === 'carousel')
  const promotions = sortedPosts.filter(p => p.is_promotion)
  const villagePosts = sortedPosts.filter(p => p.user_village === village && village)
  const districtPosts = sortedPosts.filter(p => p.user_district === district)
  const farmerPosts = sortedPosts.filter(p => p.user_role === 'farmer')
  const supplierPosts = sortedPosts.filter(p => p.user_role === 'supplier')
  const factoryPosts = sortedPosts.filter(p => p.user_role === 'factory')
  const labourPosts = sortedPosts.filter(p => p.user_role === 'labour')
  const savedPosts = sortedPosts.filter(p => mySaves.has(p.id))

  // Actions
  async function likePost(postId) {
    const isLiked = myLikes.has(postId)
    // Optimistic
    setMyLikes(prev => { const n = new Set(prev); isLiked ? n.delete(postId) : n.add(postId); return n })
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) + (isLiked ? -1 : 1) } : p))
    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user?.id)
        await supabase.from('community_posts').update({ like_count: Math.max(0, (allPosts.find(p => p.id === postId)?.like_count || 1) - 1) }).eq('id', postId)
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user?.id })
        await supabase.from('community_posts').update({ like_count: (allPosts.find(p => p.id === postId)?.like_count || 0) + 1 }).eq('id', postId)
      }
    } catch { /* revert on error silently */ }
  }

  async function savePost(postId) {
    const isSaved = mySaves.has(postId)
    setMySaves(prev => { const n = new Set(prev); isSaved ? n.delete(postId) : n.add(postId); return n })
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, save_count: (p.save_count || 0) + (isSaved ? -1 : 1) } : p))
    try {
      if (isSaved) {
        await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', user?.id)
      } else {
        await supabase.from('post_saves').insert({ post_id: postId, user_id: user?.id })
      }
    } catch { /* ignore */ }
  }

  async function addComment(postId, text, parentId = null) {
    if (!text?.trim()) return null
    const commentData = {
      post_id: postId, user_id: user?.id,
      user_name: farmerProfile?.name || 'User',
      user_role: role, comment_text: text.trim(),
      parent_comment_id: parentId || null,
    }
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
    try {
      const { data } = await supabase.from('post_comments').insert(commentData).select().single()
      await supabase.from('community_posts').update({ comment_count: (allPosts.find(p => p.id === postId)?.comment_count || 0) + 1 }).eq('id', postId)
      return data
    } catch { return commentData }
  }

  async function getComments(postId) {
    try {
      const { data } = await supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true })
      return data || []
    } catch { return [] }
  }

  async function incrementViews(postId) {
    try {
      await supabase.from('community_posts').update({ view_count: (allPosts.find(p => p.id === postId)?.view_count || 0) + 1 }).eq('id', postId)
    } catch { /* ignore */ }
  }

  async function reportPost(postId, reason) {
    try {
      await supabase.from('post_reports').insert({ post_id: postId, reporter_id: user?.id, reason })
      return true
    } catch { return false }
  }

  // Admin actions
  async function updatePostStatus(postId, status, adminNote = '') {
    try {
      const update = { status, admin_note: adminNote }
      if (status === 'approved' || status === 'featured') update.approved_at = new Date().toISOString()
      const { error } = await supabase.from('community_posts').update(update).eq('id', postId)
      if (!error) setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, ...update } : p))
      return !error
    } catch { return false }
  }

  async function deletePost(postId) {
    try {
      await supabase.from('community_posts').delete().eq('id', postId)
      setAllPosts(prev => prev.filter(p => p.id !== postId))
      return true
    } catch { return false }
  }

  return {
    allPosts: sortedPosts, loading, myLikes, mySaves,
    featuredPosts, reels, photos, promotions,
    villagePosts, districtPosts,
    farmerPosts, supplierPosts, factoryPosts, labourPosts,
    savedPosts,
    likePost, savePost, addComment, getComments, incrementViews, reportPost,
    updatePostStatus, deletePost,
    refetch: fetchPosts,
    district, mandal, village, role,
  }
}
