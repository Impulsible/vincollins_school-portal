/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  User, Mail, Phone, MapPin, Briefcase,
  Calendar, Loader2, Camera, Save,
  X, CheckCircle2, Pencil,
  Building, GraduationCap, Sparkles,
  Globe,
} from 'lucide-react'

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

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-bold text-slate-800 text-lg">Loading profile...</p>
        <p className="text-sm text-slate-500 mt-1">Fetching your details</p>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  icon: Icon,
}: {
  label: string
  children: React.ReactNode
  icon?: React.ElementType
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </label>
      {children}
    </div>
  )
}

function DisplayValue({ value, icon: Icon, link }: { value?: string | null, icon?: React.ElementType, link?: boolean }) {
  if (!value) return <p className="text-sm text-slate-400 italic">Not provided</p>
  if (link) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
        {value}
      </a>
    )
  }
  return (
    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
      <span className="break-words">{value}</span>
    </p>
  )
}

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
  const [formData, setFormData] = useState<Partial<StaffProfile>>({})

  const fetchProfile = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error) { toast.error('Failed to load profile'); return }
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
      toast.error('Failed to load profile')
    } finally { setLoading(false) }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && user?.id) fetchProfile()
  }, [authLoading, user?.id, fetchProfile])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${user.id}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file, { cacheControl: '3600', upsert: true })
      if (uploadError) { toast.error('Upload failed'); return }
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
      const { error: updateError } = await supabase.from('profiles').update({ photo_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (updateError) { toast.error('Update failed'); return }
      setProfile(prev => prev ? { ...prev, photo_url: publicUrl } : null)
      setFormData(prev => ({ ...prev, photo_url: publicUrl }))
      setAvatarError(false)
      await refreshUser()
      toast.success('Photo updated!')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = async () => {
    if (!user?.id) return
    try {
      const { error } = await supabase.from('profiles').update({ photo_url: null, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (error) { toast.error('Failed'); return }
      setProfile(prev => prev ? { ...prev, photo_url: null } : null)
      setFormData(prev => ({ ...prev, photo_url: null }))
      setAvatarError(false)
      await refreshUser()
      toast.success('Photo removed')
    } catch (error) { toast.error('Failed') }
  }

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
      Object.keys(updates).forEach(key => { if (updates[key] === undefined || updates[key] === null) delete updates[key] })
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) { toast.error('Failed to save'); return }
      setProfile(prev => ({ ...prev, ...formData } as StaffProfile))
      setEditing(false)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (error) {
      toast.error('Failed to save')
    } finally { setSaving(false) }
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData(profile || {})
  }

  const getInitials = (name: string) => {
    if (!name) return 'S'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const getRoleDisplay = (role?: string | null) => {
    if (role === 'admin') return 'Administrator'
    if (role === 'teacher' || role === 'staff') return 'Teacher'
    return 'Staff'
  }

  if (authLoading || loading) return <LoadingScreen />
  if (!user) { router.replace('/portal'); return null }

  const initials = getInitials(profile?.full_name || user?.full_name || 'Staff')
  const displayName = profile?.display_name || profile?.full_name || user?.full_name || 'Staff Member'
  const photoUrl = profile?.photo_url || undefined

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-20">

      {/* Sticky Header with Action Buttons */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">My Profile</h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-none truncate">
                  Manage your personal information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    className="h-10 sm:h-9 rounded-xl border-slate-200 px-3 sm:px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-10 sm:h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin sm:mr-1.5" /> : <Save className="h-4 w-4 sm:mr-1.5" />}
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  className="h-10 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 sm:px-4"
                >
                  <Pencil className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">

        {/* Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative h-28 sm:h-36 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
          </div>

          <div className="px-5 sm:px-8 pb-6 -mt-14 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0 self-center sm:self-end">
                <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white shadow-xl bg-white">
                  {photoUrl && !avatarError ? (
                    <AvatarImage src={photoUrl} alt={displayName} onError={() => setAvatarError(true)} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-3xl sm:text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  {photoUrl && !avatarError && (
                    <button
                      onClick={handleRemovePhoto}
                      className="p-2 bg-rose-500 rounded-full shadow-lg hover:bg-rose-600 transition-colors border-2 border-white"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white disabled:opacity-50"
                    title="Upload photo"
                  >
                    {uploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>
              </div>

              {/* Name & Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left sm:pb-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{displayName}</h2>
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                    {getRoleDisplay(profile?.role || user?.role)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{profile?.email || user?.email}</span>
                </p>
                {(profile?.department || profile?.title) && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    {profile?.department && (
                      <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px]">
                        <Building className="h-3 w-3 mr-1" />
                        {profile.department}
                      </Badge>
                    )}
                    {profile?.title && (
                      <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px]">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {profile.title}
                      </Badge>
                    )}
                  </div>
                )}
                {profile?.joined_at && (
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              {editing ? (
                <Field label="Bio" icon={User}>
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="min-h-[80px] text-base sm:text-sm rounded-xl focus-visible:ring-blue-500"
                  />
                </Field>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">About Me</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {profile?.bio || <span className="italic text-slate-400">No bio yet. Click edit to add one.</span>}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
              <p className="text-xs text-slate-500">Your personal details and contact</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Full Name" icon={User}>
              {editing ? (
                <Input
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.full_name} />
              )}
            </Field>

            <Field label="Display Name" icon={User}>
              {editing ? (
                <Input
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.display_name} />
              )}
            </Field>

            <Field label="Email" icon={Mail}>
              <DisplayValue value={profile?.email} icon={Mail} />
            </Field>

            <Field label="Phone Number" icon={Phone}>
              {editing ? (
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.phone} icon={Phone} />
              )}
            </Field>

            <div className="sm:col-span-2">
              <Field label="Address" icon={MapPin}>
                {editing ? (
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your address"
                    className="h-11 text-base sm:text-sm rounded-xl"
                  />
                ) : (
                  <DisplayValue value={profile?.address} icon={MapPin} />
                )}
              </Field>
            </div>

            <Field label="Date of Birth" icon={Calendar}>
              {editing ? (
                <Input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
              )}
            </Field>

            <Field label="Gender" icon={User}>
              {editing ? (
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-slate-700 capitalize">
                  {profile?.gender || <span className="italic text-slate-400">Not provided</span>}
                </p>
              )}
            </Field>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Briefcase className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Professional Details</h3>
              <p className="text-xs text-slate-500">Your qualifications and experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Department" icon={Building}>
              {editing ? (
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Science"
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.department} icon={Building} />
              )}
            </Field>

            <Field label="Job Title" icon={Briefcase}>
              {editing ? (
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Head Teacher"
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.title} icon={Briefcase} />
              )}
            </Field>

            <Field label="Qualification" icon={GraduationCap}>
              {editing ? (
                <Input
                  value={formData.qualification || ''}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., B.Ed, M.Sc"
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.qualification} icon={GraduationCap} />
              )}
            </Field>

            <Field label="Years of Experience" icon={Sparkles}>
              {editing ? (
                <Input
                  type="number"
                  value={formData.years_of_experience || ''}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || null })}
                  placeholder="e.g., 5"
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.years_of_experience ? `${profile.years_of_experience} years` : null} icon={Sparkles} />
              )}
            </Field>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Globe className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Social Links</h3>
              <p className="text-xs text-slate-500">Connect your profiles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <Field label="Website" icon={Globe}>
              {editing ? (
                <Input
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.website} link />
              )}
            </Field>

            <Field label="LinkedIn" icon={Globe}>
              {editing ? (
                <Input
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.linkedin} link />
              )}
            </Field>

            <Field label="Twitter / X" icon={Globe}>
              {editing ? (
                <Input
                  value={formData.twitter || ''}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/..."
                  className="h-11 text-base sm:text-sm rounded-xl"
                />
              ) : (
                <DisplayValue value={profile?.twitter} link />
              )}
            </Field>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-4 rounded-b-2xl">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Your profile is visible to other staff members and pupils.</span>
          </div>
        </div>

        {/* Sticky Save Bar on Mobile (when editing) */}
        {editing && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex items-center gap-2 sm:hidden shadow-lg">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200/60 mt-8">
          <p className="font-medium">Vincollins Schools Profile</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}