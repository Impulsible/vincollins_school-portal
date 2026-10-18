/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  User, Mail, Bell, Shield, Key, Download, Trash2,
  Loader2, Save, Eye, EyeOff, Globe, Lock,
  Settings as SettingsIcon, X,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffProfile {
  id: string
  full_name: string
  display_name?: string | null
  email: string
  phone?: string | null
  bio?: string | null
  role?: string | null
}

interface NotificationSettings {
  emailNotifications: boolean
  assignmentAlerts: boolean
  gradeAlerts: boolean
  announcementAlerts: boolean
  weeklyDigest: boolean
}

interface PreferenceSettings {
  language: string
  timezone: string
  dateFormat: string
}

const hideScrollbar =
  '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50 px-4">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading settings...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your preferences</p>
      </div>
    </div>
  )
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  footer,
  accent,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
  accent?: string
}) {
  return (
    <section
      className={cn(
        'bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden',
        accent
      )}
    >
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-slate-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
      {footer && (
        <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50/40">
          {footer}
        </div>
      )}
    </section>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StaffSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser, logout } = useUser()

  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    display_name: '',
    phone: '',
    bio: '',
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    assignmentAlerts: true,
    gradeAlerts: true,
    announcementAlerts: true,
    weeklyDigest: false,
  })

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    language: 'en',
    timezone: 'Africa/Lagos',
    dateFormat: 'MM/DD/YYYY',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, email, phone, bio, role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
        return
      }

      if (data) {
        setProfile(data)
        setProfileForm({
          full_name: data.full_name || '',
          display_name: data.display_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
        })

        try {
          const savedNotifications = localStorage.getItem('staff_notifications')
          if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
          const savedPreferences = localStorage.getItem('staff_preferences')
          if (savedPreferences) setPreferences(JSON.parse(savedPreferences))
        } catch (e) {
          console.warn('Error loading saved preferences:', e)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && user?.id) fetchProfile()
  }, [authLoading, user?.id, fetchProfile])

  useEffect(() => {
    if (deleteDialogOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [deleteDialogOpen])

  const handleProfileSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const updates = {
        full_name: profileForm.full_name,
        display_name: profileForm.display_name || null,
        phone: profileForm.phone || null,
        bio: profileForm.bio || null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) {
        toast.error('Failed to save changes')
        return
      }
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      await refreshUser()
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationsSave = () => {
    try {
      localStorage.setItem('staff_notifications', JSON.stringify(notifications))
      toast.success('Notification preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    }
  }

  const handlePreferencesSave = () => {
    try {
      localStorage.setItem('staff_preferences', JSON.stringify(preferences))
      toast.success('Preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    }
  }

  const handlePasswordChange = async () => {
    if (!user?.email) {
      toast.error('No email found for this account')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      })
      if (signInError) {
        toast.error('Current password is incorrect')
        setSaving(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })
      if (updateError) {
        toast.error('Failed to update password: ' + updateError.message)
        return
      }

      toast.success('Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      toast.error('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    if (!user?.id) return
    try {
      toast.loading('Preparing your data export...')
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', user.id)
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('teacher_id', user.id)

      const exportData = {
        profile: profileData,
        assignments: assignments || [],
        notes: notes || [],
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vincollins-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('Data exported successfully!')
    } catch {
      toast.dismiss()
      toast.error('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return
    setDeleting(true)
    try {
      toast.loading('Deleting your account...')
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      if (profileError) {
        toast.dismiss()
        toast.error('Failed to delete account')
        return
      }

      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) {
        toast.dismiss()
        toast.error('Failed to delete account')
        return
      }

      localStorage.removeItem('staff_notifications')
      localStorage.removeItem('staff_preferences')
      await logout()
      toast.dismiss()
      toast.success("Your account has been deleted. We're sorry to see you go!")
      router.push('/portal')
    } catch {
      toast.dismiss()
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (authLoading || loading) return <LoadingScreen />

  if (!user) {
    router.replace('/portal')
    return null
  }

  const displayName =
    profile?.display_name || profile?.full_name || user?.full_name || 'Staff Member'

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-24 lg:pb-8">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[73px]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-sm shrink-0">
                <SettingsIcon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">Settings</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none truncate">
                  Account & preferences
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0 px-2.5 py-1 text-xs font-semibold truncate max-w-[140px]">
              {displayName}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4 sm:space-y-5">
        {/* Profile */}
        <SettingsSection
          icon={User}
          title="Profile Settings"
          description="Update your personal information"
          footer={
            <Button
              onClick={handleProfileSave}
              disabled={saving}
              className="w-full sm:w-auto h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Your full name"
                className="h-11 sm:h-10 text-base sm:text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Display Name
              </Label>
              <Input
                value={profileForm.display_name}
                onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                placeholder="How you want to be shown"
                className="h-11 sm:h-10 text-base sm:text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email
              </Label>
              <div className="flex items-center gap-2 h-11 sm:h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <p className="text-[11px] text-slate-400">Contact support to change email.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phone
              </Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="h-11 sm:h-10 text-base sm:text-sm rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio</Label>
            <Textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Write a short bio about yourself..."
              className="min-h-[88px] text-base sm:text-sm rounded-xl resize-none"
            />
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Choose how you receive updates"
          footer={
            <Button
              onClick={handleNotificationsSave}
              className="w-full sm:w-auto h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 space-y-0">
            <div className="pb-3">
              <ToggleRow
                label="Email Notifications"
                description="Receive email for important updates"
                checked={notifications.emailNotifications}
                onCheckedChange={(v) =>
                  setNotifications({ ...notifications, emailNotifications: v })
                }
              />
            </div>
            <div className="py-3">
              <ToggleRow
                label="Assignment Alerts"
                description="When assignments are created or updated"
                checked={notifications.assignmentAlerts}
                onCheckedChange={(v) =>
                  setNotifications({ ...notifications, assignmentAlerts: v })
                }
              />
            </div>
            <div className="py-3">
              <ToggleRow
                label="Grade Alerts"
                description="When grades are published"
                checked={notifications.gradeAlerts}
                onCheckedChange={(v) => setNotifications({ ...notifications, gradeAlerts: v })}
              />
            </div>
            <div className="py-3">
              <ToggleRow
                label="Announcement Alerts"
                description="School announcements and notices"
                checked={notifications.announcementAlerts}
                onCheckedChange={(v) =>
                  setNotifications({ ...notifications, announcementAlerts: v })
                }
              />
            </div>
            <div className="pt-3">
              <ToggleRow
                label="Weekly Digest"
                description="A weekly summary of your activity"
                checked={notifications.weeklyDigest}
                onCheckedChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection
          icon={Globe}
          title="Preferences"
          description="Customize your app experience"
          footer={
            <Button
              onClick={handlePreferencesSave}
              className="w-full sm:w-auto h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Language
              </Label>
              <Select
                value={preferences.language}
                onValueChange={(v) => setPreferences({ ...preferences, language: v })}
              >
                <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="yo">Yoruba</SelectItem>
                  <SelectItem value="ha">Hausa</SelectItem>
                  <SelectItem value="ig">Igbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Timezone
              </Label>
              <Select
                value={preferences.timezone}
                onValueChange={(v) => setPreferences({ ...preferences, timezone: v })}
              >
                <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Lagos">Lagos (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Abuja">Abuja (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Cairo">Cairo (UTC+2)</SelectItem>
                  <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date Format
              </Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(v) => setPreferences({ ...preferences, dateFormat: v })}
              >
                <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection
          icon={Shield}
          title="Account Security"
          description="Update your password"
          accent="border-l-4 border-l-amber-400"
          footer={
            <Button
              onClick={handlePasswordChange}
              disabled={saving}
              className="w-full sm:w-auto h-11 sm:h-10 bg-amber-600 hover:bg-amber-700 text-white gap-2 rounded-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              Update Password
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="h-11 sm:h-10 text-base sm:text-sm rounded-xl pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                New Password
              </Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Min 6 characters"
                className="h-11 sm:h-10 text-base sm:text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  className="h-11 sm:h-10 text-base sm:text-sm rounded-xl pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Data & Privacy */}
        <SettingsSection
          icon={Lock}
          title="Data & Privacy"
          description="Export or delete your account data"
          accent="border-l-4 border-l-rose-400"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-700">Export Your Data</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Download a JSON copy of your profile, assignments, and notes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="mt-3 h-9 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-700">Delete Account</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Permanently remove your account and all associated data.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="mt-3 h-9 rounded-xl gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Settings · Geared Towards Excellence</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.
          </p>
        </div>
      </div>

      {/* Delete Account Sheet */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex flex-col items-center pt-3 sm:pt-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3 sm:hidden" />
              <div className="w-full flex items-center justify-between px-5 pb-3 sm:pt-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </div>
                  Delete Account?
                </h2>
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                This action is <strong className="text-slate-800">permanent</strong> and cannot be
                undone. All your data — assignments, notes, and profile — will be permanently
                deleted.
              </p>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-md shadow-rose-500/20"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}