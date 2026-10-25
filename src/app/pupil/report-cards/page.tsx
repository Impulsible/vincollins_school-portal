/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useReactToPrint } from 'react-to-print'
import {
  Loader2, Printer, ArrowLeft, TrendingUp, TrendingDown,
  School, Mail, Phone, User, Sparkles, LayoutDashboard, FileX, Lock,
  ClipboardCheck, MapPin, Calendar, Award, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── PRIMARY SUBJECTS ──────────────────────────────────────────────────────
const PRIMARY_SUBJECTS = [
  { id: 'english', name: 'English', category: 'Core' },
  { id: 'mathematics', name: 'Mathematics', category: 'Core' },
  { id: 'basic_science', name: 'Basic Science', category: 'Core' },
  { id: 'social_studies', name: 'Social Studies', category: 'Core' },
  { id: 'phonics', name: 'Phonics', category: 'Core' },
  { id: 'yoruba', name: 'Yoruba', category: 'Languages' },
  { id: 'civic_education', name: 'Civic Education', category: 'Core' },
  { id: 'creative_arts', name: 'Creative Arts', category: 'Arts' },
  { id: 'agriculture', name: 'Agriculture', category: 'Sciences' },
  { id: 'computer_education', name: 'Computer Education', category: 'Sciences' },
  { id: 'crs', name: 'Christian Religious Studies', category: 'Core' },
  { id: 'french', name: 'French', category: 'Languages' },
  { id: 'quantitative_reasoning', name: 'Quantitative Reasoning', category: 'Core' },
  { id: 'verbal_reasoning', name: 'Verbal Reasoning', category: 'Core' },
  { id: 'music', name: 'Music', category: 'Arts' },
  { id: 'handwriting', name: 'Handwriting', category: 'Core' },
  { id: 'literature', name: 'Literature', category: 'Arts' },
  { id: 'vocational_aptitude', name: 'Vocational Aptitude', category: 'Vocational' },
  { id: 'history', name: 'History', category: 'Core' },
  { id: 'security_education', name: 'Security Education', category: 'Core' },
  { id: 'home_economics', name: 'Home Economics', category: 'Vocational' },
  { id: 'phe', name: 'Physical and Health Education', category: 'Core' },
  { id: 'rhymes', name: 'Rhymes', category: 'Arts' },
  { id: 'social_norms', name: 'Social Norms', category: 'Core' },
  { id: 'sensorial', name: 'Sensorial', category: 'Core' },
  { id: 'fine_art', name: 'Fine Art', category: 'Arts' },
  { id: 'practical_life', name: 'Practical Life', category: 'Vocational' },
]

// ─── AFFECTIVE DOMAIN ──────────────────────────────────────────────────────
const AFFECTIVE_DOMAIN = [
  { id: 'honesty', name: 'Honesty' },
  { id: 'neatness', name: 'Neatness' },
  { id: 'obedience', name: 'Obedience' },
  { id: 'orderliness', name: 'Orderliness' },
  { id: 'diligence', name: 'Diligence' },
  { id: 'punctuality', name: 'Punctuality' },
  { id: 'leadership', name: 'Leadership' },
  { id: 'politeness', name: 'Politeness' },
]

// ─── PSYCHOMOTOR SKILLS ────────────────────────────────────────────────────
const PSYCHOMOTOR_SKILLS = [
  { id: 'handwriting', name: 'Handwriting' },
  { id: 'verbal_fluency', name: 'Verbal Fluency' },
  { id: 'sports', name: 'Sports' },
  { id: 'handling_tools', name: 'Handling Tools' },
  { id: 'club_activities', name: 'Club Activities' },
  { id: 'art_craft', name: 'Art & Craft' },
  { id: 'singing', name: 'Singing' },
  { id: 'dancing', name: 'Dancing' },
]

// ─── Subject Order ──────────────────────────────────────────────────────────
const SUBJECT_ORDER: Record<string, number> = {
  'English': 1, 'Mathematics': 2, 'Basic Science': 3, 'Social Studies': 4,
  'Phonics': 5, 'Yoruba': 6, 'Civic Education': 7, 'Creative Arts': 8,
  'Agriculture': 9, 'Computer Education': 10, 'Christian Religious Studies': 11,
  'French': 12, 'Quantitative Reasoning': 13, 'Verbal Reasoning': 14,
  'Music': 15, 'Handwriting': 16, 'Literature': 17, 'Vocational Aptitude': 18,
  'History': 19, 'Security Education': 20, 'Home Economics': 21,
  'Physical and Health Education': 22, 'Rhymes': 23, 'Social Norms': 24,
  'Sensorial': 25, 'Fine Art': 26, 'Practical Life': 27,
}

const MAX_SCORE_PER_SUBJECT = 100

// ─── Types ──────────────────────────────────────────────────────────────────
interface SubjectScore {
  subject: string
  subject_display: string
  ca: number
  exam: number
  total: number
  remark: string
}

interface SchoolSettings {
  name: string
  address: string
  phone: string
  email: string
  logo_url?: string
  motto?: string
  next_term_resume?: string | null
}

interface TermOption {
  value: string
  label: string
}

interface AttendanceData {
  totalDays: number
  daysPresent: number
  daysAbsent: number
  daysLate: number
}

// ─── Default school ──────────────────────────────────────────────────────────
const DEFAULT_SCHOOL: SchoolSettings = {
  name: 'VINCOLLINS SCHOOLS',
  address: '7/9 Lawani Street, off Ishaga Rd, Surulere, Lagos',
  phone: '+234 907 082 9999',
  email: 'vincollinsschools@gmail.com',
  motto: 'Geared Towards Excellence',
}

// ─── Global Utility Helper Functions ───────────────────────────────────────
const normalizeSubjectName = (name: string): string => {
  const map: Record<string, string> = {
    'English': 'English', 'Eng': 'English',
    'Math': 'Mathematics', 'Maths': 'Mathematics', 'Mathematics': 'Mathematics',
    'Agric': 'Agriculture', 'Agriculture': 'Agriculture',
    'CRK': 'Christian Religious Studies', 'CRS': 'Christian Religious Studies', 'Christian Religious Studies': 'Christian Religious Studies',
    'Civic': 'Civic Education', 'Civic Education': 'Civic Education',
    'CCA': 'Creative Arts', 'Art': 'Creative Arts', 'Creative Arts': 'Creative Arts',
    'Yor': 'Yoruba', 'Yoruba': 'Yoruba', 'French': 'French',
    'Security': 'Security Education', 'Sec Ed': 'Security Education', 'Security Education': 'Security Education',
    'PHE': 'Physical and Health Education', 'Physical and Health Education': 'Physical and Health Education',
    'H. Econ': 'Home Economics', 'Home Econ': 'Home Economics', 'Home Economics': 'Home Economics',
    'Vocational': 'Vocational Aptitude', 'Vocational Aptitude': 'Vocational Aptitude',
    'Quant': 'Quantitative Reasoning', 'Quantitative Reasoning': 'Quantitative Reasoning',
    'Verbal': 'Verbal Reasoning', 'Verbal Reasoning': 'Verbal Reasoning',
    'Rhyme': 'Rhymes', 'Rhymes': 'Rhymes',
    'Social Norm': 'Social Norms', 'Social Norms': 'Social Norms', 'SN': 'Social Norms',
    'Sensory': 'Sensorial', 'Sensorial': 'Sensorial',
    'Fine Arts': 'Fine Art', 'Fine Art': 'Fine Art', 'FA': 'Fine Art',
    'PL': 'Practical Life', 'Practical Life': 'Practical Life',
  }
  return map[name] || name
}

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  'Christian Religious Studies': 'Christian Religious Studies',
  'Physical and Health Education': 'Physical and Health Education',
  'Computer Education': 'Computer Education',
  'Quantitative Reasoning': 'Quantitative Reasoning',
  'Verbal Reasoning': 'Verbal Reasoning',
  'Creative Arts': 'Creative Arts',
  'Home Economics': 'Home Economics',
  'Security Education': 'Security Education',
  'Vocational Aptitude': 'Vocational Aptitude',
  'Basic Science': 'Basic Science',
  'Social Studies': 'Social Studies',
  'Civic Education': 'Civic Education',
  'Social Norms': 'Social Norms',
  'Practical Life': 'Practical Life',
}

// ─── SCHOOL LEVEL RESOLUTION ───────────────────────────────────────────────
export type SchoolLevel = 'Primary' | 'Nursery' | 'Kindergarten' | 'Playgroup'

const getSchoolLevel = (className?: string): SchoolLevel => {
  if (!className) return 'Primary'
  const lower = className.toLowerCase().trim()

  // Kindergarten FIRST — must precede Playgroup so "kg" isn't swallowed
  if (lower.includes('kindergarten') || /\bkg\b/.test(lower)) {
    return 'Kindergarten'
  }

  if (lower.includes('primary') || (lower.includes('p') && /\d/.test(lower)) ||
      ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].some(p => lower.includes(p)) ||
      lower.includes('basic')) {
    return 'Primary'
  }

  if (lower.includes('nursery') || lower.includes('n1') || lower.includes('n2') ||
      lower.includes('n3') || lower.includes('creche') || lower.includes('toddler')) {
    return 'Nursery'
  }

  // Playgroup only — pre-school / preschool no longer lumped with Kindergarten
  if (lower.includes('playgroup') || lower.includes('play group') ||
      lower.includes('pre-school') || lower.includes('preschool')) {
    return 'Playgroup'
  }

  return 'Primary'
}

const getFullSchoolName = (school: SchoolSettings, className?: string): string => {
  const level = getSchoolLevel(className)
  const baseName = school.name.replace(/\s*SCHOOLS?\s*$/i, '').trim()
  return `${baseName} ${level}`
}

// ─── REPORT SUBJECT RESOLUTION (score-driven, all levels) ─────────────────
/**
 * Builds the ready-to-render subject rows for a report card.
 * Renders ONLY subjects the student actually has scores for — for every class
 * level (Primary, Nursery, Kindergarten, Playgroup). Order follows SUBJECT_ORDER.
 */
const buildReportSubjectRows = (scores: SubjectScore[]): SubjectScore[] => {
  const hasScore = (s: SubjectScore) =>
    (Number(s.ca) || 0) > 0 ||
    (Number(s.exam) || 0) > 0 ||
    (Number(s.total) || 0) > 0

  const byName = new Map<string, SubjectScore>()
  for (const s of scores) {
    if (!s?.subject || !hasScore(s)) continue
    const name = normalizeSubjectName(s.subject)
    const existing = byName.get(name)
    if (!existing || (Number(s.total) || 0) > (Number(existing.total) || 0)) {
      byName.set(name, { ...s, subject: name })
    }
  }

  return Array.from(byName.values())
    .sort((a, b) => {
      const oa = SUBJECT_ORDER[a.subject] ?? 999
      const ob = SUBJECT_ORDER[b.subject] ?? 999
      if (oa !== ob) return oa - ob
      return a.subject.localeCompare(b.subject)
    })
    .map(s => ({
      ...s,
      subject_display: SUBJECT_DISPLAY_NAMES[s.subject] ?? s.subject_display ?? s.subject,
    }))
}

const getRemark = (score: number): string => {
  if (score >= 80) return 'Excellent'
  else if (score >= 70) return 'Very Good'
  else if (score >= 60) return 'Good'
  else if (score >= 50) return 'Satisfactory'
  else if (score >= 45) return 'Average'
  else if (score > 0) return 'Fair'
  else return 'Not graded'
}

const getRemarkPillColor = (remark: string): string => {
  const colors: Record<string, string> = {
    'Excellent': 'bg-emerald-600 text-white',
    'Very Good': 'bg-blue-600 text-white',
    'Good': 'bg-cyan-600 text-white',
    'Satisfactory': 'bg-amber-600 text-white',
    'Average': 'bg-orange-600 text-white',
    'Fair': 'bg-rose-600 text-white',
    'Not graded': 'bg-slate-400 text-white',
  }
  return colors[remark] || 'bg-slate-400 text-white'
}

const generateRatings = (averageScore: number) => {
  const baseRating = (avg: number): number => {
    if (avg >= 80) return 5
    if (avg >= 70) return 4
    if (avg >= 60) return 3
    if (avg >= 50) return 2
    return 1
  }
  const base = baseRating(averageScore)
  return {
    affective: AFFECTIVE_DOMAIN.map((item, index) => ({
      ...item,
      rating: Math.min(5, Math.max(1, base + (index % 2 === 0 ? 1 : 0) - 1)),
    })),
    psychomotor: PSYCHOMOTOR_SKILLS.map((item, index) => ({
      ...item,
      rating: Math.min(5, Math.max(1, base + (index % 3 === 0 ? 1 : 0) - 1)),
    })),
  }
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-[1px]">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-2 w-2 print:h-[7px] print:w-[7px]',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          )}
        />
      ))}
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PupilReportCardPage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [school, setSchool] = useState<SchoolSettings>(DEFAULT_SCHOOL)

  // ─── Term State with Fallback ──────────────────────────────────────────────
  const [availableTerms, setAvailableTerms] = useState<TermOption[]>([
    { value: 'First', label: 'First' },
    { value: 'Second', label: 'Second' },
    { value: 'Third', label: 'Third' },
  ])
  const [availableYears, setAvailableYears] = useState<string[]>(['2026/2027'])
  const [selectedTerm, setSelectedTerm] = useState('First')
  const [selectedYear, setSelectedYear] = useState('2026/2027')

  const [student, setStudent] = useState<any>(null)
  const [reportCard, setReportCard] = useState<any>(null)
  const [subjects, setSubjects] = useState<SubjectScore[]>([])
  const [hasReport, setHasReport] = useState(false)
  const [reportNotPublished, setReportNotPublished] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [overallRemark, setOverallRemark] = useState('')
  const [teacherComment, setTeacherComment] = useState('')
  const [principalComment, setPrincipalComment] = useState('')
  const [classTeacher, setClassTeacher] = useState('Class Teacher')
  const [attendance, setAttendance] = useState<AttendanceData>({
    totalDays: 0, daysPresent: 0, daysAbsent: 0, daysLate: 0,
  })
  const [resumptionDate, setResumptionDate] = useState<string | null>(null)

  // ─── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Report_${student?.display_name || 'Student'}_${selectedTerm}_${selectedYear}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }

      @media print {
        html,
        body {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          overflow: visible !important;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .no-print {
          display: none !important;
        }

        .print-card {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `,
  })

  // ─── Load school settings ──────────────────────────────────────────────────
  const loadSchoolSettings = useCallback(async () => {
    try {
      const { data } = await supabase.from('school_settings').select('*').maybeSingle()
      if (data) {
        setSchool({
          name: data.school_name || DEFAULT_SCHOOL.name,
          address: data.school_address || DEFAULT_SCHOOL.address,
          phone: data.school_phone || DEFAULT_SCHOOL.phone,
          email: data.school_email || DEFAULT_SCHOOL.email,
          logo_url: data.logo_path,
          motto: data.school_motto || DEFAULT_SCHOOL.motto,
          next_term_resume: data.next_term_resume || data.next_term_resumption_date || null,
        })
      }
    } catch (error) {
      console.error('Error loading school settings:', error)
    }
  }, [])

  // ─── Load terms from database (hardened for unknown schemas) ───────────────
  const loadTerms = useCallback(async () => {
    try {
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select('*')

      if (termsError) {
        console.warn('terms query failed, using defaults:', termsError.message)
      }

      if (!termsError && termsData && termsData.length > 0) {
        const normalized = termsData.map((t: any) => {
          const termCode = (
            t.term_code || t.term || t.code || t.name || t.term_name || ''
          ).toString().trim()

          const termName = (
            t.term_name || t.name || t.label || t.term || t.term_code || termCode
          ).toString().trim()

          const sessionYear = (
            t.session_year || t.academic_year || t.session || t.year || ''
          ).toString().trim()

          return { termCode, termName, sessionYear }
        }).filter((t: any) => t.termCode)

        const termMap = new Map<string, string>()
        normalized.forEach((t: any) => {
          const value = t.termCode.replace(/\s*term\s*/i, '').trim() || t.termCode
          const label = t.termName.replace(/\s*term\s*/i, '').trim() || value
          if (value && !termMap.has(value)) {
            termMap.set(value, label)
          }
        })

        if (termMap.size > 0) {
          const order = ['First', 'Second', 'Third', '1st', '2nd', '3rd']
          const terms: TermOption[] = Array.from(termMap.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => {
              const ai = order.findIndex(o => o.toLowerCase() === a.value.toLowerCase())
              const bi = order.findIndex(o => o.toLowerCase() === b.value.toLowerCase())
              if (ai === -1 && bi === -1) return a.label.localeCompare(b.label)
              if (ai === -1) return 1
              if (bi === -1) return -1
              return ai - bi
            })
          setAvailableTerms(terms)
        }

        const years = [
          ...new Set(
            normalized
              .map((t: any) => t.sessionYear)
              .filter(Boolean)
          ),
        ].sort((a, b) => b.localeCompare(a))

        if (years.length > 0) setAvailableYears(years)
      }

      const { data: settings } = await supabase
        .from('school_settings')
        .select('*')
        .maybeSingle()

      if (settings) {
        const currentTerm = (
          settings.current_term || settings.term || settings.active_term || ''
        ).toString().replace(/\s*term\s*/i, '').trim()

        const currentSession = (
          settings.current_session ||
          settings.current_academic_year ||
          settings.session_year ||
          settings.academic_year ||
          ''
        ).toString().trim()

        if (currentTerm) setSelectedTerm(currentTerm)
        if (currentSession) setSelectedYear(currentSession)
      }
    } catch (error) {
      console.error('Error loading terms:', error)
    }
  }, [])

  // ─── Fetch Next Term Resumption Date ────────────────────────────────────────
  const fetchResumptionDate = useCallback(async (currentTerm?: string, currentSession?: string) => {
    try {
      const { data: sysSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'next_term_date')
        .maybeSingle()

      if (sysSetting?.value) return sysSetting.value

      if (currentSession) {
        const termCodeLower = (currentTerm || 'first').toLowerCase()
        const nextTermMap: Record<string, string[]> = {
          first: ['second', '2nd', 'Second', 'second_term'],
          second: ['third', '3rd', 'Third', 'third_term'],
          third: ['first', '1st', 'First', 'first_term'],
        }
        const targetNextCodes = nextTermMap[termCodeLower] || ['second', 'Second']

        try {
          const { data: nextTermRow } = await supabase
            .from('terms')
            .select('*')
            .eq('session_year', currentSession)
            .in('term_code', targetNextCodes)
            .maybeSingle()

          if (nextTermRow?.start_date) return nextTermRow.start_date
        } catch (innerErr) {
          console.warn('Next term lookup failed:', innerErr)
        }
      }

      const { data: schoolSet } = await supabase
        .from('school_settings')
        .select('next_term_resume, next_term_resumption_date, next_term_start')
        .maybeSingle()

      if (schoolSet) {
        return schoolSet.next_term_resume || schoolSet.next_term_resumption_date || schoolSet.next_term_start || null
      }
    } catch (err) {
      console.warn('Error fetching next term resumption date:', err)
    }
    return null
  }, [])

  // ─── Load Attendance ─────────────────────────────────────────────────────
  const loadAttendance = useCallback(
    async (sid: string, termVal: string, sessionVal: string) => {
      try {
        const cleanTerm = (termVal || 'First').trim()
        const termVariants = [
          cleanTerm,
          cleanTerm.toLowerCase(),
          cleanTerm.toUpperCase(),
          cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1).toLowerCase(),
          `${cleanTerm} Term`,
          `${cleanTerm.toLowerCase()} term`,
        ]
        const uniqueTerms = Array.from(new Set(termVariants.filter(Boolean)))

        const { data: recordsData } = await supabase
          .from('attendance_records')
          .select('status, date')
          .eq('student_id', sid)
          .in('term_code', uniqueTerms)
          .eq('session_year', sessionVal)

        let rowsToParse = recordsData || []

        if (rowsToParse.length === 0) {
          const { data: attTableData } = await supabase
            .from('attendance')
            .select('status, date')
            .eq('student_id', sid)
            .in('term', uniqueTerms)
            .eq('session_year', sessionVal)

          if (attTableData && attTableData.length > 0) rowsToParse = attTableData
        }

        if (rowsToParse.length > 0) {
          let present = 0, absent = 0, late = 0, total = 0

          for (const r of rowsToParse) {
            const rawStatus = (r.status || '').toString().trim().toLowerCase()
            if (rawStatus === 'present' || rawStatus === 'p') { present++; total++ }
            else if (rawStatus === 'absent' || rawStatus === 'a') { absent++; total++ }
            else if (rawStatus === 'late' || rawStatus === 'l') { late++; total++ }
          }

          if (total > 0) {
            setAttendance({ totalDays: total, daysPresent: present, daysAbsent: absent, daysLate: late })
            return
          }
        }

        setAttendance({ totalDays: 0, daysPresent: 0, daysAbsent: 0, daysLate: 0 })
      } catch (error) {
        console.error('Error loading attendance:', error)
        setAttendance({ totalDays: 0, daysPresent: 0, daysAbsent: 0, daysLate: 0 })
      }
    },
    []
  )

  // ─── Load scores + report card ──────────────────────────────────────────
  const loadScores = useCallback(async () => {
    setLoading(true)
    setHasReport(false)
    setReportNotPublished(false)
    setSubjects([])
    setTotalScore(0)
    setAverageScore(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/portal'); return }

      // ─── 1. Get student profile ──────────────────────────────────────────
      const { data: sd, error: sdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (sdError || !sd) {
        console.error('Error fetching profile:', sdError)
        toast.error('Profile not found')
        setLoading(false)
        return
      }
      setStudent(sd)

      // ─── 2. Fetch all student report cards to match in memory safely ─────
      const { data: reportCardsList, error: rcListError } = await supabase
        .from('report_cards')
        .select('*')
        .eq('student_id', user.id)

      if (rcListError) {
        console.error('Error fetching report card:', rcListError)
      }

      const cleanTerm = selectedTerm.toLowerCase().replace(/term/i, '').trim()
      const cleanYear = selectedYear.trim()

      const matchedCard = (reportCardsList || []).find((rc: any) => {
        const rcTerm = (rc.term || rc.term_name || rc.term_code || '').toLowerCase().replace(/term/i, '').trim()
        const rcYear = (rc.academic_year || rc.session_year || rc.session || '').trim()
        return rcTerm === cleanTerm && rcYear === cleanYear
      })

      if (!matchedCard) {
        setHasReport(false)
        setLoading(false)
        return
      }

      if (matchedCard.status !== 'published') {
        setHasReport(false)
        setReportNotPublished(true)
        setLoading(false)
        return
      }

      setReportCard(matchedCard)

      // ─── 3. Get Class Teacher Name ─────────────────────────────────────────
      const className = matchedCard.class || matchedCard.class_name || sd.class
      if (className) {
        const { data: teacherClassData } = await supabase
          .from('teacher_classes')
          .select(`
            teacher:profiles!teacher_classes_teacher_id_fkey (
              full_name,
              display_name
            )
          `)
          .eq('class_name', className)
          .maybeSingle()

        if (teacherClassData?.teacher) {
          const tProfile: any = teacherClassData.teacher
          setClassTeacher(tProfile.full_name || tProfile.display_name || 'Class Teacher')
        } else if (matchedCard.generated_by) {
          const { data: genUser } = await supabase
            .from('profiles')
            .select('full_name, display_name')
            .eq('id', matchedCard.generated_by)
            .maybeSingle()
          if (genUser) {
            setClassTeacher(genUser.full_name || genUser.display_name || 'Class Teacher')
          }
        }
      } else if (matchedCard.generated_by) {
        const { data: genUser } = await supabase
          .from('profiles')
          .select('full_name, display_name')
          .eq('id', matchedCard.generated_by)
          .maybeSingle()
        if (genUser) {
          setClassTeacher(genUser.full_name || genUser.display_name || 'Class Teacher')
        }
      }

      // ─── 4. Resumption Date & Attendance ──────────────────────────────────
      const dynamicResume = await fetchResumptionDate(selectedTerm, selectedYear)
      if (dynamicResume) setResumptionDate(dynamicResume)

      await loadAttendance(user.id, selectedTerm, selectedYear)

      // ─── 5. Load Subject Scores from primary_scores ───────────────────────
      const { data: scores, error: scoresError } = await supabase
        .from('primary_scores')
        .select('*')
        .eq('student_id', user.id)
        .eq('term', selectedTerm)
        .eq('academic_year', selectedYear)

      let rawScores = scores || []

      if (rawScores.length === 0 && (matchedCard.subjects || matchedCard.subjects_data)) {
        rawScores = matchedCard.subjects || matchedCard.subjects_data || []
      }

      if (rawScores.length === 0) {
        setHasReport(false)
        setLoading(false)
        return
      }

      // ─── 6. Build raw SubjectScore[] from DB rows ──────────────────────────
      const processed: SubjectScore[] = rawScores.map((s: any) => {
        const ca = Number(s.ca_score ?? s.ca ?? 0)
        const exam = Number(s.exam_score ?? s.exam ?? 0)
        const total = Number(s.total ?? (ca + exam))
        const remark = s.remark || getRemark(total)
        const rawName = s.subject || s.name || 'Subject'
        const canonicalName = normalizeSubjectName(rawName)

        return {
          subject: canonicalName,
          subject_display: canonicalName,
          ca,
          exam,
          total,
          remark,
        }
      })

      // ─── 7. Score-driven rendering for ALL class levels ─────────────────────
      const sortedSubjects = buildReportSubjectRows(processed)
      setSubjects(sortedSubjects)
      setHasReport(true)

      const total = sortedSubjects.reduce((sum, s) => sum + s.total, 0)
      const avg = sortedSubjects.length > 0 ? total / sortedSubjects.length : 0
      setTotalScore(total)
      setAverageScore(avg)
      setOverallRemark(getRemark(avg))

      const tComment = matchedCard.teacher_comment || matchedCard.teacher_comments || matchedCard.teacher_remark || ''
      const pComment = matchedCard.principal_comment || matchedCard.principal_comments || matchedCard.principal_remark || matchedCard.headmaster_comment || ''
      setTeacherComment(tComment)
      setPrincipalComment(pComment)

    } catch (e) {
      console.error('Error loading report card:', e)
      toast.error('Failed to load report card')
    } finally {
      setLoading(false)
    }
  }, [selectedTerm, selectedYear, router, fetchResumptionDate, loadAttendance])

  // ─── Initial Load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadSchoolSettings(), loadTerms()])
    }
    init()
  }, [loadSchoolSettings, loadTerms])

  useEffect(() => {
    if (selectedTerm && selectedYear) loadScores()
  }, [selectedTerm, selectedYear, loadScores])

  const ratings = generateRatings(averageScore)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading report card…</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] p-4">
        <p className="text-red-600 font-medium text-sm text-center">Student profile not found.</p>
        <Button onClick={() => router.back()} size="sm">Go Back</Button>
      </div>
    )
  }

  const fullName = student.display_name || student.full_name || 'Student'
  const fmtAvg = averageScore.toFixed(2)
  const termLabel = availableTerms.find(t => t.value === selectedTerm)?.label || selectedTerm
  const academicYear = selectedYear
  const totalMarksObtained = totalScore
  const totalMarksObtainable = subjects.length * MAX_SCORE_PER_SUBJECT
  const attendancePercentage = attendance.totalDays > 0
    ? Math.round((attendance.daysPresent / attendance.totalDays) * 100)
    : 0

  const bestSubject = subjects.length > 0 ? subjects.reduce((a, b) => a.total > b.total ? a : b) : null
  const worstSubject = subjects.length > 0 ? subjects.reduce((a, b) => a.total < b.total ? a : b) : null

  const getResumeDateString = () => {
    const rawDate = resumptionDate || school.next_term_resume
    if (rawDate) {
      try {
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        }
      } catch {}
      return rawDate
    }
    const nextTermDate = new Date()
    nextTermDate.setDate(nextTermDate.getDate() + 84)
    return nextTermDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const nextTermFormatted = getResumeDateString()
  const fullSchoolName = getFullSchoolName(school, student?.class || reportCard?.class)

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-24 sm:pb-6 space-y-3 sm:space-y-4 print:p-0 print:max-w-none print:space-y-0 bg-slate-100 print:bg-white min-h-screen">

      {/* ─── Controls Bar ─── */}
      <div className="no-print bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-1.5">
              📄 <span>My Report Card</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              View &amp; print your performance report
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline" size="sm"
              onClick={() => router.push('/pupil/dashboard')}
              className="h-8 text-xs px-2 sm:px-3 gap-1"
            >
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => router.back()}
              className="h-8 text-xs px-2 sm:px-3 gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-0.5 flex-1 min-w-[100px] max-w-[160px]">
            <label className="text-[10px] sm:text-xs font-medium text-gray-500 block">Term</label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full bg-white">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {availableTerms.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-xs sm:text-sm">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-0.5 flex-1 min-w-[90px] max-w-[140px]">
            <label className="text-[10px] sm:text-xs font-medium text-gray-500 block">Session</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full bg-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y} className="text-xs sm:text-sm">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasReport && (
            <Button
              onClick={handlePrint}
              className="h-8 sm:h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 gap-1.5 ml-auto shrink-0"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline">Print / </span>Download
            </Button>
          )}
        </div>
      </div>

      {/* ─── Empty / Unreleased States ─── */}
      {!hasReport && reportNotPublished && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm py-12 sm:py-16 px-4 sm:px-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
            Report Card Not Yet Released
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            Your report card for {termLabel} Term, {selectedYear} has been prepared but not yet released.
          </p>
        </div>
      )}

      {!hasReport && !reportNotPublished && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-12 sm:py-16 px-4 sm:px-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileX className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
            No Report Card Available
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            No approved report card found for {fullName} for {termLabel} Term, {selectedYear}.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  REPORT CARD — FULL PREMIUM CERTIFICATE PRINT LAYOUT            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {hasReport && (
        <div ref={printRef} className="print-card">
          <div className="bg-white w-full shadow-xl print:shadow-none relative overflow-hidden">
            {/* Outer Decorative Board Frame */}
            <div className="absolute inset-0 border-[4px] border-blue-800 print:border-blue-900 pointer-events-none" style={{ zIndex: 20 }} />
            <div className="absolute inset-[6px] border-[2px] border-blue-600 print:border-blue-700 pointer-events-none" style={{ zIndex: 20 }} />
            <div className="absolute inset-[10px] border-[1px] border-blue-400/60 pointer-events-none" style={{ zIndex: 20 }} />

            {/* Corner Ornaments */}
            <div className="absolute top-[10px] left-[10px] w-5 h-5 border-t-[3px] border-l-[3px] border-amber-500 rounded-tl-md pointer-events-none" style={{ zIndex: 21 }} />
            <div className="absolute top-[10px] right-[10px] w-5 h-5 border-t-[3px] border-r-[3px] border-amber-500 rounded-tr-md pointer-events-none" style={{ zIndex: 21 }} />
            <div className="absolute bottom-[10px] left-[10px] w-5 h-5 border-b-[3px] border-l-[3px] border-amber-500 rounded-bl-md pointer-events-none" style={{ zIndex: 21 }} />
            <div className="absolute bottom-[10px] right-[10px] w-5 h-5 border-b-[3px] border-r-[3px] border-amber-500 rounded-br-md pointer-events-none" style={{ zIndex: 21 }} />

            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
              {school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt=""
                  className="w-[380px] h-[380px] sm:w-[450px] sm:h-[450px] print:w-[400px] print:h-[400px] object-contain select-none"
                  style={{ opacity: 0.08, filter: 'grayscale(20%)' }}
                  draggable={false}
                />
              ) : (
                <School className="w-[350px] h-[350px] text-blue-900" style={{ opacity: 0.06 }} />
              )}
            </div>

            {/* Content Container */}
            <div className="relative p-4 sm:p-5 print:p-3" style={{ zIndex: 2 }}>

              {/* Header Grid */}
              <div className="flex items-start gap-3 sm:gap-4 pb-2">
                {/* School Logo */}
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 print:w-14 print:h-14 border-2 border-blue-800 rounded-lg flex items-center justify-center bg-white p-1 shadow-sm">
                  {school.logo_url ? (
                    <img src={school.logo_url} alt="School logo" className="w-full h-full object-contain" />
                  ) : (
                    <School className="h-7 w-7 text-blue-800" />
                  )}
                </div>

                {/* School Info */}
                <div className="flex-1 text-center min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-[22px] print:text-lg font-black text-blue-900 tracking-wide leading-none uppercase">
                    {fullSchoolName}
                  </h1>
                  <div className="flex items-center justify-center gap-1 mt-1 text-[9px] sm:text-[10px] print:text-[9px] text-slate-600">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-blue-600" />
                    <span>{school.address}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mt-0.5 text-[9px] sm:text-[10px] print:text-[9px] text-slate-600 flex-wrap">
                    <span className="flex items-center gap-0.5">
                      <Mail className="h-2.5 w-2.5 text-blue-600" />
                      {school.email}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Phone className="h-2.5 w-2.5 text-blue-600" />
                      {school.phone}
                    </span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 bg-amber-50/90 border border-amber-200 rounded-full px-3 py-0.5">
                    <Award className="h-2.5 w-2.5 text-amber-600" />
                    <p className="text-[9px] sm:text-[10px] print:text-[9px] italic text-amber-700 font-semibold">
                      "{school.motto}"
                    </p>
                  </div>
                </div>

                {/* Student Photo — Passport size */}
                <div
                  className={cn(
                    "shrink-0 overflow-hidden bg-slate-50 shadow-sm border-2 border-blue-800",
                    "w-[56px] h-[72px] sm:w-[68px] sm:h-[90px] print:w-[65px] print:h-[85px]",
                    "rounded-sm"
                  )}
                >
                  {student?.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt="Student passport photo"
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
                      <User className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Title Bar */}
              <div className="relative my-2">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 rounded-md" />
                <div className="relative text-center py-1.5 px-4">
                  <h2 className="text-sm sm:text-[15px] print:text-[13px] font-black text-white uppercase tracking-[0.15em] leading-tight">
                    Student Performance Report Card
                  </h2>
                  <div className="flex items-center justify-center gap-4 mt-0.5">
                    <p className="text-[10px] sm:text-[11px] print:text-[10px] font-semibold text-blue-200">Session: {academicYear}</p>
                    <span className="text-blue-400 text-[10px]">•</span>
                    <p className="text-[10px] sm:text-[11px] print:text-[10px] font-semibold text-blue-200">{termLabel} Term</p>
                  </div>
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="bg-gradient-to-r from-slate-50/85 to-blue-50/70 backdrop-blur-[1px] border border-blue-200 rounded-lg px-3 py-2 my-2">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] print:text-[9.5px]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Name:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{fullName}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Adm. No:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{student.admission_number || student.vin_id || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Class:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{reportCard?.class || student.class || '—'}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Term:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{termLabel} Term</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Session:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{academicYear}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Resumes:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{nextTermFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Main Score Grid + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_215px] gap-2 print:grid print:grid-cols-[1fr_200px] print:gap-2 items-stretch">

                {/* Score list column */}
                <div className="min-w-0 flex flex-col gap-2">
                  <div className="border-2 border-blue-800 rounded-lg overflow-hidden bg-white/90">
                    <table className="w-full text-[9.5px] sm:text-[10px] print:text-[9px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-800 to-blue-700 text-white">
                          <th className="px-1.5 py-1 text-left font-black text-[9px] uppercase tracking-wide">Subject</th>
                          <th className="px-1 py-1 text-center font-black text-[9px] w-9 uppercase">CA</th>
                          <th className="px-1 py-1 text-center font-black text-[9px] w-9 uppercase">Exam</th>
                          <th className="px-1 py-1 text-center font-black text-[9px] w-10 uppercase">Total</th>
                          <th className="px-1.5 py-1 text-center font-black text-[9px] uppercase">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((s, i) => (
                          <tr key={i} className={cn(
                            'border-b border-blue-100 last:border-0',
                            i % 2 === 0 ? 'bg-white/85' : 'bg-blue-50/60'
                          )}>
                            <td className="px-1.5 py-[3px] font-semibold text-slate-800 leading-tight border-r border-blue-100">{s.subject_display || s.subject}</td>
                            <td className="px-1 py-[3px] text-center font-bold text-slate-700 tabular-nums border-r border-blue-100">{s.ca}</td>
                            <td className="px-1 py-[3px] text-center font-bold text-slate-700 tabular-nums border-r border-blue-100">{s.exam}</td>
                            <td className="px-1 py-[3px] text-center font-black tabular-nums border-r border-blue-100">
                              <span className={cn(
                                'inline-block w-7 text-center rounded-sm py-[1px] text-[9px]',
                                s.total >= 70 ? 'bg-emerald-100 text-emerald-800' :
                                s.total >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                              )}>
                                {s.total}
                              </span>
                            </td>
                            <td className="px-1.5 py-[3px] text-center">
                              <span className={cn(
                                'inline-block px-1.5 py-[1px] rounded-full text-[8px] font-bold tracking-wide',
                                getRemarkPillColor(s.remark)
                              )}>
                                {s.remark}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gradient-to-r from-blue-100 to-blue-50 border-t-2 border-blue-800">
                          <td className="px-1.5 py-1.5 text-left font-black text-[9px] text-blue-900 uppercase tracking-wide border-r border-blue-200">Total / Average</td>
                          <td colSpan={2} className="px-1 py-1.5 border-r border-blue-200"></td>
                          <td className="px-1 py-1.5 text-center font-black text-[11px] text-blue-900 border-r border-blue-200">{totalScore}</td>
                          <td className="px-1.5 py-1.5 text-center font-black text-[11px] text-blue-900">{fmtAvg}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Class Teacher Remark Panel */}
                  <div className="border-2 border-purple-700 rounded-lg overflow-hidden flex-1 flex flex-col bg-white/90 min-h-[85px]">
                    <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <Sparkles className="h-2.5 w-2.5" />
                      Class Teacher's Remark
                    </div>
                    <div className="flex-1 p-2 text-[9px] italic leading-relaxed bg-gradient-to-r from-purple-50/50 to-white/70">
                      {teacherComment || <span className="text-slate-400 not-italic">No teacher remark entered yet.</span>}
                    </div>
                    <div className="px-2 py-0.5 text-[8px] text-purple-700 border-t border-purple-200 bg-purple-50/40 font-bold flex items-center justify-between shrink-0">
                      <span>Signed: {classTeacher}</span>
                      <span className="border-b border-dotted border-purple-400 w-16 inline-block" />
                    </div>
                  </div>

                  {/* Head Master/Mistress Remark Panel */}
                  <div className="border-2 border-blue-700 rounded-lg overflow-hidden flex-1 flex flex-col bg-white/90 min-h-[85px]">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <ClipboardCheck className="h-2.5 w-2.5" />
                      Head Master/Mistress's Remark
                    </div>
                    <div className="flex-1 p-2 text-[9px] italic leading-relaxed bg-gradient-to-r from-blue-50/50 to-white/70">
                      {principalComment || <span className="text-slate-400 not-italic">No remark entered yet.</span>}
                    </div>
                    <div className="px-2 py-0.5 text-[8px] text-blue-700 border-t border-blue-200 bg-blue-50/40 font-bold flex items-center justify-between shrink-0">
                      <span>Signed: Head Master/Mistress</span>
                      <span className="border-b border-dotted border-blue-400 w-16 inline-block" />
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="flex flex-col gap-1.5">
                  {/* Performance Panel */}
                  <div className="border-2 border-blue-800 rounded-lg overflow-hidden bg-white/90">
                    <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1">
                      <Award className="h-2.5 w-2.5" /> Performance
                    </div>
                    <div className="p-1.5 space-y-1 text-[9px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Obtained</span>
                        <span className="font-black text-slate-900 tabular-nums">{totalMarksObtained}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Obtainable</span>
                        <span className="font-black text-slate-900 tabular-nums">{totalMarksObtainable}</span>
                      </div>
                      <div className="h-px bg-blue-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Average</span>
                        <span className="font-black text-blue-800 text-[11px] tabular-nums">{fmtAvg}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Overall</span>
                        <span className={cn('font-bold px-1.5 py-[1px] rounded-full text-[8px]', getRemarkPillColor(overallRemark))}>
                          {overallRemark}
                        </span>
                      </div>
                      {bestSubject && (
                        <>
                          <div className="h-px bg-emerald-200 mt-0.5" />
                          <div className="flex justify-between items-start">
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[8px]">
                              <TrendingUp className="h-2 w-2" /> Best
                            </span>
                            <span className="font-black text-emerald-700 text-right text-[8px] leading-tight">
                              {bestSubject.subject_display || bestSubject.subject}
                              <span className="block text-[7px]">({bestSubject.total}%)</span>
                            </span>
                          </div>
                        </>
                      )}
                      {worstSubject && (
                        <div className="flex justify-between items-start">
                          <span className="text-rose-600 font-bold flex items-center gap-0.5 text-[8px]">
                            <TrendingDown className="h-2 w-2" /> Improve
                          </span>
                          <span className="font-black text-rose-600 text-right text-[8px] leading-tight">
                            {worstSubject.subject_display || worstSubject.subject}
                            <span className="block text-[7px]">({worstSubject.total}%)</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Panel */}
                  <div className="border-2 border-blue-800 rounded-lg overflow-hidden bg-white/90">
                    <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> Attendance
                    </div>
                    <div className="p-1.5 space-y-0.5 text-[9px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-semibold">Total</span>
                        <span className="font-black text-slate-900 tabular-nums">
                          {attendance.totalDays > 0 ? attendance.totalDays : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700 font-semibold">Present</span>
                        <span className="font-black text-emerald-700 tabular-nums">
                          {attendance.totalDays > 0 ? attendance.daysPresent : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-rose-600 font-semibold">Absent</span>
                        <span className="font-black text-rose-600 tabular-nums">
                          {attendance.totalDays > 0 ? attendance.daysAbsent : "—"}
                        </span>
                      </div>
                      {attendance.daysLate > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-600 font-semibold">Late</span>
                          <span className="font-black text-amber-600 tabular-nums">
                            {attendance.daysLate}
                          </span>
                        </div>
                      )}
                      {attendance.totalDays > 0 && (
                        <div className="pt-1 border-t border-blue-100">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-slate-500 font-bold text-[8px] uppercase">Rate</span>
                            <span className={cn(
                              "font-black text-[10px] tabular-nums",
                              attendancePercentage >= 90 ? "text-emerald-600" :
                              attendancePercentage >= 75 ? "text-blue-600" :
                              attendancePercentage >= 60 ? "text-amber-600" : "text-rose-600"
                            )}>
                              {attendancePercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                attendancePercentage >= 90 ? "bg-emerald-500" :
                                attendancePercentage >= 75 ? "bg-blue-500" :
                                attendancePercentage >= 60 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${attendancePercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Affective Domain ratings */}
                  <div className="border-2 border-blue-800 rounded-lg overflow-hidden bg-white/90">
                    <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-center">
                      Affective Domain
                    </div>
                    <div className="p-1.5 space-y-[2px]">
                      {ratings.affective.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-[1px] text-[9px]">
                          <span className="font-semibold text-slate-700">{item.name}</span>
                          <StarRating rating={item.rating} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Psychomotor skills ratings */}
                  <div className="border-2 border-blue-800 rounded-lg overflow-hidden bg-white/90">
                    <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-center">
                      Psychomotor
                    </div>
                    <div className="p-1.5 space-y-[2px]">
                      {ratings.psychomotor.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-[1px] text-[9px]">
                          <span className="font-semibold text-slate-700">{item.name}</span>
                          <StarRating rating={item.rating} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating keys & grading scale */}
                  <div className="border border-blue-300 rounded-lg overflow-hidden bg-white/90">
                    <div className="bg-blue-50 text-blue-800 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-center border-b border-blue-200">
                      Rating Key
                    </div>
                    <div className="p-1.5 grid grid-cols-2 gap-x-2 gap-y-[1px] text-[8px]">
                      {[
                        { value: 5, label: 'Excellent' },
                        { value: 4, label: 'V. Good' },
                        { value: 3, label: 'Good' },
                        { value: 2, label: 'Fair' },
                        { value: 1, label: 'Poor' },
                      ].map((r) => (
                        <div key={r.value} className="flex items-center gap-0.5">
                          <span className="font-black w-2 text-blue-800 tabular-nums">{r.value}</span>
                          <span className="text-slate-500">—</span>
                          <span className="text-slate-700 font-medium">{r.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-blue-200 bg-blue-50 text-blue-800 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-center">
                      Grading Scale
                    </div>
                    <div className="p-1.5 space-y-[1px] text-[8px]">
                      {[
                        { range: '80–100', label: 'Excellent', color: 'text-emerald-700' },
                        { range: '70–79', label: 'V. Good', color: 'text-blue-700' },
                        { range: '60–69', label: 'Good', color: 'text-cyan-700' },
                        { range: '50–59', label: 'Satisfactory', color: 'text-amber-700' },
                        { range: '45–49', label: 'Average', color: 'text-orange-700' },
                        { range: '0–44', label: 'Fair', color: 'text-rose-700' },
                      ].map((g) => (
                        <div key={g.range} className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 tabular-nums">{g.range}</span>
                          <span className={cn('font-bold', g.color)}>{g.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Document Footer Strip */}
              <div className="mt-3 print:mt-2">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
                <div className="flex items-center justify-between pt-1.5 text-[8px] print:text-[7px] text-slate-400">
                  <span className="italic">{school.motto}</span>
                  <span className="font-bold text-blue-800/60 tracking-wider uppercase">{fullSchoolName}</span>
                  <span className="italic">Excellence in Education</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="no-print text-center text-xs text-slate-400 pt-4 mt-6 border-t border-slate-200/50">
        <p>Vincollins Schools Pupil • Report Card</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>

    </div>
  )
}