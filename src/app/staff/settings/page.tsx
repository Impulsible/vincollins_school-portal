/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  User, Mail, Phone, Globe, Bell,
  Shield, Key, Download, Trash2,
  Loader2, Save, CheckCircle2,
  AlertCircle, Eye, EyeOff,
  Clock, Calendar, Languages,
  Settings as SettingsIcon,
  FileText, Lock, LogOut
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
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

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StaffSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser, logout } = useUser()

  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ─── Form states ────────────────────────────────────────────────────────────

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

        // Load saved preferences from localStorage
        try {
          const savedNotifications = localStorage.getItem('staff_notifications')
          if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications))
          }

          const savedPreferences = localStorage.getItem('staff_preferences')
          if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences))
          }
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

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProfile()
    }
  }, [authLoading, user?.id, fetchProfile])

  // ─── Handle Profile Save ──────────────────────────────────────────────────

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
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      
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

  // ─── Handle Notifications Save ─────────────────────────────────────────────

  const handleNotificationsSave = () => {
    try {
      localStorage.setItem('staff_notifications', JSON.stringify(notifications))
      toast.success('Notification preferences saved!')
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast.error('Failed to save preferences')
    }
  }

  // ─── Handle Preferences Save ──────────────────────────────────────────────

  const handlePreferencesSave = () => {
    try {
      localStorage.setItem('staff_preferences', JSON.stringify(preferences))
      toast.success('Preferences saved!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    }
  }

  // ─── Handle Password Change ───────────────────────────────────────────────

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
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setSaving(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) {
        console.error('Error updating password:', updateError)
        toast.error('Failed to update password: ' + updateError.message)
        return
      }

      toast.success('Password updated successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  // ─── Handle Export Data ────────────────────────────────────────────────────

  const handleExportData = async () => {
    if (!user?.id) return

    try {
      toast.loading('Preparing your data export...')

      // Fetch user data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Fetch user's assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', user.id)

      // Fetch user's notes
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

      // Create download
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
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.dismiss()
      toast.error('Failed to export data')
    }
  }

  // ─── Handle Delete Account ─────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    if (!user?.id) return

    try {
      toast.loading('Deleting your account...')

      // Delete profile from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        console.error('Error deleting profile:', profileError)
        toast.dismiss()
        toast.error('Failed to delete account')
        return
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

      if (authError) {
        console.error('Error deleting auth user:', authError)
        toast.dismiss()
        toast.error('Failed to delete account')
        return
      }

      // Clear local storage and sign out
      localStorage.removeItem('staff_notifications')
      localStorage.removeItem('staff_preferences')
      await logout()

      toast.dismiss()
      toast.success('Your account has been deleted. We\'re sorry to see you go!')
      router.push('/portal')
    } catch (error) {
      console.error('Error:', error)
      toast.dismiss()
      toast.error('Failed to delete account')
    }
  }

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  const displayName = profile?.display_name || profile?.full_name || user?.full_name || 'Staff Member'

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-slate-600" />
                Settings
              </h1>
              <p className="text-sm text-slate-500">
                Manage your account preferences and settings
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5 text-sm">
              {displayName}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Profile Settings ────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <SectionHeader
              icon={User}
              title="Profile Settings"
              description="Update your personal information"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs text-slate-500">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display_name" className="text-xs text-slate-500">
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                  placeholder="How you want to be displayed"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Email</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-slate-500">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs text-slate-500">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Write a short bio about yourself..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4">
            <Button
              onClick={handleProfileSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* ── Notification Preferences ────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <SectionHeader
              icon={Bell}
              title="Notification Preferences"
              description="Choose how you want to receive notifications"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-slate-500">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Assignment Alerts
                  </Label>
                  <p className="text-xs text-slate-500">
                    Get notified when assignments are created or updated
                  </p>
                </div>
                <Switch
                  checked={notifications.assignmentAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, assignmentAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Grade Alerts
                  </Label>
                  <p className="text-xs text-slate-500">
                    Get notified when grades are published
                  </p>
                </div>
                <Switch
                  checked={notifications.gradeAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, gradeAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Announcement Alerts
                  </Label>
                  <p className="text-xs text-slate-500">
                    Get notified about school announcements
                  </p>
                </div>
                <Switch
                  checked={notifications.announcementAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, announcementAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Weekly Digest
                  </Label>
                  <p className="text-xs text-slate-500">
                    Receive a weekly summary of your activities
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyDigest: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4">
            <Button
              onClick={handleNotificationsSave}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <SectionHeader
              icon={Globe}
              title="Preferences"
              description="Customize your app experience"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
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
                <Label className="text-xs text-slate-500">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
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

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Date Format</Label>
                <Select
                  value={preferences.dateFormat}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, dateFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4">
            <Button
              onClick={handlePreferencesSave}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* ── Account Security ────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-amber-400">
          <CardHeader>
            <SectionHeader
              icon={Shield}
              title="Account Security"
              description="Update your password and secure your account"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4">
            <Button
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Update Password
            </Button>
          </CardFooter>
        </Card>

        {/* ── Data & Privacy ───────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-rose-400">
          <CardHeader>
            <SectionHeader
              icon={Lock}
              title="Data & Privacy"
              description="Manage your data and account privacy"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Download className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Export Your Data</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Download a copy of all your data in JSON format.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Delete Account</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Permanently delete your account and all data.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="mt-2"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Settings • Geared Towards Excellence</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ── Delete Account Dialog ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-rose-600" />
              </div>
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This action is <strong>permanent</strong> and cannot be undone. 
              All your data, including assignments, notes, and profile information, 
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}