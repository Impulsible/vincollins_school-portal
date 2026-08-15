/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  IdCard,
  School,
  Save,
  Loader2,
  Edit2,
  Camera,
  UserCheck,
  Award,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PupilProfile {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  class?: string
  class_arm?: string
  phone?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  admission_number?: string
  admission_year?: number
  created_at: string
}

export default function PupilProfilePage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<PupilProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<Partial<PupilProfile>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return

    const fetchProfile = async () => {
      try {
        setLoading(true)
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          toast.error('Failed to load profile')
          return
        }

        if (profileData) {
          setProfile(profileData as PupilProfile)
          setFormData(profileData as PupilProfile)
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  // ─── Handle photo upload ────────────────────────────────────────────────────
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile?.id) {
      toast.error('No file selected')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploading(true)

    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      console.log('📤 Uploading file:', filePath)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Failed to upload image: ' + uploadError.message)
        setIsUploading(false)
        return
      }

      console.log('✅ Upload successful')

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      console.log('📸 Public URL:', publicUrl)

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Update error:', updateError)
        toast.error('Failed to update profile photo')
        setIsUploading(false)
        return
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, photo_url: publicUrl } : null)
      setFormData(prev => ({ ...prev, photo_url: publicUrl }))

      toast.success('Profile photo updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ─── Handle remove photo ────────────────────────────────────────────────────
  const handleRemovePhoto = async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          photo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error removing photo:', error)
        toast.error('Failed to remove photo')
        return
      }

      setProfile(prev => prev ? { ...prev, photo_url: undefined } : null)
      setFormData(prev => ({ ...prev, photo_url: undefined }))
      toast.success('Profile photo removed')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove photo')
    }
  }

  // ─── Handle save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          phone: formData.phone,
          address: formData.address,
          guardian_name: formData.guardian_name,
          guardian_phone: formData.guardian_phone,
          guardian_email: formData.guardian_email,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to save changes')
        return
      }

      setProfile(prev => ({ ...prev, ...formData } as PupilProfile))
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // ─── Get initials ──────────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return 'P'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0]?.toUpperCase() || 'P'
  }

  // ─── Get role colors ──────────────────────────────────────────────────────
  const roleColors = {
    primary: '#059669',
    light: '#ECFDF5',
    dark: '#047857',
  }

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  // ✅ FIX: Check for both 'student' and 'pupil' roles
  if (!user || (user.role !== 'student' && user.role !== 'pupil')) {
    router.replace('/portal')
    return null
  }

  const displayName = profile?.display_name || profile?.full_name || 'Pupil'
  const initials = getInitials(displayName)
  const fullName = profile?.full_name || displayName
  const photoUrl = profile?.photo_url

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">My Profile</h1>
          <p className="text-sm text-slate-500">View and manage your personal information</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(profile || {})
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#0A2472] hover:bg-[#1A3A8A]"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* ─── Profile Card ──────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div 
          className="relative h-24 bg-gradient-to-r"
          style={{ background: `linear-gradient(135deg, ${roleColors.primary}, ${roleColors.dark})` }}
        >
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={photoUrl} />
                <AvatarFallback 
                  className="text-3xl font-bold text-white"
                  style={{ backgroundColor: roleColors.primary }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* ─── Upload Button ────────────────────────────────────────── */}
              <div className="absolute bottom-0 right-0 flex gap-1">
                {photoUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-red-500 rounded-full shadow-md hover:bg-red-600 transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                  title="Upload photo"
                >
                  {isUploading ? (
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

        <CardContent className="pt-16 pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-display text-[#0A2472]">{fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  className="text-xs"
                  style={{ backgroundColor: roleColors.light, color: roleColors.primary }}
                >
                  {profile?.class || 'Not Assigned'}
                  {profile?.class_arm ? ` - ${profile.class_arm}` : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {profile?.vin_id}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-2">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                <UserCheck className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Badge variant="outline" className="text-xs">
                Joined {profile?.admission_year || new Date().getFullYear()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Quick Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{profile?.class || 'N/A'}</p>
                <p className="text-xs text-slate-500">Class</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <IdCard className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono">{profile?.vin_id || 'N/A'}</p>
                <p className="text-xs text-slate-500">VIN ID</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{profile?.admission_year || 'N/A'}</p>
                <p className="text-xs text-slate-500">Admission Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Personal Information ──────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-500">Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1">{profile?.full_name || '-'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500">Display Name</Label>
              {isEditing ? (
                <Input
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1">{profile?.display_name || '-'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500">Email</Label>
              <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {profile?.email || '-'}
              </p>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Phone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {profile?.phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-500">Date of Birth</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500">Gender</Label>
              {isEditing ? (
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1 capitalize">{profile?.gender || 'Not provided'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500">Address</Label>
              {isEditing ? (
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  placeholder="Enter address"
                />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {profile?.address || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── School Information ────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <School className="w-5 h-5" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-xs text-slate-500">VIN ID</Label>
            <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2 font-mono">
              <IdCard className="w-4 h-4 text-slate-400" />
              {profile?.vin_id || '-'}
            </p>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Admission Number</Label>
            <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
              <School className="w-4 h-4 text-slate-400" />
              {profile?.admission_number || 'Not assigned'}
            </p>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Class</Label>
            <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              {profile?.class || 'Not assigned'}
              {profile?.class_arm ? ` - ${profile.class_arm}` : ''}
            </p>
          </div>

          <div>
            <Label className="text-xs text-slate-500">Admission Year</Label>
            <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              {profile?.admission_year || 'Not assigned'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Guardian Information ──────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <User className="w-5 h-5" />
            Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-xs text-slate-500">Guardian Name</Label>
            {isEditing ? (
              <Input
                value={formData.guardian_name || ''}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="mt-1"
                placeholder="Enter guardian name"
              />
            ) : (
              <p className="text-sm font-medium text-slate-800 mt-1">{profile?.guardian_name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <Label className="text-xs text-slate-500">Guardian Phone</Label>
            {isEditing ? (
              <Input
                value={formData.guardian_phone || ''}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="mt-1"
                placeholder="Enter guardian phone"
              />
            ) : (
              <p className="text-sm font-medium text-slate-800 mt-1">{profile?.guardian_phone || 'Not provided'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs text-slate-500">Guardian Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.guardian_email || ''}
                onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                className="mt-1"
                placeholder="Enter guardian email"
              />
            ) : (
              <p className="text-sm font-medium text-slate-800 mt-1">{profile?.guardian_email || 'Not provided'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}