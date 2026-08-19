/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  User, Mail, Phone, MapPin, Briefcase,
  Calendar, Loader2, Camera, Save,
  X, CheckCircle2, Pencil,
  Building, GraduationCap, Sparkles,
  Globe
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffProfile {
  id: string
  full_name: string
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email: string
  phone?: string | null
  address?: string | null
  bio?: string | null
  role?: string | null
  department?: string | null
  title?: string | null
  photo_url?: string | null
  avatar_url?: string | null
  joined_at?: string
  website?: string | null
  linkedin?: string | null
  twitter?: string | null
  date_of_birth?: string | null
  gender?: string | null
  qualification?: string | null
  years_of_experience?: number | null
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading profile...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your details</p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StaffProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useUser()

  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Form state ────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<Partial<StaffProfile>>({})

  // ─── Fetch Profile ──────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
        return
      }

      if (data) {
        const profileData: StaffProfile = {
          id: data.id,
          full_name: data.full_name || '',
          display_name: data.display_name || null,
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          email: data.email || '',
          phone: data.phone || null,
          address: data.address || null,
          bio: data.bio || null,
          role: data.role || null,
          department: data.department || null,
          title: data.title || null,
          photo_url: data.photo_url || null,
          avatar_url: data.avatar_url || null,
          joined_at: data.created_at || null,
          website: data.website || null,
          linkedin: data.linkedin || null,
          twitter: data.twitter || null,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender || null,
          qualification: data.qualification || null,
          years_of_experience: data.years_of_experience || null,
        }
        setProfile(profileData)
        setFormData(profileData)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProfile()
    }
  }, [authLoading, user?.id, fetchProfile])

  // ─── Handle Photo Upload ───────────────────────────────────────────────────

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) {
      toast.error('No file selected')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Failed to upload image: ' + uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        toast.error('Failed to update profile photo')
        return
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, photo_url: publicUrl } : null)
      setFormData(prev => ({ ...prev, photo_url: publicUrl }))
      setAvatarError(false)
      
      // Refresh user context
      await refreshUser()
      
      toast.success('Profile photo updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ─── Handle Remove Photo ──────────────────────────────────────────────────

  const handleRemovePhoto = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          photo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error removing photo:', error)
        toast.error('Failed to remove photo')
        return
      }

      setProfile(prev => prev ? { ...prev, photo_url: null } : null)
      setFormData(prev => ({ ...prev, photo_url: null }))
      setAvatarError(false)
      
      // Refresh user context
      await refreshUser()
      
      toast.success('Profile photo removed')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove photo')
    }
  }

  // ─── Handle Save ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!user?.id || !profile) return

    setSaving(true)
    try {
      const updates: any = {
        full_name: formData.full_name,
        display_name: formData.display_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        department: formData.department,
        title: formData.title,
        website: formData.website,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        qualification: formData.qualification,
        years_of_experience: formData.years_of_experience,
        updated_at: new Date().toISOString(),
      }

      // Remove undefined/null values
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined || updates[key] === null) {
          delete updates[key]
        }
      })

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to save changes')
        return
      }

      // Update local state
      setProfile(prev => ({ ...prev, ...formData } as StaffProfile))
      setEditing(false)
      
      // Refresh user context
      await refreshUser()
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // ─── Cancel editing ────────────────────────────────────────────────────────

  const handleCancel = () => {
    setEditing(false)
    setFormData(profile || {})
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getInitials = (name: string) => {
    if (!name) return 'S'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getRoleDisplay = (role?: string | null) => {
    if (role === 'admin') return 'Administrator'
    if (role === 'teacher' || role === 'staff') return 'Teacher/Staff'
    return 'Staff'
  }

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  const initials = getInitials(profile?.full_name || user?.full_name || 'Staff')
  const displayName = profile?.display_name || profile?.full_name || user?.full_name || 'Staff Member'
  const photoUrl = profile?.photo_url || undefined

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
              <p className="text-sm text-slate-500">
                View and manage your personal information
              </p>
            </div>
            <div className="flex items-center gap-3">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-slate-800 hover:bg-slate-900 text-white gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Profile Card ────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div 
            className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          >
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl bg-white">
                  {photoUrl && !avatarError ? (
                    <AvatarImage 
                      src={photoUrl} 
                      alt={displayName}
                      onError={() => setAvatarError(true)}
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload button */}
                <div className="absolute bottom-0 right-0 flex gap-1">
                  {photoUrl && !avatarError && (
                    <button
                      onClick={handleRemovePhoto}
                      className="p-1.5 bg-red-500 rounded-full shadow-md hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Upload photo"
                  >
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <CardContent className="pt-20 pb-6 px-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">{displayName}</h2>
                  <Badge className="bg-blue-100 text-blue-700">
                    {getRoleDisplay(profile?.role || user?.role)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                    {profile?.email || user?.email}
                  </span>
                  {profile?.department && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Building className="h-3.5 w-3.5" />
                        {profile.department}
                      </span>
                    </>
                  )}
                  {profile?.title && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Briefcase className="h-3.5 w-3.5" />
                        {profile.title}
                      </span>
                    </>
                  )}
                </div>
                {profile?.joined_at && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(profile.joined_at).toLocaleDateString('en-US', {
                      month: 'long', year: 'numeric'
                    })}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {profile?.qualification && (
                  <Badge variant="outline" className="text-xs">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {profile.qualification}
                  </Badge>
                )}
                {profile?.years_of_experience && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {profile.years_of_experience} yrs
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              {editing ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Bio</label>
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Write a short bio about yourself..."
                    className="min-h-[80px] focus-visible:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Bio</p>
                  <p className="text-sm text-slate-600">
                    {profile?.bio || 'No bio yet.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Personal Information ────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-600" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Full Name</label>
              {editing ? (
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700">{profile?.full_name || '—'}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Display Name</label>
              {editing ? (
                <Input
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700">{profile?.display_name || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Email Address</label>
              <p className="text-sm text-slate-700 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {profile?.email || '—'}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Phone Number</label>
              {editing ? (
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.phone || 'Not provided'}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-slate-500">Address</label>
              {editing ? (
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Your address"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.address || 'Not provided'}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Date of Birth</label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {profile?.date_of_birth 
                    ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })
                    : 'Not provided'
                  }
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Gender</label>
              {editing ? (
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-sm text-slate-700 capitalize">
                  {profile?.gender || 'Not provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Professional Information ────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-600" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Update your professional details and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Department</label>
              {editing ? (
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Science, Mathematics"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.department || 'Not assigned'}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Job Title</label>
              {editing ? (
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Head Teacher, Class Teacher"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.title || 'Not specified'}
                </p>
              )}
            </div>

            {/* Qualification */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Qualification</label>
              {editing ? (
                <Input
                  value={formData.qualification || ''}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., B.Ed, M.Sc, Ph.D"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.qualification || 'Not specified'}
                </p>
              )}
            </div>

            {/* Years of Experience */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Years of Experience</label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.years_of_experience || ''}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || null })}
                  placeholder="e.g., 5"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.years_of_experience 
                    ? `${profile.years_of_experience} years`
                    : 'Not specified'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Social Links ────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-600" />
              Social Links
            </CardTitle>
            <CardDescription>
              Connect your professional social profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Website</label>
              {editing ? (
                <Input
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {profile?.website ? (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">LinkedIn</label>
              {editing ? (
                <Input
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {profile?.linkedin ? (
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.linkedin}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>

            {/* Twitter/X */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Twitter / X</label>
              {editing ? (
                <Input
                  value={formData.twitter || ''}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourhandle"
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {profile?.twitter ? (
                    <a 
                      href={profile.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.twitter}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4 px-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Your profile is visible to other staff members and pupils.</span>
            </div>
          </CardFooter>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 mt-6 border-t border-slate-200/50">
          <p>Vincollins Schools Staff • Profile Management</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>

      </div>
    </div>
  )
}