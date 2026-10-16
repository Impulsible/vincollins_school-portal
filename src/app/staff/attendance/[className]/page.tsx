/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft, Users, Calendar, Loader2, AlertCircle, 
  BookOpen, Save, RefreshCw, Plus, Minus, Info, ClipboardCheck, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Pupil {
  id: string
  student_id: string
  pupil_name: string
  photo_url?: string | null
  avatar_url?: string | null
}

interface TermlyAttendance {
  student_id: string
  days_present: number
  days_absent: number
}

interface TermInfo {
  term_code: string
  term_name: string
  session_year: string
  start_date: string
  end_date: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeClassName = (name: string): string => {
  if (!name) return ''
  let n = name.trim().replace(/\s+/g, ' ')
  n = n.replace(/JSS\s+(\d+)/i, 'JSS$1')
  n = n.replace(/SS\s+(\d+)/i, 'SS$1')
  return n.toUpperCase().trim()
}

const classNamesMatch = (a: string, b: string) =>
  !!a && !!b && normalizeClassName(a) === normalizeClassName(b)

// Helper to calculate total weekdays between two dates (estimated term school days)
function calculateTermWeekdays(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  let count = 0
  const cur = new Date(startDate)
  while (cur <= endDate) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++ // Exclude Saturdays and Sundays
    cur.setDate(cur.getDate() + 1)
  }
  return count || 90 // Default fallback estimate
}

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading Termly Attendance...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching student records</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MarkAttendancePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()
  const classNameFromUrl = decodeURIComponent(params.className as string)

  const [pupils, setPupils] = useState<Pupil[]>([])
  const [termInfo, setTermInfo] = useState<TermInfo | null>(null)
  const [attendanceData, setAttendanceData] = useState<Record<string, TermlyAttendance>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [matchedClassName, setMatchedClassName] = useState(classNameFromUrl)
  
  // Custom states for batch tools
  const [batchPresentVal, setBatchPresentVal] = useState<number | ''>('')
  const [batchAbsentVal, setBatchAbsentVal] = useState<number | ''>(0)

  // Calculate estimated total term days
  const totalEstimatedTermDays = useMemo(() => {
    if (!termInfo) return 90
    return calculateTermWeekdays(termInfo.start_date, termInfo.end_date)
  }, [termInfo])

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // Fetch term settings
      const { data: settings } = await supabase
        .from('school_settings')
        .select('current_term, current_session')
        .single()

      if (!settings) { 
        toast.error('No school settings found')
        setLoading(false)
        return 
      }

      const { data: termData } = await supabase
        .from('terms')
        .select('*')
        .eq('term_code', settings.current_term)
        .eq('session_year', settings.current_session)
        .single()
      
      if (!termData) { 
        toast.error('Term not found')
        setLoading(false)
        return 
      }
      setTermInfo(termData)
      setBatchPresentVal(calculateTermWeekdays(termData.start_date, termData.end_date))

      // Match correct className
      const { data: allPupils } = await supabase
        .from('profiles')
        .select('id, display_name, class, photo_url, avatar_url')
        .in('role', ['pupil', 'student'])
        .eq('is_active', true)

      let matched = classNameFromUrl
      if (allPupils) {
        const classNames = [...new Set(allPupils.map((s: any) => s.class).filter(Boolean))]
        const found = classNames.find((c: any) => classNamesMatch(c, classNameFromUrl))
        if (found) matched = found as string
      }
      setMatchedClassName(matched)

      // Fetch pupils in the matched class
      const { data: pupilsData } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url, avatar_url')
        .in('role', ['pupil', 'student'])
        .eq('class', matched)
        .eq('is_active', true)
        .order('display_name')

      const loadedPupils = (pupilsData ?? []).map((p: any) => ({
        id: p.id,
        student_id: p.id,
        pupil_name: p.display_name || 'Unknown',
        photo_url: p.photo_url || p.avatar_url || null,
      }))
      setPupils(loadedPupils)

      const studentIds = loadedPupils.map(p => p.student_id)
      if (studentIds.length > 0) {
        // Fetch termly aggregate records
        const { data: recs } = await supabase
          .from('term_attendance')
          .select('student_id, days_present, days_absent')
          .in('student_id', studentIds)
          .eq('term_code', termData.term_code)
          .eq('session_year', termData.session_year)

        const initialData: Record<string, TermlyAttendance> = {}
        
        // Populate fetched items
        recs?.forEach((r: any) => {
          initialData[r.student_id] = {
            student_id: r.student_id,
            days_present: Number(r.days_present ?? 0),
            days_absent: Number(r.days_absent ?? 0)
          }
        })

        // Fill remaining pupils with default 0s
        loadedPupils.forEach(p => {
          if (!initialData[p.student_id]) {
            initialData[p.student_id] = {
              student_id: p.student_id,
              days_present: 0,
              days_absent: 0
            }
          }
        })

        setAttendanceData(initialData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Failed to load attendance data')
    } finally {
      setLoading(false)
      setIsDirty(false)
    }
  }, [classNameFromUrl, user?.id])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ─── Input Handlers ──────────────────────────────────────────────────────────

  const handleValueChange = (studentId: string, field: 'days_present' | 'days_absent', value: number) => {
    const cleanValue = Math.max(0, Math.floor(value)) // Prevent negative numbers/decimals
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: cleanValue
      }
    }))
    setIsDirty(true)
  }

  const handleIncrement = (studentId: string, field: 'days_present' | 'days_absent') => {
    const currentVal = attendanceData[studentId]?.[field] ?? 0
    handleValueChange(studentId, field, currentVal + 1)
  }

  const handleDecrement = (studentId: string, field: 'days_present' | 'days_absent') => {
    const currentVal = attendanceData[studentId]?.[field] ?? 0
    handleValueChange(studentId, field, currentVal - 1)
  }

  // Batch Auto-fill helper (saves time for teachers)
  const applyBatchValues = () => {
    if (batchPresentVal === '') {
      toast.error('Please input a valid target number for Days Present')
      return
    }
    
    setAttendanceData(prev => {
      const updated = { ...prev }
      pupils.forEach(p => {
        updated[p.student_id] = {
          student_id: p.student_id,
          days_present: Number(batchPresentVal),
          days_absent: Number(batchAbsentVal)
        }
      })
      return updated
    })
    setIsDirty(true)
    toast.success('Successfully applied batch attendance to all pupils')
  }

  // ─── Save Operation ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!termInfo || !user?.id) return
    setSaving(true)
    try {
      const payload = pupils.map(p => {
        const data = attendanceData[p.student_id] || { days_present: 0, days_absent: 0 }
        return {
          student_id: p.student_id,
          class_name: matchedClassName,
          term_code: termInfo.term_code,
          session_year: termInfo.session_year,
          days_present: data.days_present,
          days_absent: data.days_absent,
          teacher_id: user.id,
          updated_at: new Date().toISOString()
        }
      })

      const { error } = await supabase
        .from('term_attendance')
        .upsert(payload, { onConflict: 'student_id,term_code,session_year' })

      if (error) throw error

      setIsDirty(false)
      toast.success('Termly attendance saved successfully')
    } catch (error) {
      console.error('Error saving termly aggregate data:', error)
      toast.error('Failed to save attendance aggregate data')
    } finally {
      setSaving(false)
    }
  }

  // ─── Calculations ───────────────────────────────────────────────────────────

  const aggregates = useMemo(() => {
    let sumPresent = 0
    let sumAbsent = 0
    let count = 0

    Object.values(attendanceData).forEach(item => {
      sumPresent += item.days_present
      sumAbsent += item.days_absent
      count++
    })

    const totalDaysRecorded = sumPresent + sumAbsent
    const averagePercentage = totalDaysRecorded > 0 ? Math.round((sumPresent / totalDaysRecorded) * 100) : 0

    return {
      sumPresent,
      sumAbsent,
      averagePercentage,
      count
    }
  }, [attendanceData])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/staff/attendance')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <BookOpen className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{classNameFromUrl}</p>
                  {termInfo && (
                    <p className="text-[11px] text-slate-400 mt-1 leading-none">
                      {termInfo.term_name} · Termly Summary Profile
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="text-xs text-amber-500 font-semibold hidden md:inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Unsaved Changes
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm',
                  isDirty 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Termly Logs'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Metric Summary Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pupils</p>
              <p className="text-xl font-extrabold text-slate-800">{pupils.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Days Present</p>
              <p className="text-xl font-extrabold text-slate-800">{aggregates.sumPresent}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Days Absent</p>
              <p className="text-xl font-extrabold text-slate-800">{aggregates.sumAbsent}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Term Weekdays</p>
              <p className="text-xl font-extrabold text-slate-800">{totalEstimatedTermDays} Days</p>
            </div>
          </div>
        </div>

        {/* ── Bulk Management Toolset ────────────────────────────────────── */}
        {pupils.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-800">Batch Entry Assistant</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 max-w-2xl">
              Quickly fill out typical attendance records for the entire class context at once. You can edit individual records manually afterward.
            </p>
            
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Days Present (Base)</label>
                <input
                  type="number"
                  value={batchPresentVal}
                  onChange={(e) => setBatchPresentVal(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={String(totalEstimatedTermDays)}
                  className="bg-white border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Days Absent (Base)</label>
                <input
                  type="number"
                  value={batchAbsentVal}
                  onChange={(e) => setBatchAbsentVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-white border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={applyBatchValues}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Apply to Class List
              </button>
            </div>
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────────────────── */}
        {pupils.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 mb-1">No pupils found</p>
            <p className="text-sm text-slate-400">
              No active pupils assigned to <strong>{classNameFromUrl}</strong>
            </p>
          </div>
        )}

        {/* ── Termly Attendance Table ────────────────────────────────────── */}
        {pupils.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">#</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Pupil</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center w-52">Days Present</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center w-52">Days Absent</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center w-36">Total Days</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right w-32">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pupils.map((pupil, index) => {
                    const record = attendanceData[pupil.student_id] || { days_present: 0, days_absent: 0 }
                    const totalDays = record.days_present + record.days_absent
                    const rate = totalDays > 0 ? Math.round((record.days_present / totalDays) * 100) : 0
                    const initials = pupil.pupil_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                    return (
                      <tr key={pupil.student_id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Number Index */}
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </td>

                        {/* Profile Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-slate-100 shadow-sm">
                              {pupil.photo_url ? (
                                <AvatarImage src={pupil.photo_url} alt={pupil.pupil_name} className="object-cover" />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold">
                                  {initials}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 leading-tight">
                                {pupil.pupil_name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Student ID: {pupil.student_id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>

                        {/* Days Present Control Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDecrement(pupil.student_id, 'days_present')}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-500 transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={record.days_present}
                              onChange={(e) => handleValueChange(pupil.student_id, 'days_present', Number(e.target.value))}
                              className="w-16 text-center text-sm font-extrabold bg-slate-50 text-slate-800 border border-slate-200 rounded-lg py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleIncrement(pupil.student_id, 'days_present')}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-500 transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Days Absent Control Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDecrement(pupil.student_id, 'days_absent')}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-500 transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={record.days_absent}
                              onChange={(e) => handleValueChange(pupil.student_id, 'days_absent', Number(e.target.value))}
                              className="w-16 text-center text-sm font-extrabold bg-slate-50 text-slate-800 border border-slate-200 rounded-lg py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleIncrement(pupil.student_id, 'days_absent')}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-500 transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Auto calculated total column */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-slate-500">
                            {totalDays} Days
                          </span>
                        </td>

                        {/* Auto calculated percentage rate */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex flex-col items-end">
                            <span className={cn(
                              'text-sm font-black leading-none',
                              rate >= 90 ? 'text-emerald-600' :
                              rate >= 75 ? 'text-blue-600' :
                              rate >= 50 ? 'text-amber-600' : 'text-rose-500'
                            )}>
                              {rate}%
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-300',
                                  rate >= 90 ? 'bg-emerald-500' :
                                  rate >= 75 ? 'bg-blue-500' :
                                  rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                )}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Context Notice ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Database & Record Aggregates</p>
            <p>
              Values saved here are tracked as term-wide aggregate totals for each student profile. Updates immediately overwrite previous aggregate entries for the current session/term parameters.
            </p>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Portal • Termly Marksheet Profile</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}