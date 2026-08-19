/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  GraduationCap, Users, ArrowRight, ArrowUp,
  Loader2, CheckCircle2, AlertCircle,
  Search, RefreshCw, Lock,
  Save, X, Clock, Sparkles,
  Check, LayoutGrid, List,
  ChevronRight, Layers, Zap, TrendingUp,
  History, Calendar,
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

// ── Types ─────────────────────────────────────────────────────────────
interface Student {
  id: string
  full_name: string
  display_name?: string
  admission_number: string
  current_class: string
  current_class_arm?: string
  promoted_to?: string
  promoted_to_arm?: string
  promotion_status: 'pending' | 'approved' | 'rejected' | 'graduated'
  last_promotion_year?: string
  last_promotion_term?: string
  academic_year: string
  term: string
  admission_year: number
  is_active: boolean
}

interface PromotionHistory {
  id: string
  student_id: string
  from_class: string
  to_class: string
  academic_year: string
  term: string
  promoted_by?: string
  promoted_at: string
  status: 'approved' | 'rejected' | 'graduated'
  notes?: string
  promoted_by_profile?: {
    full_name: string
  }
}

interface PromotionStats {
  totalStudents: number
  pendingPromotions: number
  approvedPromotions: number
  rejectedPromotions: number
  graduatedStudents: number
  completionRate: number
}

// ── Constants ─────────────────────────────────────────────────────────
const CLASSES = [
  { id: 'playgroup', name: 'Playgroup', code: 'PG' },
  { id: 'nursery_1', name: 'Nursery 1', code: 'N1' },
  { id: 'nursery_2', name: 'Nursery 2', code: 'N2' },
  { id: 'kindergarten', name: 'Kindergarten', code: 'KG' },
  { id: 'primary_1', name: 'Primary 1', code: 'P1' },
  { id: 'primary_2', name: 'Primary 2', code: 'P2' },
  { id: 'primary_3', name: 'Primary 3', code: 'P3' },
  { id: 'primary_4', name: 'Primary 4', code: 'P4' },
  { id: 'primary_5', name: 'Primary 5', code: 'P5' },
  { id: 'primary_6', name: 'Primary 6', code: 'P6' },
  { id: 'jss_1', name: 'JSS 1', code: 'JSS1' },
  { id: 'jss_2', name: 'JSS 2', code: 'JSS2' },
  { id: 'jss_3', name: 'JSS 3', code: 'JSS3' },
  { id: 'ss_1', name: 'SS 1', code: 'SS1' },
  { id: 'ss_2', name: 'SS 2', code: 'SS2' },
  { id: 'ss_3', name: 'SS 3', code: 'SS3' },
]

const CLASS_NAMES: string[] = CLASSES.map(c => c.name)

const FINAL_CLASS = 'SS 3'
const GRADUATED_LABEL = 'Graduated'
const PROMOTION_TERM = 'Third' // Promotions only allowed in Third Term

const TERMS = [
  { value: 'First', label: 'First Term' },
  { value: 'Second', label: 'Second Term' },
  { value: 'Third', label: 'Third Term' },
]

// ── Helpers ───────────────────────────────────────────────────────────
const getTermLabel = (value: string) => TERMS.find(t => t.value === value)?.label || value

const hasGraduated = (currentClass: string): boolean => currentClass === GRADUATED_LABEL

const getNextClass = (currentClass: string): string => {
  if (currentClass === GRADUATED_LABEL) return ''
  if (currentClass === FINAL_CLASS) return GRADUATED_LABEL

  const currentIndex = CLASS_NAMES.indexOf(currentClass)
  if (currentIndex === -1) return ''
  if (currentIndex === CLASS_NAMES.length - 1) return GRADUATED_LABEL

  return CLASS_NAMES[currentIndex + 1]
}

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}

const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
  ]
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

const formatHistoryDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Loading Screen ────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-bold text-slate-700">Loading promotions...</p>
        <p className="text-xs text-slate-400 mt-1">Fetching student data</p>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, tone, subtitle, delay = 0,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  tone: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  subtitle?: string
  delay?: number
}) {
  const tones = {
    blue: { grad: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500' },
    emerald: { grad: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'bg-emerald-500' },
    amber: { grad: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', accent: 'bg-amber-500' },
    rose: { grad: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600', accent: 'bg-rose-500' },
    purple: { grad: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500' },
  }
  const t = tones[tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', t.accent)} />
      <div className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity bg-gradient-to-br', t.grad)} />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <div className={cn('shrink-0 h-8 w-8 rounded-xl flex items-center justify-center', t.bg)}>
            <Icon className={cn('h-4 w-4', t.text)} />
          </div>
        </div>

        <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] text-slate-500 font-semibold mt-1.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Promotion Row ────────────────────────────────────────────────────
function PromotionRow({
  student, onApprove, onReject, onView, onChangeTargetClass, index, canPromote,
}: {
  student: Student
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onView: (student: Student) => void
  onChangeTargetClass: (id: string, targetClass: string) => void
  index: number
  canPromote: boolean
}) {
  const suggestedNext = getNextClass(student.current_class)
  const targetClass = student.promoted_to || suggestedNext
  const [isChangingClass, setIsChangingClass] = useState(false)
  const isGraduatingStep = targetClass === GRADUATED_LABEL
  const isAlreadyGraduated = hasGraduated(student.current_class) || student.promotion_status === 'graduated'

  const statusConfig = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, label: 'Promoted' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: X, label: 'Rejected' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
    graduated: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: GraduationCap, label: 'Graduated' },
  }
  const status = statusConfig[student.promotion_status]
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        {/* Avatar */}
        <button
          onClick={() => onView(student)}
          className={cn(
            'shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm bg-gradient-to-br',
            getAvatarGradient(student.full_name)
          )}
        >
          {getInitials(student.full_name)}
        </button>

        {/* Name + Info */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onView(student)}
            className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 transition-colors block text-left"
          >
            {student.full_name}
          </button>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-[10px] font-mono text-slate-400 font-semibold">
              {student.admission_number}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] font-semibold text-slate-500">
              {student.current_class}
            </span>
            {student.last_promotion_year && student.promotion_status === 'approved' && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-medium text-emerald-600">
                  Promoted {student.last_promotion_year}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Class transition (desktop only) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {isAlreadyGraduated ? 'Class' : 'From'}
            </p>
            <p className="text-xs font-black text-slate-800">{student.current_class}</p>
          </div>

          {!isAlreadyGraduated && (
            <>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />

              {student.promotion_status === 'pending' && !isChangingClass ? (
                <button
                  onClick={() => setIsChangingClass(true)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg border hover:border-opacity-70 transition-colors group/target',
                    isGraduatingStep
                      ? 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  )}
                >
                  <p className={cn(
                    'text-[9px] font-bold uppercase tracking-widest',
                    isGraduatingStep ? 'text-purple-500' : 'text-blue-500'
                  )}>
                    {isGraduatingStep ? 'Will Graduate' : 'To'}
                  </p>
                  <p className={cn(
                    'text-xs font-black flex items-center gap-1',
                    isGraduatingStep ? 'text-purple-700' : 'text-blue-700'
                  )}>
                    {isGraduatingStep && <GraduationCap className="h-3 w-3" />}
                    {targetClass || 'Select'}
                    <span className="opacity-0 group-hover/target:opacity-100 transition-opacity text-[9px]">✎</span>
                  </p>
                </button>
              ) : student.promotion_status === 'pending' && isChangingClass ? (
                <Select
                  value={targetClass}
                  onValueChange={(v) => {
                    onChangeTargetClass(student.id, v)
                    setIsChangingClass(false)
                  }}
                  open={isChangingClass}
                  onOpenChange={setIsChangingClass}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs border-blue-300 bg-blue-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_NAMES.map(cls => (
                      <SelectItem key={cls} value={cls} className="text-xs">
                        {cls}
                        {cls === suggestedNext && ' ⭐'}
                      </SelectItem>
                    ))}
                    {suggestedNext === GRADUATED_LABEL && (
                      <SelectItem value={GRADUATED_LABEL} className="text-xs">
                        🎓 {GRADUATED_LABEL} ⭐
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className={cn(
                  'px-2.5 py-1 rounded-lg border',
                  student.promotion_status === 'graduated'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-emerald-50 border-emerald-200'
                )}>
                  <p className={cn(
                    'text-[9px] font-bold uppercase tracking-widest',
                    student.promotion_status === 'graduated' ? 'text-purple-500' : 'text-emerald-500'
                  )}>
                    {student.promotion_status === 'graduated' ? 'Status' : 'Now In'}
                  </p>
                  <p className={cn(
                    'text-xs font-black flex items-center gap-1',
                    student.promotion_status === 'graduated' ? 'text-purple-700' : 'text-emerald-700'
                  )}>
                    {student.promotion_status === 'graduated' && <GraduationCap className="h-3 w-3" />}
                    {student.current_class}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status */}
        <div className={cn('hidden sm:flex items-center gap-1 px-2 py-1 rounded-full border shrink-0', status.bg, status.border)}>
          <StatusIcon className={cn('h-2.5 w-2.5', status.text)} />
          <span className={cn('text-[10px] font-bold', status.text)}>{status.label}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {student.promotion_status === 'pending' && !isAlreadyGraduated && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(student.id)}
                disabled={!canPromote}
                className={cn(
                  'h-8 w-8 sm:w-auto sm:px-3 p-0 sm:gap-1 shadow-sm disabled:opacity-40',
                  isGraduatingStep
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                )}
                title={
                  !canPromote 
                    ? `Promotions only allowed in ${PROMOTION_TERM} Term` 
                    : isGraduatingStep 
                      ? 'Graduate student' 
                      : 'Approve promotion'
                }
              >
                {isGraduatingStep ? (
                  <GraduationCap className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline text-xs font-bold">
                  {isGraduatingStep ? 'Graduate' : 'Promote'}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(student.id)}
                disabled={!canPromote}
                className="h-8 w-8 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-40"
                title="Reject promotion"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {(student.promotion_status !== 'pending' || isAlreadyGraduated) && (
            <button
              onClick={() => onView(student)}
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile transition */}
      <div className="md:hidden px-3 pb-3 flex items-center gap-2">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              {isAlreadyGraduated ? 'Class' : 'From'}
            </p>
            <p className="text-[11px] font-black text-slate-800">{student.current_class}</p>
          </div>
          {!isAlreadyGraduated && (
            <div className={cn(
              'px-2 py-1.5 rounded-lg border text-center',
              student.promotion_status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
              isGraduatingStep ? 'bg-purple-50 border-purple-200' :
              'bg-blue-50 border-blue-200'
            )}>
              <p className={cn(
                'text-[9px] font-bold uppercase',
                student.promotion_status === 'approved' ? 'text-emerald-500' :
                isGraduatingStep ? 'text-purple-500' :
                'text-blue-500'
              )}>
                {student.promotion_status === 'approved' ? 'Now In' :
                  isGraduatingStep ? 'Will Grad' : 'To'}
              </p>
              <p className={cn(
                'text-[11px] font-black',
                student.promotion_status === 'approved' ? 'text-emerald-700' :
                isGraduatingStep ? 'text-purple-700' :
                'text-blue-700'
              )}>
                {targetClass || 'Not set'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Class Group ──────────────────────────────────────────────────────
function ClassGroup({
  className: classNameLabel,
  students,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  onView,
  onChangeTargetClass,
  onPromoteAll,
  canPromote,
}: {
  className: string
  students: Student[]
  isExpanded: boolean
  onToggle: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onView: (student: Student) => void
  onChangeTargetClass: (id: string, targetClass: string) => void
  onPromoteAll: (className: string) => void
  canPromote: boolean
}) {
  const nextClass = getNextClass(classNameLabel)
  const pendingCount = students.filter(s => s.promotion_status === 'pending').length
  const approvedCount = students.filter(s => s.promotion_status === 'approved').length
  const graduatedCount = students.filter(s => s.promotion_status === 'graduated').length
  const isGraduatingGroup = nextClass === GRADUATED_LABEL
  const isGraduatedGroup = classNameLabel === GRADUATED_LABEL

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50 transition-colors"
      >
        <div className={cn(
          'shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br',
          isGraduatedGroup || isGraduatingGroup
            ? 'from-purple-500 to-fuchsia-600'
            : 'from-blue-500 to-indigo-600'
        )}>
          {isGraduatedGroup || isGraduatingGroup ? (
            <GraduationCap className="h-4 w-4 text-white" />
          ) : (
            <Layers className="h-4 w-4 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
              {classNameLabel}
            </h3>
            {nextClass && !isGraduatedGroup && (
              <>
                <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                <span className={cn(
                  'text-xs font-bold truncate flex items-center gap-1',
                  isGraduatingGroup ? 'text-purple-600' : 'text-blue-600'
                )}>
                  {isGraduatingGroup && <GraduationCap className="h-3 w-3" />}
                  {nextClass}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] font-semibold text-slate-500">
              {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
            {pendingCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-bold text-amber-600">
                  {pendingCount} pending
                </span>
              </>
            )}
            {approvedCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {approvedCount} promoted
                </span>
              </>
            )}
            {graduatedCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-bold text-purple-600">
                  {graduatedCount} graduated
                </span>
              </>
            )}
          </div>
        </div>

        {pendingCount > 0 && nextClass && canPromote && (
          <button
            onClick={(e) => { e.stopPropagation(); onPromoteAll(classNameLabel) }}
            className={cn(
              'shrink-0 hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors',
              isGraduatingGroup
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
            )}
          >
            {isGraduatingGroup ? (
              <GraduationCap className="h-3 w-3" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            {isGraduatingGroup
              ? `Graduate ${pendingCount}`
              : `Promote ${pendingCount} to ${nextClass}`}
          </button>
        )}

        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-2 sm:p-3 space-y-2 bg-slate-50/30">
              {students.map((s, i) => (
                <PromotionRow
                  key={s.id}
                  student={s}
                  index={i}
                  onApprove={onApprove}
                  onReject={onReject}
                  onView={onView}
                  onChangeTargetClass={onChangeTargetClass}
                  canPromote={canPromote}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function AdminPromotionsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'graduated'>('all')
  const [filterClass, setFilterClass] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped')

  const [currentTerm, setCurrentTerm] = useState('First')
  const [currentSession, setCurrentSession] = useState('2026/2027')
  const [isLoadingTerm, setIsLoadingTerm] = useState(true)

  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [studentHistory, setStudentHistory] = useState<PromotionHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [bulkPromoteDialogOpen, setBulkPromoteDialogOpen] = useState(false)
  const [bulkPromoteClass, setBulkPromoteClass] = useState<string>('')
  const [bulkPromoteTo, setBulkPromoteTo] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // 🔒 Only allow promotions in Third Term
  const canPromote = currentTerm === PROMOTION_TERM

  // ─── Fetch current term ─────────────────────────────────────────────
  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const { data } = await supabase
          .from('school_settings')
          .select('current_term, current_session')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          setCurrentTerm(data.current_term || 'First')
          setCurrentSession(data.current_session || '2026/2027')
        }
      } catch (error) {
        console.error('Error fetching term:', error)
      } finally {
        setIsLoadingTerm(false)
      }
    }
    fetchTerm()
  }, [])

  // ─── Fetch students with smart status computation ───────────────────
  const fetchStudents = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['student', 'pupil'])
        .eq('is_active', true)
        .order('full_name', { ascending: true })

      if (error) throw error

      const studentsData: Student[] = (data || []).map((s: any) => {
        const lastPromotionYear = s.last_promotion_year
        const alreadyPromotedThisYear = lastPromotionYear === currentSession
        const isGraduated = s.current_class === GRADUATED_LABEL || s.promotion_status === 'graduated'

        // 🎯 KEY LOGIC: Auto-determine promotion status based on academic year
        let promotionStatus: Student['promotion_status'] = 'pending'

        if (isGraduated) {
          promotionStatus = 'graduated'
        } else if (alreadyPromotedThisYear && s.promotion_status === 'approved') {
          // Already promoted this year — show as approved
          promotionStatus = 'approved'
        } else if (alreadyPromotedThisYear && s.promotion_status === 'rejected') {
          // Rejected this year — keep as rejected
          promotionStatus = 'rejected'
        } else {
          // New academic year OR never promoted → back to pending!
          promotionStatus = 'pending'
        }

        return {
          id: s.id,
          full_name: s.full_name || s.display_name || 'Unknown',
          display_name: s.display_name,
          admission_number: s.admission_number || 'N/A',
          current_class: s.class || 'Unassigned',
          current_class_arm: s.class_arm,
          promoted_to: s.promoted_to || null,
          promoted_to_arm: s.promoted_to_arm || null,
          promotion_status: promotionStatus,
          last_promotion_year: lastPromotionYear,
          last_promotion_term: s.last_promotion_term,
          academic_year: currentSession,
          term: currentTerm,
          admission_year: s.admission_year || new Date().getFullYear(),
          is_active: s.is_active !== false,
        }
      })

      setStudents(studentsData)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id, currentTerm, currentSession])

  useEffect(() => {
    if (!authLoading && user?.id && !isLoadingTerm) {
      fetchStudents().then(() => setLoading(false))
    }
  }, [authLoading, user?.id, isLoadingTerm, fetchStudents])

  // ─── Fetch history for a student ────────────────────────────────────
  const fetchStudentHistory = useCallback(async (studentId: string) => {
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('promotion_history')
        .select('*, promoted_by_profile:profiles!promoted_by(full_name)')
        .eq('student_id', studentId)
        .order('promoted_at', { ascending: false })

      if (error) {
        console.error('History fetch error:', error)
        setStudentHistory([])
        return
      }
      setStudentHistory(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      setStudentHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // ─── Computed ──────────────────────────────────────────────────────
  const stats = useMemo<PromotionStats>(() => {
    const total = students.length
    const pending = students.filter(s => s.promotion_status === 'pending').length
    const approved = students.filter(s => s.promotion_status === 'approved').length
    const rejected = students.filter(s => s.promotion_status === 'rejected').length
    const graduated = students.filter(s => s.promotion_status === 'graduated').length
    const completionRate = total > 0 ? Math.round(((approved + graduated) / total) * 100) : 0
    return { totalStudents: total, pendingPromotions: pending, approvedPromotions: approved, rejectedPromotions: rejected, graduatedStudents: graduated, completionRate }
  }, [students])

  const filteredStudents = useMemo(() => {
    let f = [...students]
    if (filterStatus !== 'all') f = f.filter(s => s.promotion_status === filterStatus)
    if (filterClass !== 'all') f = f.filter(s => s.current_class === filterClass)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      f = f.filter(s =>
        s.full_name.toLowerCase().includes(q) ||
        s.admission_number.toLowerCase().includes(q)
      )
    }
    return f
  }, [students, filterStatus, filterClass, searchQuery])

  const groupedByClass = useMemo(() => {
    const groups: Record<string, Student[]> = {}
    filteredStudents.forEach(s => {
      if (!groups[s.current_class]) groups[s.current_class] = []
      groups[s.current_class].push(s)
    })

    return Object.entries(groups).sort(([a], [b]) => {
      // Put "Graduated" at the bottom
      if (a === GRADUATED_LABEL) return 1
      if (b === GRADUATED_LABEL) return -1

      const aIdx = CLASS_NAMES.indexOf(a)
      const bIdx = CLASS_NAMES.indexOf(b)
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return aIdx - bIdx
    })
  }, [filteredStudents])

  const availableClasses = useMemo(() =>
    [...new Set(students.map(s => s.current_class).filter(Boolean))].sort((a, b) => {
      if (a === GRADUATED_LABEL) return 1
      if (b === GRADUATED_LABEL) return -1
      const aIdx = CLASS_NAMES.indexOf(a)
      const bIdx = CLASS_NAMES.indexOf(b)
      return aIdx - bIdx
    }),
    [students])

  // Auto-expand groups with pending students on first load
  useEffect(() => {
    if (groupedByClass.length > 0 && expandedGroups.size === 0) {
      const pendingGroups = groupedByClass
        .filter(([, groupStudents]) => groupStudents.some(s => s.promotion_status === 'pending'))
        .map(([name]) => name)
      setExpandedGroups(new Set(pendingGroups.length > 0 ? pendingGroups : [groupedByClass[0][0]]))
    }
  }, [groupedByClass, expandedGroups.size])

  // ─── Handlers ──────────────────────────────────────────────────────
  const toggleGroup = (className: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(className)) next.delete(className)
      else next.add(className)
      return next
    })
  }

  const expandAll = () => setExpandedGroups(new Set(groupedByClass.map(([n]) => n)))
  const collapseAll = () => setExpandedGroups(new Set())

  const handleViewStudent = useCallback((student: Student) => {
    setViewingStudent(student)
    setViewDialogOpen(true)
    fetchStudentHistory(student.id)
  }, [fetchStudentHistory])

  const handleChangeTargetClass = useCallback(async (studentId: string, targetClass: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          promoted_to: targetClass,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)

      if (error) throw error

      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, promoted_to: targetClass } : s
      ))
      toast.success(`Target class updated to ${targetClass}`)
    } catch (error) {
      console.error('Error updating target class:', error)
      toast.error('Failed to update target class')
    }
  }, [])

  const handleApprovePromotion = useCallback(async (studentId: string) => {
    if (!canPromote) {
      toast.error(`Promotions are only allowed during ${PROMOTION_TERM} Term`)
      return
    }

    try {
      const student = students.find(s => s.id === studentId)
      if (!student) return

      if (hasGraduated(student.current_class)) {
        toast.info(`🎓 ${student.full_name} has already graduated`)
        return
      }

      const targetClass = student.promoted_to || getNextClass(student.current_class)
      if (!targetClass) {
        toast.error('No next class available for this student')
        return
      }

      const currentUserId = user?.id
      const isGraduating = targetClass === GRADUATED_LABEL

      // 1️⃣ Update student profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          class: targetClass,
          promoted_to: null, // Clear target — student is now IN that class
          promotion_status: isGraduating ? 'graduated' : 'approved',
          last_promotion_year: currentSession,
          last_promotion_term: currentTerm,
          promoted_at: new Date().toISOString(),
          promoted_by: currentUserId,
          ...(isGraduating && { graduated_at: new Date().toISOString() }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)

      if (profileError) throw profileError

      // 2️⃣ Create permanent history record
      const { error: historyError } = await supabase
        .from('promotion_history')
        .insert({
          student_id: studentId,
          from_class: student.current_class,
          to_class: targetClass,
          academic_year: currentSession,
          term: currentTerm,
          promoted_by: currentUserId,
          status: isGraduating ? 'graduated' : 'approved',
        })

      if (historyError) console.error('History insert failed:', historyError)

      if (isGraduating) {
        toast.success(`🎓 Congratulations! ${student.full_name} has graduated!`, { duration: 5000 })
      } else {
        toast.success(`✅ ${student.full_name} promoted to ${targetClass}`)
      }

      await fetchStudents()
    } catch (error) {
      console.error('Error approving promotion:', error)
      toast.error('Failed to approve promotion')
    }
  }, [students, user, fetchStudents, currentSession, currentTerm, canPromote])

  const handleRejectPromotion = useCallback(async (studentId: string) => {
    if (!canPromote) {
      toast.error(`Promotions are only allowed during ${PROMOTION_TERM} Term`)
      return
    }

    try {
      const student = students.find(s => s.id === studentId)
      if (!student) return

      const currentUserId = user?.id

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          promoted_to: null,
          promotion_status: 'rejected',
          last_promotion_year: currentSession,
          last_promotion_term: currentTerm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)

      if (profileError) throw profileError

      // Log rejection in history
      await supabase
        .from('promotion_history')
        .insert({
          student_id: studentId,
          from_class: student.current_class,
          to_class: student.current_class, // stays in same class
          academic_year: currentSession,
          term: currentTerm,
          promoted_by: currentUserId,
          status: 'rejected',
          notes: 'Promotion rejected — student remains in current class',
        })

      toast.success(`Promotion rejected for ${student.full_name}`)
      await fetchStudents()
    } catch (error) {
      console.error('Error rejecting promotion:', error)
      toast.error('Failed to reject promotion')
    }
  }, [students, user, fetchStudents, currentSession, currentTerm, canPromote])

  const handlePromoteAllInGroup = useCallback(async (className: string) => {
    if (!canPromote) {
      toast.error(`Promotions are only allowed during ${PROMOTION_TERM} Term`)
      return
    }

    const targetClass = getNextClass(className)
    if (!targetClass) {
      toast.error('No next class available')
      return
    }

    const pending = students.filter(s => s.current_class === className && s.promotion_status === 'pending')
    if (pending.length === 0) return

    const isGraduating = targetClass === GRADUATED_LABEL
    const confirmMsg = isGraduating
      ? `🎓 Graduate all ${pending.length} students from ${className}?`
      : `Promote all ${pending.length} pending students from ${className} to ${targetClass}?`

    const confirmed = window.confirm(confirmMsg)
    if (!confirmed) return

    setIsProcessing(true)
    try {
      const currentUserId = user?.id
      const now = new Date().toISOString()

      for (const s of pending) {
        // Update profile
        await supabase.from('profiles').update({
          class: targetClass,
          promoted_to: null,
          promotion_status: isGraduating ? 'graduated' : 'approved',
          last_promotion_year: currentSession,
          last_promotion_term: currentTerm,
          promoted_at: now,
          promoted_by: currentUserId,
          ...(isGraduating && { graduated_at: now }),
          updated_at: now,
        }).eq('id', s.id)

        // Log history
        await supabase.from('promotion_history').insert({
          student_id: s.id,
          from_class: s.current_class,
          to_class: targetClass,
          academic_year: currentSession,
          term: currentTerm,
          promoted_by: currentUserId,
          status: isGraduating ? 'graduated' : 'approved',
        })
      }

      if (isGraduating) {
        toast.success(`🎓 ${pending.length} students graduated from ${className}!`, { duration: 5000 })
      } else {
        toast.success(`🎉 Promoted ${pending.length} students from ${className} to ${targetClass}`)
      }
      await fetchStudents()
    } catch (error) {
      console.error('Bulk promote error:', error)
      toast.error('Failed to promote students')
    } finally {
      setIsProcessing(false)
    }
  }, [students, user, fetchStudents, currentSession, currentTerm, canPromote])

  const handleBulkPromote = useCallback(async () => {
    if (!canPromote) {
      toast.error(`Promotions are only allowed during ${PROMOTION_TERM} Term`)
      return
    }

    if (!bulkPromoteClass || !bulkPromoteTo) {
      toast.error('Please select both source and destination classes')
      return
    }

    setIsProcessing(true)
    try {
      const studentsToPromote = students.filter(s =>
        s.current_class === bulkPromoteClass &&
        s.promotion_status === 'pending'
      )

      if (studentsToPromote.length === 0) {
        toast.info('No pending students to promote in this class')
        setBulkPromoteDialogOpen(false)
        return
      }

      const currentUserId = user?.id
      const isGraduating = bulkPromoteTo === GRADUATED_LABEL
      const now = new Date().toISOString()

      for (const s of studentsToPromote) {
        await supabase.from('profiles').update({
          class: bulkPromoteTo,
          promoted_to: null,
          promotion_status: isGraduating ? 'graduated' : 'approved',
          last_promotion_year: currentSession,
          last_promotion_term: currentTerm,
          promoted_at: now,
          promoted_by: currentUserId,
          ...(isGraduating && { graduated_at: now }),
          updated_at: now,
        }).eq('id', s.id)

        await supabase.from('promotion_history').insert({
          student_id: s.id,
          from_class: s.current_class,
          to_class: bulkPromoteTo,
          academic_year: currentSession,
          term: currentTerm,
          promoted_by: currentUserId,
          status: isGraduating ? 'graduated' : 'approved',
        })
      }

      if (isGraduating) {
        toast.success(`🎓 ${studentsToPromote.length} students graduated!`, { duration: 5000 })
      } else {
        toast.success(`🎉 Promoted ${studentsToPromote.length} students to ${bulkPromoteTo}`)
      }
      setBulkPromoteDialogOpen(false)
      setBulkPromoteClass('')
      setBulkPromoteTo('')
      await fetchStudents()
    } catch (error) {
      console.error('Bulk promote error:', error)
      toast.error('Failed to bulk promote students')
    } finally {
      setIsProcessing(false)
    }
  }, [students, bulkPromoteClass, bulkPromoteTo, user, fetchStudents, currentSession, currentTerm, canPromote])

  // ─── Guards ────────────────────────────────────────────────────────
  if (authLoading || loading || isLoadingTerm) return <LoadingScreen />

  if (!user || user.role !== 'admin') {
    router.replace('/portal')
    return null
  }

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ═══ Hero Header ══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-b border-slate-800">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="shrink-0 h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <Sparkles className="h-3 w-3 text-emerald-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/90">
                    {getTermLabel(currentTerm)} · {currentSession}
                  </span>
                  {canPromote && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-bold text-emerald-300 uppercase tracking-widest">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Promotion Window Open
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  Student Promotions
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/90 mt-1">
                  Review, approve, and manage class promotions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStudents}
                disabled={refreshing}
                className="h-9 gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline text-xs font-bold">Refresh</span>
              </Button>
              <Button
                onClick={() => setBulkPromoteDialogOpen(true)}
                disabled={stats.pendingPromotions === 0 || !canPromote}
                className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 font-bold disabled:opacity-40"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs">Bulk Promote</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5">

        {/* ─── Promotion Lock Warning ──────────────────────────────── */}
        {!canPromote && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3"
          >
            <div className="shrink-0 h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-black text-amber-900">
                🔒 Promotions are currently locked
              </p>
              <p className="text-[11px] sm:text-xs text-amber-700 mt-0.5 leading-relaxed">
                Student promotions can only be approved during{' '}
                <span className="font-bold">{PROMOTION_TERM} Term</span>.
                The current term is <span className="font-bold">{getTermLabel(currentTerm)}</span>.
                You can still view students and their history.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <StatCard label="Total" value={stats.totalStudents} icon={Users} tone="blue" subtitle="students" delay={0.05} />
          <StatCard label="Pending" value={stats.pendingPromotions} icon={Clock} tone="amber" subtitle="awaiting review" delay={0.08} />
          <StatCard label="Promoted" value={stats.approvedPromotions} icon={CheckCircle2} tone="emerald" subtitle="this year" delay={0.11} />
          <StatCard label="Graduated" value={stats.graduatedStudents} icon={GraduationCap} tone="purple" subtitle="completed SS 3" delay={0.14} />
          <StatCard label="Rejected" value={stats.rejectedPromotions} icon={AlertCircle} tone="rose" subtitle="not promoted" delay={0.17} />
          <StatCard label="Progress" value={`${stats.completionRate}%`} icon={TrendingUp} tone="blue" subtitle="completion" delay={0.2} />
        </div>

        {/* ─── Filters Bar ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-3 sm:p-4"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or admission number..."
                className="pl-9 h-10 text-sm bg-slate-50/50 border-slate-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Select value={filterStatus} onValueChange={(v: 'all' | 'pending' | 'approved' | 'rejected' | 'graduated') => setFilterStatus(v)}>
                <SelectTrigger className="h-10 text-xs w-full sm:w-[140px] font-semibold bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">⏱️ Pending</SelectItem>
                  <SelectItem value="approved">✅ Promoted</SelectItem>
                  <SelectItem value="graduated">🎓 Graduated</SelectItem>
                  <SelectItem value="rejected">❌ Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="h-10 text-xs w-full sm:w-[150px] font-semibold bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={cn(
                    'h-9 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1',
                    viewMode === 'grouped' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grouped</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'h-9 px-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-1',
                    viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {(filterStatus !== 'all' || filterClass !== 'all' || searchQuery) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing</span>
                <span className="text-xs font-black text-slate-800">{filteredStudents.length}</span>
                <span className="text-xs font-medium text-slate-500">of {students.length} students</span>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterClass('all') }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            </div>
          )}

          {viewMode === 'grouped' && groupedByClass.length > 1 && !searchQuery && filterStatus === 'all' && filterClass === 'all' && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={expandAll} className="text-[11px] font-bold text-slate-500 hover:text-slate-700">Expand all</button>
              <span className="text-slate-300">·</span>
              <button onClick={collapseAll} className="text-[11px] font-bold text-slate-500 hover:text-slate-700">Collapse all</button>
            </div>
          )}
        </motion.div>

        {/* ─── Content ─────────────────────────────────────────────── */}
        {filteredStudents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-16 text-center px-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">No students found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'No students match your search criteria.' :
                filterStatus !== 'all' ? `No ${filterStatus} promotions found.` :
                  'No students available for promotion.'}
            </p>
            {(searchQuery || filterStatus !== 'all' || filterClass !== 'all') && (
              <Button
                variant="outline" size="sm"
                onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterClass('all') }}
                className="mt-4 h-8 text-xs font-bold"
              >
                Clear filters
              </Button>
            )}
          </motion.div>
        ) : viewMode === 'grouped' ? (
          <div className="space-y-3">
            {groupedByClass.map(([classNameLabel, groupStudents]) => (
              <ClassGroup
                key={classNameLabel}
                className={classNameLabel}
                students={groupStudents}
                isExpanded={expandedGroups.has(classNameLabel)}
                onToggle={() => toggleGroup(classNameLabel)}
                onApprove={handleApprovePromotion}
                onReject={handleRejectPromotion}
                onView={handleViewStudent}
                onChangeTargetClass={handleChangeTargetClass}
                onPromoteAll={handlePromoteAllInGroup}
                canPromote={canPromote}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((s, i) => (
              <PromotionRow
                key={s.id}
                student={s}
                index={i}
                onApprove={handleApprovePromotion}
                onReject={handleRejectPromotion}
                onView={handleViewStudent}
                onChangeTargetClass={handleChangeTargetClass}
                canPromote={canPromote}
              />
            ))}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-6 mt-8 border-t border-slate-200/50">
          <p className="font-semibold text-slate-500">Vincollins Schools Admin · Promotions</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ═══ View Student Dialog ══════════════════════════════════════ */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          {viewingStudent && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg bg-gradient-to-br',
                    getAvatarGradient(viewingStudent.full_name)
                  )}>
                    {getInitials(viewingStudent.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg font-black text-slate-900 truncate">
                      {viewingStudent.full_name}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 flex items-center gap-1.5 flex-wrap text-xs mt-0.5">
                      <span className="font-mono font-semibold">{viewingStudent.admission_number}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold">Admitted {viewingStudent.admission_year}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3">
                {/* Promotion transition */}
                <div className={cn(
                  'p-4 rounded-xl border',
                  viewingStudent.promotion_status === 'graduated' || hasGraduated(viewingStudent.current_class)
                    ? 'bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200'
                    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
                )}>
                  {hasGraduated(viewingStudent.current_class) || viewingStudent.promotion_status === 'graduated' ? (
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-500/30">
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">
                        🎓 Graduated
                      </p>
                      <p className="text-sm font-black text-purple-900">
                        Completed {FINAL_CLASS}
                      </p>
                      <p className="text-[11px] text-purple-600 mt-1">
                        Successfully completed studies at Vincollins Schools
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current</p>
                        <p className="text-sm font-black text-slate-800">{viewingStudent.current_class}</p>
                      </div>
                      <div className="shrink-0">
                        <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <ArrowRight className={cn(
                            'h-4 w-4',
                            (viewingStudent.promoted_to === GRADUATED_LABEL || getNextClass(viewingStudent.current_class) === GRADUATED_LABEL)
                              ? 'text-purple-500'
                              : 'text-blue-500'
                          )} />
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className={cn(
                          'text-[9px] font-bold uppercase tracking-widest mb-1',
                          (viewingStudent.promoted_to === GRADUATED_LABEL || getNextClass(viewingStudent.current_class) === GRADUATED_LABEL)
                            ? 'text-purple-500'
                            : 'text-blue-500'
                        )}>
                          {viewingStudent.promotion_status === 'approved' ? 'Recently Moved To' :
                            viewingStudent.promotion_status === 'pending' ? 'Will Promote To' :
                              'Target'}
                        </p>
                        <p className={cn(
                          'text-sm font-black flex items-center justify-center gap-1',
                          (viewingStudent.promoted_to === GRADUATED_LABEL || getNextClass(viewingStudent.current_class) === GRADUATED_LABEL)
                            ? 'text-purple-700'
                            : 'text-blue-700'
                        )}>
                          {(viewingStudent.promoted_to === GRADUATED_LABEL || getNextClass(viewingStudent.current_class) === GRADUATED_LABEL) && (
                            <GraduationCap className="h-3 w-3" />
                          )}
                          {viewingStudent.promoted_to || getNextClass(viewingStudent.current_class) || '—'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Academic Year</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{viewingStudent.academic_year}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Term</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{getTermLabel(viewingStudent.term)}</p>
                  </div>
                </div>

                {/* Last promotion info */}
                {viewingStudent.last_promotion_year && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Last Promotion</p>
                      <p className="text-xs font-bold text-blue-800">
                        {viewingStudent.last_promotion_year} · {getTermLabel(viewingStudent.last_promotion_term || 'Third')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className={cn(
                  'p-3 rounded-xl border flex items-center justify-between',
                  viewingStudent.promotion_status === 'graduated' ? 'bg-purple-50 border-purple-200' :
                    viewingStudent.promotion_status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
                      viewingStudent.promotion_status === 'rejected' ? 'bg-rose-50 border-rose-200' :
                        'bg-amber-50 border-amber-200'
                )}>
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-widest',
                    viewingStudent.promotion_status === 'graduated' ? 'text-purple-600' :
                      viewingStudent.promotion_status === 'approved' ? 'text-emerald-600' :
                        viewingStudent.promotion_status === 'rejected' ? 'text-rose-600' :
                          'text-amber-600'
                  )}>
                    Status
                  </span>
                  <Badge className={cn(
                    'text-[10px] font-bold border',
                    viewingStudent.promotion_status === 'graduated' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      viewingStudent.promotion_status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        viewingStudent.promotion_status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                  )}>
                    {viewingStudent.promotion_status === 'graduated' ? '🎓 Graduated' :
                      viewingStudent.promotion_status.charAt(0).toUpperCase() + viewingStudent.promotion_status.slice(1)}
                  </Badge>
                </div>

                {/* Promotion History Timeline */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Promotion History
                    </p>
                    {studentHistory.length > 0 && (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] font-bold">
                        {studentHistory.length}
                      </Badge>
                    )}
                  </div>

                  {loadingHistory ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading history...
                    </div>
                  ) : studentHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No promotion history yet
                    </p>
                  ) : (
                    <div className="relative space-y-3 max-h-[200px] overflow-y-auto pr-1">
                      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />
                      {studentHistory.map((h) => (
                        <div key={h.id} className="relative flex items-start gap-2.5">
                          <div className={cn(
                            'shrink-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white z-10',
                            h.status === 'graduated' ? 'bg-purple-100' :
                              h.status === 'approved' ? 'bg-emerald-100' :
                                'bg-rose-100'
                          )}>
                            {h.status === 'graduated' ? (
                              <GraduationCap className="h-2.5 w-2.5 text-purple-600" />
                            ) : h.status === 'approved' ? (
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                            ) : (
                              <X className="h-2.5 w-2.5 text-rose-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              {h.from_class}
                              {h.from_class !== h.to_class && (
                                <>
                                  <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
                                  <span className={cn(
                                    h.status === 'graduated' ? 'text-purple-700' : 'text-emerald-700'
                                  )}>{h.to_class}</span>
                                </>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {h.academic_year} · {getTermLabel(h.term)}
                              {h.promoted_by_profile?.full_name && (
                                <> · by {h.promoted_by_profile.full_name}</>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatHistoryDate(h.promoted_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                {viewingStudent.promotion_status === 'pending' && !hasGraduated(viewingStudent.current_class) && canPromote && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleRejectPromotion(viewingStudent.id)
                        setViewDialogOpen(false)
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprovePromotion(viewingStudent.id)
                        setViewDialogOpen(false)
                      }}
                      className={cn(
                        'text-white font-bold shadow-lg',
                        getNextClass(viewingStudent.current_class) === GRADUATED_LABEL
                          ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      )}
                    >
                      {getNextClass(viewingStudent.current_class) === GRADUATED_LABEL ? (
                        <>
                          <GraduationCap className="h-4 w-4 mr-1.5" />
                          Graduate
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Approve
                        </>
                      )}
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Bulk Promote Dialog ══════════════════════════════════════ */}
      <Dialog open={bulkPromoteDialogOpen} onOpenChange={setBulkPromoteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-start gap-3 mb-1">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900">
                  Bulk Promote Students
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-0.5">
                  Promote all pending students from one class to another.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                From Class
              </label>
              <Select
                value={bulkPromoteClass}
                onValueChange={(v) => {
                  setBulkPromoteClass(v)
                  const suggested = getNextClass(v)
                  if (suggested) setBulkPromoteTo(suggested)
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select source class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.filter(c => c !== GRADUATED_LABEL).map(cls => {
                    const pendingInClass = students.filter(s => s.current_class === cls && s.promotion_status === 'pending').length
                    return (
                      <SelectItem key={cls} value={cls} disabled={pendingInClass === 0}>
                        {cls}
                        <span className="text-slate-400 ml-2 text-xs">
                          ({pendingInClass} pending)
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                To Class
              </label>
              <Select value={bulkPromoteTo} onValueChange={setBulkPromoteTo}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select destination class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_NAMES.map(cls => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                      {bulkPromoteClass && cls === getNextClass(bulkPromoteClass) && (
                        <span className="ml-2 text-emerald-600 text-xs">⭐ Suggested</span>
                      )}
                    </SelectItem>
                  ))}
                  {bulkPromoteClass === FINAL_CLASS && (
                    <SelectItem value={GRADUATED_LABEL}>
                      🎓 {GRADUATED_LABEL}
                      <span className="ml-2 text-purple-600 text-xs">⭐ Suggested</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {bulkPromoteClass && bulkPromoteTo && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-3 rounded-xl border',
                  bulkPromoteTo === GRADUATED_LABEL
                    ? 'bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      'text-[9px] font-bold uppercase tracking-widest',
                      bulkPromoteTo === GRADUATED_LABEL ? 'text-purple-600' : 'text-emerald-600'
                    )}>
                      Students to {bulkPromoteTo === GRADUATED_LABEL ? 'graduate' : 'promote'}
                    </p>
                    <p className={cn(
                      'text-lg font-black mt-0.5',
                      bulkPromoteTo === GRADUATED_LABEL ? 'text-purple-700' : 'text-emerald-700'
                    )}>
                      {students.filter(s => s.current_class === bulkPromoteClass && s.promotion_status === 'pending').length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-[9px] font-bold uppercase tracking-widest',
                      bulkPromoteTo === GRADUATED_LABEL ? 'text-purple-600' : 'text-emerald-600'
                    )}>
                      Destination
                    </p>
                    <p className={cn(
                      'text-sm font-black mt-0.5 flex items-center justify-end gap-1',
                      bulkPromoteTo === GRADUATED_LABEL ? 'text-purple-700' : 'text-emerald-700'
                    )}>
                      {bulkPromoteTo === GRADUATED_LABEL && <GraduationCap className="h-3.5 w-3.5" />}
                      {bulkPromoteTo}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkPromoteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkPromote}
              disabled={isProcessing || !bulkPromoteClass || !bulkPromoteTo}
              className={cn(
                'text-white gap-2 font-bold shadow-lg',
                bulkPromoteTo === GRADUATED_LABEL
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : bulkPromoteTo === GRADUATED_LABEL ? (
                <>
                  <GraduationCap className="h-4 w-4" />
                  Graduate All
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Promote All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}