/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Loader2, Settings, User, Shield, Bell, Palette, Database,
  Save, Camera, Key, Mail, Phone, MapPin, School,
  Globe, Lock, Eye, EyeOff, LogOut, Trash2,
  CheckCircle2, AlertTriangle, ChevronRight, Calendar,
  Wifi, HardDrive, RefreshCw, Info, GraduationCap,
  ArrowRight, Clock, Zap, Plus, Edit, CalendarDays,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  photo_url?: string
  role: string
}

interface SchoolSettings {
  school_name: string
  school_motto: string
  school_address: string
  school_phone: string
  school_email: string
  current_term: string
  current_session: string
  portal_name: string
}

interface Term {
  id: string
  term_code: string
  session_year: string
  is_current: boolean
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

// ── Reusable section heading ───────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  description,
}: {
  icon: React.ElementType
  iconClass: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', iconClass)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ── Toggle row ─────────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-slate-300"
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  )
}

// ── Password input ─────────────────────────────────────────────────────────────
function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm pr-9 border-slate-200 focus-visible:ring-violet-500"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

// ── Term Status Badge ──────────────────────────────────────────────────────────
function TermStatusBadge({ term, currentTerm }: { term: string; currentTerm: string }) {
  const isCurrent = term === currentTerm
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
      isCurrent ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
    )}>
      {isCurrent ? <Zap className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
      {term}
      {isCurrent && ' (current)'}
    </span>
  )
}

// ── Term Edit Dialog ──────────────────────────────────────────────────────────
function TermEditDialog({
  term,
  isOpen,
  onClose,
  onSave,
}: {
  term: Term | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Term>) => Promise<void>
}) {
  const [formData, setFormData] = useState<Partial<Term>>({
    term_code: '',
    session_year: '',
    start_date: '',
    end_date: '',
    is_current: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (term) {
      setFormData({
        term_code: term.term_code,
        session_year: term.session_year,
        start_date: term.start_date,
        end_date: term.end_date,
        is_current: term.is_current,
      })
    } else {
      setFormData({
        term_code: '',
        session_year: '',
        start_date: '',
        end_date: '',
        is_current: false,
      })
    }
  }, [term])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!formData.term_code || !formData.session_year || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error: any) {
      console.error('Error saving term:', error)
      // Error toast will be shown by parent
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {term ? 'Edit Term' : 'Add New Term'}
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Term Code *</Label>
            <Input
              value={formData.term_code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, term_code: e.target.value }))}
              placeholder="e.g., First, Second, Third"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Session Year *</Label>
            <Input
              value={formData.session_year || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, session_year: e.target.value }))}
              placeholder="e.g., 2026/2027"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">End Date *</Label>
              <Input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={formData.is_current || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_current: checked }))}
            />
            <Label className="text-sm font-medium text-slate-700">Set as Current Term</Label>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {term ? 'Update' : 'Add'} Term
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Switch Component ──────────────────────────────────────────────────────────
function Switch({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        checked ? "bg-blue-600" : "bg-slate-300",
        className
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [isAdmin, setIsAdmin] = useState(false)

  // Profile form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Password form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // School settings
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    school_name: '',
    school_motto: '',
    school_address: '',
    school_phone: '',
    school_email: '',
    current_term: '',
    current_session: '',
    portal_name: '',
  })
  const [schoolLoaded, setSchoolLoaded] = useState(false)

  // ─── Terms Management ────────────────────────────────────────────────────────
  const [terms, setTerms] = useState<Term[]>([])
  const [termsLoading, setTermsLoading] = useState(true)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [termDialogOpen, setTermDialogOpen] = useState(false)

  // Current term from school_settings
  const [currentTerm, setCurrentTerm] = useState('')
  const [currentSession, setCurrentSession] = useState('')

  // Next-term date
  const [nextTermDate, setNextTermDate] = useState('')
  const [savingNextTerm, setSavingNextTerm] = useState(false)

  // Notification prefs
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [examAlerts, setExamAlerts] = useState(true)
  const [reportCardAlerts, setReportCardAlerts] = useState(true)
  const [studentRegistrationAlerts, setStudentRegistrationAlerts] = useState(true)

  // Appearance
  const [compactMode, setCompactMode] = useState(false)
  const [showAnimations, setShowAnimations] = useState(true)

  // DB status
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)

  // ─── Fetch Terms ────────────────────────────────────────────────────────────
  const fetchTerms = async () => {
    try {
      setTermsLoading(true)
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching terms:', error)
        toast.error('Failed to load terms')
        return
      }

      setTerms(data || [])
      
      // Find current term
      const current = data?.find(t => t.is_current === true)
      if (current) {
        setCurrentTerm(current.term_code)
        setCurrentSession(current.session_year)
      }
    } catch (error) {
      console.error('Error fetching terms:', error)
      toast.error('Failed to load terms')
    } finally {
      setTermsLoading(false)
    }
  }

  // ─── Save Term ──────────────────────────────────────────────────────────────
  const handleSaveTerm = async (formData: Partial<Term>) => {
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formData.term_code || !formData.session_year || !formData.start_date || !formData.end_date) {
        toast.error('Please fill in all required fields')
        setSaving(false)
        return
      }

      let result
      if (editingTerm) {
        // Update existing term
        result = await supabase
          .from('terms')
          .update({
            term_code: formData.term_code,
            session_year: formData.session_year,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_current: formData.is_current || false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTerm.id)
          .select()
      } else {
        // Insert new term
        result = await supabase
          .from('terms')
          .insert({
            term_code: formData.term_code,
            session_year: formData.session_year,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_current: formData.is_current || false,
          })
          .select()
      }

      // Check for errors
      if (result.error) {
        console.error('Supabase error:', result.error)
        
        if (result.error.code === '42501') {
          toast.error('Permission denied. Only admins can manage terms.')
          return
        }
        if (result.error.code === '23505') {
          toast.error('A term with this code and session already exists.')
          return
        }
        toast.error(`Failed to save term: ${result.error.message}`)
        return
      }

      // If this term is set as current, update school_settings
      if (formData.is_current) {
        // First, get the school_settings id
        const { data: settingsData, error: settingsIdError } = await supabase
          .from('school_settings')
          .select('id')
          .limit(1)
          .single()

        if (settingsIdError) {
          console.error('Error fetching school_settings id:', settingsIdError)
          // If no school_settings exists, create one
          const { error: createError } = await supabase
            .from('school_settings')
            .insert({
              current_term: formData.term_code,
              current_session: formData.session_year,
            })
          
          if (createError) {
            console.error('Error creating school_settings:', createError)
            toast.warning('Term saved but failed to update current term settings.')
          }
        } else if (settingsData) {
          const { error: settingsError } = await supabase
            .from('school_settings')
            .update({
              current_term: formData.term_code,
              current_session: formData.session_year,
              updated_at: new Date().toISOString(),
            })
            .eq('id', settingsData.id)

          if (settingsError) {
            console.error('Error updating school settings:', settingsError)
            toast.warning('Term saved but failed to update current term settings.')
          }
        }
      }

      toast.success(editingTerm ? 'Term updated successfully!' : 'Term added successfully!')
      await fetchTerms()
      setTermDialogOpen(false)
      setEditingTerm(null)
    } catch (error: any) {
      console.error('Error saving term:', error)
      // Show a more helpful error message
      if (error?.message) {
        toast.error(`Error: ${error.message}`)
      } else if (error?.code) {
        toast.error(`Error code: ${error.code}`)
      } else {
        toast.error('An unexpected error occurred while saving the term.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete Term ─────────────────────────────────────────────────────────────
  const handleDeleteTerm = async (termId: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return

    try {
      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', termId)

      if (error) {
        console.error('Error deleting term:', error)
        if (error.code === '42501') {
          toast.error('Permission denied. Only admins can delete terms.')
          return
        }
        toast.error('Failed to delete term')
        return
      }

      toast.success('Term deleted successfully!')
      await fetchTerms()
    } catch (error) {
      console.error('Error deleting term:', error)
      toast.error('Failed to delete term')
    }
  }

  // ─── Initialise ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Check if user is admin
        if (user?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else if (profileData) {
            setProfile(profileData)
            setFullName(profileData.full_name || '')
            setEmail(profileData.email || '')
            setPhone(profileData.phone || '')
            setAddress(profileData.address || '')
            setIsAdmin(profileData.role === 'admin')
          }
        }

        // 2. Fetch terms
        await fetchTerms()

        // 3. School settings from system_settings table
        const { data: sysRows, error: sysErr } = await supabase
          .from('system_settings')
          .select('key, value')

        if (!sysErr && sysRows) {
          const map: Record<string, string> = {}
          sysRows.forEach((r: { key: string; value: string }) => { map[r.key] = r.value })

          setSchoolSettings({
            school_name: map['school_name'] || 'Vincollins College',
            school_motto: map['school_motto'] || 'Geared Towards Excellence',
            school_address: map['school_address'] || '7/9 Lawani Street, off Ishaga Rd, Surulere, Lagos',
            school_phone: map['school_phone'] || '+234 912 1155 554',
            school_email: map['school_email'] || 'vincollinscollege@gmail.com',
            current_term: map['current_term'] || currentTerm || 'First',
            current_session: map['current_session'] || currentSession || '2026/2027',
            portal_name: map['portal_name'] || 'Vincollins Portal',
          })

          if (map['next_term_date']) {
            setNextTermDate(map['next_term_date'])
          } else {
            const d = new Date()
            d.setMonth(d.getMonth() + 3)
            setNextTermDate(d.toISOString().split('T')[0])
          }

          setDbConnected(true)
        } else {
          setDbConnected(false)
        }

        setSchoolLoaded(true)

        // 4. localStorage prefs
        try {
          const stored = localStorage.getItem('admin-notification-prefs')
          if (stored) {
            const p = JSON.parse(stored)
            setEmailNotifications(p.emailNotifications ?? true)
            setExamAlerts(p.examAlerts ?? true)
            setReportCardAlerts(p.reportCardAlerts ?? true)
            setStudentRegistrationAlerts(p.studentRegistrationAlerts ?? true)
          }
          const compact = localStorage.getItem('admin-compact-mode')
          if (compact) setCompactMode(compact === 'true')
        } catch { /* ignore */ }

      } catch (err) {
        console.error('Settings init error:', err)
        setDbConnected(false)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [user])

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d: string) => {
    if (!d) return 'Not set'
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const upsertSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) {
      console.error('Error upserting setting:', error)
      throw error
    }
  }

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, address, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      if (error) throw error
      setProfile(p => p ? { ...p, full_name: fullName, phone, address } : p)
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password changed successfully')
      setNewPassword(''); setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const handleSaveSchoolSettings = async () => {
    setSaving(true)
    try {
      const entries = Object.entries(schoolSettings) as [string, string][]
      await Promise.all(entries.map(([k, v]) => upsertSetting(k, v)))
      
      // Also update school_settings table if term/session changed
      if (schoolSettings.current_term || schoolSettings.current_session) {
        const { data: settingsData } = await supabase
          .from('school_settings')
          .select('id')
          .limit(1)
          .single()

        if (settingsData) {
          await supabase
            .from('school_settings')
            .update({
              current_term: schoolSettings.current_term.toLowerCase().replace(' term', ''),
              current_session: schoolSettings.current_session,
              updated_at: new Date().toISOString()
            })
            .eq('id', settingsData.id)
        }
      }
      
      toast.success('School settings saved to database')
      await fetchTerms()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save school settings')
    } finally { setSaving(false) }
  }

  const handleSaveNextTermDate = async () => {
    if (!nextTermDate) { toast.error('Please select a date'); return }
    setSavingNextTerm(true)
    try {
      await upsertSetting('next_term_date', nextTermDate)
      toast.success('Next term date saved — will appear on all report cards')
      window.dispatchEvent(new CustomEvent('next-term-date-updated', { detail: { date: nextTermDate } }))
    } catch (err: any) {
      toast.error(err.message || 'Failed to save next term date')
    } finally { setSavingNextTerm(false) }
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('admin-notification-prefs', JSON.stringify({
      emailNotifications, examAlerts, reportCardAlerts, studentRegistrationAlerts,
    }))
    toast.success('Notification preferences saved')
  }

  const handleSaveAppearance = () => {
    localStorage.setItem('admin-compact-mode', String(compactMode))
    toast.success('Appearance settings saved — reload to apply fully')
  }

  // ─── Password strength ──────────────────────────────────────────────────────
  const passwordStrength = (() => {
    const l = newPassword.length
    if (l === 0) return null
    if (l < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' }
    if (l < 10) return { label: 'Fair', color: 'bg-amber-400', width: '50%' }
    if (l < 14) return { label: 'Good', color: 'bg-blue-400', width: '75%' }
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
  })()

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Loading settings…</p>
          <p className="text-xs text-slate-400 mt-0.5">Fetching your configuration…</p>
        </div>
      </div>
    )
  }

  // ─── Initials helper ────────────────────────────────────────────────────────
  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your profile, school configuration, and term setup
              {currentTerm && (
                <span className="ml-2 text-emerald-600 text-xs font-medium">
                  (Current term: {currentTerm.charAt(0).toUpperCase() + currentTerm.slice(1)} • {currentSession})
                </span>
              )}
            </p>
          </div>
          <div className={cn(
            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
            dbConnected === true
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : dbConnected === false
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
          )}>
            <Wifi className="h-3 w-3" />
            {dbConnected === true ? 'DB Connected' : dbConnected === false ? 'DB Offline' : 'Checking…'}
          </div>
        </div>

        {/* Admin status banner */}
        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Limited Access</p>
              <p className="text-xs text-amber-700">You have read-only access. Some settings require admin privileges.</p>
            </div>
          </div>
        )}

        {/* Current term banner */}
        {currentTerm && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Current Term: <span className="capitalize">{currentTerm}</span>
                </p>
                <p className="text-xs text-emerald-600">
                  Session: {currentSession}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-200 text-emerald-700 border-0 text-xs font-medium px-3 py-1">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Live
            </Badge>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-sm">
            <TabsList className="w-full grid grid-cols-5 bg-transparent gap-1 h-auto">
              {[
                { value: 'profile', label: 'Profile', icon: User },
                { value: 'password', label: 'Password', icon: Key },
                { value: 'school', label: 'School', icon: School },
                { value: 'terms', label: 'Terms', icon: Calendar },
                { value: 'preferences', label: 'Preferences', icon: Bell },
              ].map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.value
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium transition-all h-auto',
                      'data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm',
                      'data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-[9px]">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* ── Profile ─────────────────────────────────────────────────────── */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                {/* Avatar row */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                  <div className="relative shrink-0">
                    <Avatar className="h-16 w-16 ring-2 ring-white shadow-md">
                      <AvatarImage src={profile?.photo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{profile?.full_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-semibold border border-violet-200">
                        <Shield className="h-2.5 w-2.5" /> Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <SectionHeader
                  icon={User}
                  iconClass="bg-violet-100 text-violet-600"
                  title="Personal Information"
                  description="Update your name and contact details"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus-visible:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                    <div className="relative">
                      <Input
                        value={email}
                        disabled
                        className="h-9 text-sm bg-slate-50 border-slate-200 text-slate-400 pr-8"
                      />
                      <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Info className="h-3 w-3" /> Email cannot be changed here
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234 XXX XXX XXXX"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Address</Label>
                    <Input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Your address"
                      className="h-9 text-sm border-slate-200 focus-visible:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm h-8 text-xs px-4"
                  >
                    {saving
                      ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      : <Save className="h-3.5 w-3.5 mr-1.5" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Password ─────────────────────────────────────────────────────── */}
          <TabsContent value="password" className="mt-4">
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <SectionHeader
                  icon={Key}
                  iconClass="bg-amber-100 text-amber-600"
                  title="Change Password"
                  description="Update your account password — use a strong, unique password"
                />

                <div className="max-w-sm space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">New Password</Label>
                    <PasswordInput
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="Min. 6 characters"
                      show={showNewPassword}
                      onToggle={() => setShowNewPassword(v => !v)}
                    />
                    {passwordStrength && (
                      <div className="mt-1.5 space-y-1">
                        <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-300', passwordStrength.color)}
                            style={{ width: passwordStrength.width }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">{passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Confirm Password</Label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Re-enter new password"
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(v => !v)}
                    />
                    <AnimatePresence>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-[11px] text-red-500 flex items-center gap-1 mt-1"
                        >
                          <AlertTriangle className="h-3 w-3" /> Passwords do not match
                        </motion.p>
                      )}
                      {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Passwords match
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={saving || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm h-8 text-xs px-4"
                    >
                      {saving
                        ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        : <Lock className="h-3.5 w-3.5 mr-1.5" />}
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-1">Security tips</p>
                  <ul className="space-y-0.5">
                    {[
                      'Use at least 8 characters',
                      'Mix uppercase, lowercase, numbers and symbols',
                      'Avoid reusing old passwords',
                    ].map(tip => (
                      <li key={tip} className="text-[11px] text-amber-600 flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── School ───────────────────────────────────────────────────────── */}
          <TabsContent value="school" className="mt-4">
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <SectionHeader
                  icon={School}
                  iconClass="bg-emerald-100 text-emerald-600"
                  title="School Information"
                  description="Manage school details — saved directly to the database"
                />

                {!schoolLoaded && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading from database…
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'School Name', key: 'school_name' as const, placeholder: 'e.g. Vincollins College' },
                    { label: 'School Motto', key: 'school_motto' as const, placeholder: 'e.g. Geared Towards Excellence' },
                    { label: 'Portal Name', key: 'portal_name' as const, placeholder: 'e.g. Vincollins Portal' },
                    { label: 'School Email', key: 'school_email' as const, placeholder: 'info@school.edu' },
                    { label: 'School Phone', key: 'school_phone' as const, placeholder: '+234 XXX XXX XXXX' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">{field.label}</Label>
                      <Input
                        value={schoolSettings[field.key]}
                        onChange={e => setSchoolSettings(s => ({ ...s, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="h-9 text-sm border-slate-200 focus-visible:ring-emerald-500"
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">School Address</Label>
                    <Input
                      value={schoolSettings.school_address}
                      onChange={e => setSchoolSettings(s => ({ ...s, school_address: e.target.value }))}
                      className="text-sm border-slate-200 focus-visible:ring-emerald-500 h-auto min-h-[60px] py-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Current Term</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={schoolSettings.current_term}
                        onChange={e => setSchoolSettings(s => ({ ...s, current_term: e.target.value }))}
                        className="h-9 text-sm border-slate-200 focus-visible:ring-emerald-500 flex-1"
                      />
                      <TermStatusBadge 
                        term={schoolSettings.current_term} 
                        currentTerm={currentTerm.charAt(0).toUpperCase() + currentTerm.slice(1)} 
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Info className="h-3 w-3" /> Changing this updates the system's current term
                    </p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Current Session</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={schoolSettings.current_session}
                        onChange={e => setSchoolSettings(s => ({ ...s, current_session: e.target.value }))}
                        className="h-9 text-sm border-slate-200 focus-visible:ring-emerald-500 flex-1"
                      />
                      <Badge className={cn(
                        'text-xs font-medium px-2 py-0.5 border',
                        schoolSettings.current_session === currentSession 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}>
                        {schoolSettings.current_session === currentSession ? 'current' : 'not current'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Info className="h-3 w-3" /> Changing this updates the system's current session
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleSaveSchoolSettings}
                    disabled={saving}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 text-xs px-4"
                  >
                    {saving
                      ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      : <Save className="h-3.5 w-3.5 mr-1.5" />}
                    Save to Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Terms ───────────────────────────────────────────────────────── */}
          <TabsContent value="terms" className="mt-4">
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <SectionHeader
                    icon={Calendar}
                    iconClass="bg-blue-100 text-blue-600"
                    title="Term Management"
                    description="Create, edit, and manage academic terms"
                  />
                  <Button
                    onClick={() => {
                      setEditingTerm(null)
                      setTermDialogOpen(true)
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!isAdmin}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Term
                  </Button>
                </div>

                {!isAdmin && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-xs text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    You have read-only access. Contact an admin to manage terms.
                  </div>
                )}

                {termsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : terms.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No terms created yet</p>
                    <p className="text-sm text-slate-400 mt-1">Add your first term to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {terms.map((term) => (
                      <div
                        key={term.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl border transition-all',
                          term.is_current
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            term.is_current ? 'bg-emerald-200' : 'bg-slate-100'
                          )}>
                            <GraduationCap className={cn(
                              'h-5 w-5',
                              term.is_current ? 'text-emerald-700' : 'text-slate-500'
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">
                                {term.term_code.charAt(0).toUpperCase() + term.term_code.slice(1)} Term
                              </p>
                              {term.is_current && (
                                <Badge className="bg-emerald-200 text-emerald-700 border-0 text-[10px]">
                                  <Zap className="h-2.5 w-2.5 mr-1" />
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {term.session_year} • {formatDate(term.start_date)} - {formatDate(term.end_date)}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTerm(term)
                                setTermDialogOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!term.is_current && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTerm(term.id)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Next term date */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="space-y-1.5 flex-1 max-w-xs">
                      <Label className="text-xs font-medium text-slate-600">Next Term Resumption Date</Label>
                      <Input
                        type="date"
                        value={nextTermDate}
                        onChange={e => setNextTermDate(e.target.value)}
                        className="h-9 text-sm border-slate-200 focus-visible:ring-blue-500"
                        disabled={!isAdmin}
                      />
                    </div>
                    <Button
                      onClick={handleSaveNextTermDate}
                      disabled={savingNextTerm || !isAdmin}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 text-xs px-4"
                    >
                      {savingNextTerm
                        ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        : <Save className="h-3.5 w-3.5 mr-1.5" />}
                      Save Date
                    </Button>
                  </div>

                  <AnimatePresence>
                    {nextTermDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-800">
                            Next term begins: {formatDate(nextTermDate)}
                          </p>
                          <p className="text-xs text-blue-600 mt-0.5">
                            This date will appear on all report cards generated for the current term.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Preferences ──────────────────────────────────────────────────── */}
          <TabsContent value="preferences" className="mt-4 space-y-4">
            {/* Notifications */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <SectionHeader
                  icon={Bell}
                  iconClass="bg-blue-100 text-blue-600"
                  title="Notification Preferences"
                  description="Control which alerts you receive"
                />

                <div className="divide-y divide-slate-100">
                  <ToggleRow
                    label="Email Notifications"
                    description="Receive system alerts via email"
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                  />
                  <ToggleRow
                    label="Exam Alerts"
                    description="Notify when exams are submitted for review"
                    checked={examAlerts}
                    onChange={setExamAlerts}
                  />
                  <ToggleRow
                    label="Report Card Alerts"
                    description="Notify when report cards are ready for approval"
                    checked={reportCardAlerts}
                    onChange={setReportCardAlerts}
                  />
                  <ToggleRow
                    label="Student Registrations"
                    description="Notify when new students are registered"
                    checked={studentRegistrationAlerts}
                    onChange={setStudentRegistrationAlerts}
                  />
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleSaveNotifications}
                    size="sm"
                    variant="outline"
                    className="border-slate-200 h-8 text-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <SectionHeader
                  icon={Palette}
                  iconClass="bg-pink-100 text-pink-600"
                  title="Appearance"
                  description="Personalise your portal experience"
                />

                <div className="divide-y divide-slate-100">
                  <ToggleRow
                    label="Compact Mode"
                    description="Reduce spacing and font sizes across the interface"
                    checked={compactMode}
                    onChange={setCompactMode}
                  />
                  <ToggleRow
                    label="Animations"
                    description="Show page transitions and motion effects"
                    checked={showAnimations}
                    onChange={setShowAnimations}
                  />
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleSaveAppearance}
                    size="sm"
                    variant="outline"
                    className="border-slate-200 h-8 text-xs"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />Save Appearance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border border-red-200/80 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-700 text-sm">Danger Zone</h3>
                    <p className="text-xs text-red-400 mt-0.5">These actions are irreversible — proceed with caution</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Reset All Data',
                      desc: 'Clear all exams, scores, and report cards from the system',
                    },
                    {
                      title: 'Delete Admin Account',
                      desc: 'Permanently remove your administrator account',
                    },
                  ].map(item => (
                    <div
                      key={item.title}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 text-xs"
                        disabled={!isAdmin}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        {item.title.split(' ')[0]}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Term Edit Dialog ────────────────────────────────────────────────── */}
      <TermEditDialog
        term={editingTerm}
        isOpen={termDialogOpen}
        onClose={() => {
          setTermDialogOpen(false)
          setEditingTerm(null)
        }}
        onSave={handleSaveTerm}
      />
    </div>
  )
}