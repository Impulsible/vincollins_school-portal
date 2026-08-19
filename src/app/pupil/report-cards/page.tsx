/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useReactToPrint } from 'react-to-print'
import {
  Loader2, Printer, ArrowLeft, Award, TrendingUp, TrendingDown,
  School, Mail, Phone, User, Sparkles, LayoutDashboard, FileX, Lock,
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
  'Physical and Health Education': 22,
}

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
}

interface TermOption {
  value: string
  label: string
}

// ─── Default school ──────────────────────────────────────────────────────────
const DEFAULT_SCHOOL: SchoolSettings = {
  name: 'VINCOLLINS SCHOOLS',
  address: '7/9 Lawani Street, off Ishaga Rd, Surulere, Lagos',
  phone: '+234 907 082 9999',
  email: 'vincollinsschools@gmail.com',
  motto: 'Geared Towards Excellence',
}

// ─── Primary/Nursery Remark System ────────────────────────────────────────────
const getRemark = (score: number): string => {
  if (score >= 80) return 'Excellent'
  else if (score >= 70) return 'Very Good'
  else if (score >= 60) return 'Good'
  else if (score >= 50) return 'Satisfactory'
  else if (score >= 45) return 'Average'
  else if (score > 0) return 'Fair'
  else return 'Not graded'
}

const getRemarkColor = (remark: string): string => {
  const colors: Record<string, string> = {
    'Excellent': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Very Good': 'bg-blue-100 text-blue-700 border-blue-200',
    'Good': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Satisfactory': 'bg-amber-100 text-amber-700 border-amber-200',
    'Average': 'bg-orange-100 text-orange-700 border-orange-200',
    'Fair': 'bg-rose-100 text-rose-700 border-rose-200',
    'Not graded': 'bg-slate-100 text-slate-500 border-slate-200',
  }
  return colors[remark] || 'bg-slate-100 text-slate-600'
}

const getRemarkEmoji = (remark: string): string => {
  switch (remark) {
    case 'Excellent': return '🌟'
    case 'Very Good': return '👏'
    case 'Good': return '📚'
    case 'Satisfactory': return '✅'
    case 'Average': return '💪'
    case 'Fair': return '📝'
    default: return '📋'
  }
}

// ─── Generate Ratings ──────────────────────────────────────────────────────
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
      rating: Math.min(5, Math.max(1, base + (index % 2 === 0 ? 1 : 0) - 1))
    })),
    psychomotor: PSYCHOMOTOR_SKILLS.map((item, index) => ({
      ...item,
      rating: Math.min(5, Math.max(1, base + (index % 3 === 0 ? 1 : 0) - 1))
    })),
  }
}

// ─── Subject Display Names ──────────────────────────────────────────────────
const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  'Christian Religious Studies': 'CRS',
  'Physical and Health Education': 'PHE',
  'Computer Education': 'ICT',
  'Quantitative Reasoning': 'Quant',
  'Verbal Reasoning': 'Verbal',
  'Creative Arts': 'Arts',
  'Home Economics': 'Home Econ',
  'Security Education': 'Security',
  'Vocational Aptitude': 'Vocational',
  'Basic Science': 'Science',
  'Social Studies': 'Social',
  'Civic Education': 'Civic',
}

// ─── Helper Functions ──────────────────────────────────────────────────────
const normalizeSubjectName = (name: string): string => {
  const map: Record<string, string> = {
    'English': 'English',
    'Eng': 'English',
    'Math': 'Mathematics',
    'Maths': 'Mathematics',
    'Agric': 'Agriculture',
    'CRK': 'Christian Religious Studies',
    'CRS': 'Christian Religious Studies',
    'Civic': 'Civic Education',
    'CCA': 'Creative Arts',
    'Art': 'Creative Arts',
    'Yor': 'Yoruba',
    'French': 'French',
    'Security': 'Security Education',
    'Sec Ed': 'Security Education',
    'PHE': 'Physical and Health Education',
    'H. Econ': 'Home Economics',
    'Home Econ': 'Home Economics',
    'Vocational': 'Vocational Aptitude',
    'Quant': 'Quantitative Reasoning',
    'Verbal': 'Verbal Reasoning',
  }
  return map[name] || name
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
  const [subjects, setSubjects] = useState<SubjectScore[]>([])
  const [hasReport, setHasReport] = useState(false)
  const [reportNotPublished, setReportNotPublished] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [overallRemark, setOverallRemark] = useState('')
  const [teacherComment, setTeacherComment] = useState('')
  const [principalComment, setPrincipalComment] = useState('')
  const [classTeacher, setClassTeacher] = useState('')

  // ─── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Report_${student?.display_name || 'Student'}_${selectedTerm}_${selectedYear}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 0.3cm; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { height: auto !important; overflow: visible !important; }
        body { background: white !important; margin: 0 !important; padding: 0 !important; }
        .no-print { display: none !important; }
        .print-card { page-break-inside: avoid !important; break-inside: avoid !important; }
        table { table-layout: fixed !important; width: 100% !important; border-collapse: collapse !important; }
        th, td { padding: 2px 3px !important; border-color: #000 !important; border-width: 1px !important; }
        th { font-weight: 700 !important; background-color: #1e40af !important; color: white !important; }
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
        })
      }
    } catch (error) {
      console.error('Error loading school settings:', error)
    }
  }, [])

  // ─── Load terms from database ──────────────────────────────────────────────
  const loadTerms = useCallback(async () => {
    try {
      // Try to get from terms table
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select('term_code, term_name, session_year')
        .order('session_year', { ascending: false })
        .order('term_code', { ascending: true })

      // If table doesn't exist or error, use fallback
      if (termsError) {
        console.log('Terms table not found, using fallback values')
        return
      }

      if (termsData && termsData.length > 0) {
        const termMap = new Map<string, string>()
        termsData.forEach((t: any) => {
          const key = t.term_code
          if (!termMap.has(key)) {
            termMap.set(key, t.term_name)
          }
        })
        
        const terms: TermOption[] = Array.from(termMap.entries()).map(([value, label]) => ({
          value,
          label
        }))
        setAvailableTerms(terms)

        const years = [...new Set(termsData.map((t: any) => t.session_year))].sort((a, b) => b.localeCompare(a))
        if (years.length > 0) setAvailableYears(years)

        // Get current term from school settings
        const { data: settings } = await supabase
          .from('school_settings')
          .select('current_term, current_session')
          .maybeSingle()

        if (settings?.current_term) setSelectedTerm(settings.current_term)
        if (settings?.current_session) setSelectedYear(settings.current_session)
      }
    } catch (error) {
      console.error('Error loading terms:', error)
    }
  }, [])

  // ─── Load scores from primary_scores ──────────────────────────────────────
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

      // ─── Get student profile ──────────────────────────────────────────────
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

      // ─── Get class teacher ────────────────────────────────────────────────
      const { data: td } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('role', 'teacher')
        .limit(1)
      setClassTeacher(td?.[0]?.display_name || td?.[0]?.full_name || 'Class Teacher')

      // ─── Check if report card exists ──────────────────────────────────────
      const { data: reportCard } = await supabase
        .from('report_cards')
        .select('status, subjects_data, teacher_comments, principal_comments, average_score, total_score')
        .eq('student_id', user.id)
        .eq('term', selectedTerm)
        .eq('academic_year', selectedYear)
        .maybeSingle()

      if (!reportCard) { 
        setHasReport(false)
        setLoading(false)
        return 
      }

      if (reportCard.status !== 'published') {
        setHasReport(false)
        setReportNotPublished(true)
        setLoading(false)
        return
      }

      // ─── Load scores from primary_scores ──────────────────────────────────
      const { data: scores, error: scoresError } = await supabase
        .from('primary_scores')
        .select('*')
        .eq('student_id', user.id)
        .eq('term', selectedTerm)
        .eq('academic_year', selectedYear)

      if (scoresError) {
        console.error('Error fetching scores:', scoresError)
        setHasReport(false)
        setLoading(false)
        return
      }

      if (!scores || scores.length === 0) { 
        setHasReport(false)
        setLoading(false)
        return 
      }

      // ─── Process scores ──────────────────────────────────────────────────
      const processed: SubjectScore[] = scores.map((s: any) => {
        const ca = s.ca_score || 0
        const exam = s.exam_score || 0
        const total = ca + exam
        const remark = getRemark(total)
        const subjectName = normalizeSubjectName(s.subject)
        const displayName = SUBJECT_DISPLAY_NAMES[subjectName] || subjectName

        return {
          subject: displayName,
          subject_display: displayName,
          ca,
          exam,
          total,
          remark,
        }
      })

      // ─── Deduplicate and sort subjects ──────────────────────────────────
      const subjectMap = new Map<string, SubjectScore>()
      processed.forEach(s => {
        const existing = subjectMap.get(s.subject)
        if (!existing || s.total > existing.total) {
          subjectMap.set(s.subject, s)
        }
      })
      
      const sortedSubjects = Array.from(subjectMap.values()).sort((a, b) => {
        const orderA = SUBJECT_ORDER[a.subject] || 999
        const orderB = SUBJECT_ORDER[b.subject] || 999
        return orderA - orderB
      })

      setSubjects(sortedSubjects)
      setHasReport(true)

      const total = sortedSubjects.reduce((sum, s) => sum + s.total, 0)
      const avg = sortedSubjects.length > 0 ? total / sortedSubjects.length : 0
      setTotalScore(total)
      setAverageScore(avg)

      // ─── Overall remark ──────────────────────────────────────────────────
      const overallRemark = getRemark(avg)
      setOverallRemark(overallRemark)

      if (reportCard.teacher_comments) setTeacherComment(reportCard.teacher_comments)
      if (reportCard.principal_comments) setPrincipalComment(reportCard.principal_comments)

    } catch (e) {
      console.error('Error loading report card:', e)
      toast.error('Failed to load report card')
    } finally {
      setLoading(false)
    }
  }, [selectedTerm, selectedYear, router])

  // ─── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        loadSchoolSettings(),
        loadTerms(),
      ])
    }
    init()
  }, [loadSchoolSettings, loadTerms])

  useEffect(() => {
    if (selectedTerm && selectedYear) {
      loadScores()
    }
  }, [selectedTerm, selectedYear, loadScores])

  // ─── Generate ratings for display ──────────────────────────────────────────
  const ratings = generateRatings(averageScore)

  // ─── Loading state ──────────────────────────────────────────────────────────
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

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-24 sm:pb-6 space-y-3 sm:space-y-4 print:p-0 print:max-w-none print:space-y-0">

      {/* Controls Bar */}
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

      {/* Empty States */}
      {!hasReport && reportNotPublished && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm py-12 sm:py-16 px-4 sm:px-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
            Report Card Not Yet Released
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            Your report card for {termLabel}, {selectedYear} has been prepared but not yet released.
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
            No approved report card found for {fullName} for {termLabel}, {selectedYear}.
          </p>
        </div>
      )}

      {/* ─── REPORT CARD ────────────────────────────────────────────────────── */}
      {hasReport && (
        <div ref={printRef} className="print-card">
          <div className="bg-white w-full border border-gray-200 sm:border-2 sm:border-blue-900 rounded-lg sm:rounded-none p-2.5 sm:p-4 md:p-5 print:p-2.5 print:border-2 print:border-blue-900 print:rounded-none">

            {/* School Header */}
            <div className="border-b-2 border-blue-900 pb-2 mb-3 print:pb-1.5 print:mb-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 print:flex-row print:gap-3">

                {/* Logo */}
                <div className="w-14 h-14 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center border-2 border-blue-900 rounded bg-blue-50">
                  {school.logo_url ? (
                    <img src={school.logo_url} alt="School logo" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
                  ) : (
                    <School className="h-6 w-6 sm:h-10 sm:w-10 text-blue-900" />
                  )}
                </div>

                {/* School info */}
                <div className="flex-1 text-center w-full min-w-0">
                  <h1 className="text-xs sm:text-base md:text-lg lg:text-xl font-bold uppercase text-blue-900 tracking-wide leading-tight">
                    {school.name}
                  </h1>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-700 mt-0.5 leading-snug px-1">
                    {school.address}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 mt-0.5">
                    <span className="text-[9px] sm:text-[10px] text-gray-600 flex items-center gap-0.5">
                      <Mail className="h-2.5 w-2.5 shrink-0" />
                      <span className="break-all">{school.email}</span>
                    </span>
                    <span className="hidden sm:inline text-gray-400 text-[9px]">|</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-600 flex items-center gap-0.5">
                      <Phone className="h-2.5 w-2.5 shrink-0" />
                      {school.phone}
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] italic text-amber-700 mt-0.5 font-medium">
                    "{school.motto}"
                  </p>
                  <div className="mt-1 pt-1 border-t border-blue-200">
                    <h2 className="font-bold text-[10px] sm:text-xs md:text-sm text-blue-900 leading-tight">
                      {termLabel} Pupil's Performance Report
                    </h2>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 mt-0.5">
                      Academic Session: {selectedYear}
                    </p>
                  </div>
                </div>

                {/* Student photo */}
                <div className="hidden sm:block w-20 h-24 sm:w-20 sm:h-24 md:w-24 md:h-28 border-2 border-blue-900 rounded overflow-hidden shrink-0 bg-gray-50">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0 text-[9px] sm:text-[11px] md:text-xs mb-3 print:mb-2 print:grid-cols-2">
              {[
                ['Name', fullName],
                ['Admission No', student.admission_number || student.vin_id || '—'],
                ['Class', student.class || '—'],
                ['Term', termLabel],
                ['Session', selectedYear],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-1 py-0.5 border-b border-gray-100 sm:border-0">
                  <span className="font-bold text-gray-600 shrink-0 w-20 sm:w-28 md:w-32">{label}:</span>
                  <span className="font-medium text-gray-900 break-words">{value}</span>
                </div>
              ))}
            </div>

            {/* ─── MAIN BODY ────────────────────────────────────────────────── */}
            <div className="flex flex-col md:grid md:grid-cols-[2.2fr_1.2fr] gap-2 sm:gap-3 print:grid print:grid-cols-[2.2fr_1.2fr] print:gap-2">

              {/* ── LEFT COLUMN ── */}
              <div className="min-w-0 space-y-2 sm:space-y-3 print:space-y-2">

                {/* Scores Table */}
                <div className="border-2 border-blue-900 rounded-sm overflow-hidden">
                  <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
                    <table className="w-full border-collapse text-[8px] sm:text-[10px] md:text-[11px] table-fixed min-w-[320px] sm:min-w-[420px] print:min-w-0 print:text-[9px]">
                      <thead className="bg-blue-700 text-white">
                        <tr>
                          <th className="border border-blue-500 px-1 sm:px-1.5 py-1 text-left w-[28%]">Subject</th>
                          <th className="border border-blue-500 px-0.5 sm:px-1 py-1 text-center w-[12%]">CA</th>
                          <th className="border border-blue-500 px-0.5 sm:px-1 py-1 text-center w-[12%]">Exam</th>
                          <th className="border border-blue-500 px-0.5 sm:px-1 py-1 text-center w-[12%]">Total</th>
                          <th className="border border-blue-500 px-1 sm:px-1.5 py-1 text-left w-[36%]">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((s, i) => (
                          <tr key={s.subject} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-1 sm:px-1.5 py-0.5 font-medium break-words leading-tight">
                              {s.subject}
                            </td>
                            <td className="border border-gray-300 text-center font-mono py-0.5">{s.ca}</td>
                            <td className="border border-gray-300 text-center font-mono py-0.5">{s.exam}</td>
                            <td className="border border-gray-300 text-center font-bold font-mono py-0.5">{s.total}</td>
                            <td className="border border-gray-300 px-1 sm:px-1.5 py-0.5">
                              <span className={cn("text-[8px] sm:text-[9px] font-medium px-2 py-0.5 rounded-full", getRemarkColor(s.remark))}>
                                {getRemarkEmoji(s.remark)} {s.remark}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-blue-50 font-bold">
                        <tr>
                          <td colSpan={3} className="border border-gray-300 px-1 sm:px-1.5 py-1 text-right text-[8px] sm:text-[10px]">
                            TOTAL / AVERAGE:
                          </td>
                          <td className="border border-gray-300 text-center py-1 text-[8px] sm:text-[10px]">
                            {totalScore}
                          </td>
                          <td className="border border-gray-300 text-center py-1 text-[8px] sm:text-[10px]">
                            <span className={cn("font-medium px-2 py-0.5 rounded-full", getRemarkColor(overallRemark))}>
                              {getRemarkEmoji(overallRemark)} {overallRemark}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Teacher Remark */}
                <div className="border border-gray-300 rounded-sm overflow-hidden">
                  <div className="bg-purple-600 text-white px-2 py-1 text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    CLASS TEACHER'S REMARK
                  </div>
                  <div className="p-2 sm:p-2.5 text-[9px] sm:text-[10px] italic leading-relaxed bg-purple-50 break-words">
                    {teacherComment || '—'}
                  </div>
                  <div className="px-2 pb-1 pt-0.5 text-[8px] sm:text-[9px] text-gray-500 border-t border-purple-200">
                    Signed: {classTeacher}
                  </div>
                </div>

                {/* Principal Remark */}
                <div className="border border-gray-300 rounded-sm overflow-hidden">
                  <div className="bg-blue-600 text-white px-2 py-1 text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                    <Award className="h-3 w-3 shrink-0" />
                    PRINCIPAL'S REMARK
                  </div>
                  <div className="p-2 sm:p-2.5 text-[9px] sm:text-[10px] italic leading-relaxed break-words">
                    {principalComment || '—'}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-2 sm:space-y-3 print:space-y-2">

                {/* Performance Summary */}
                <div className="border-2 border-blue-900 rounded-sm overflow-hidden">
                  <div className="bg-blue-700 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 uppercase">
                    Performance Summary
                  </div>
                  <div className="p-2 sm:p-2.5 text-[9px] sm:text-[10px] space-y-1 print:p-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Score</span>
                      <span className="font-bold">{totalScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average</span>
                      <span className="font-bold">{fmtAvg}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall Remark</span>
                      <span className={cn("font-medium px-2 py-0.5 rounded-full text-[10px]", getRemarkColor(overallRemark))}>
                        {getRemarkEmoji(overallRemark)} {overallRemark}
                      </span>
                    </div>
                    {subjects.length > 0 && (
                      <>
                        <div className="flex justify-between text-emerald-700 pt-1 border-t border-gray-200">
                          <span className="flex items-center gap-1 font-medium">
                            <TrendingUp className="h-3 w-3 shrink-0" /> Best
                          </span>
                          <span className="font-bold text-right text-[8px] sm:text-[9px] break-words ml-1 max-w-[120px]">
                            {subjects.reduce((a, b) => a.total > b.total ? a : b).subject} ({subjects.reduce((a, b) => a.total > b.total ? a : b).total})
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span className="flex items-center gap-1 font-medium">
                            <TrendingDown className="h-3 w-3 shrink-0" /> Improve
                          </span>
                          <span className="font-bold text-right text-[8px] sm:text-[9px] break-words ml-1 max-w-[120px]">
                            {subjects.reduce((a, b) => a.total < b.total ? a : b).subject} ({subjects.reduce((a, b) => a.total < b.total ? a : b).total})
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ─── AFFECTIVE DOMAIN ────────────────────────────────────── */}
                <div className="border-2 border-blue-900 rounded-sm overflow-hidden">
                  <div className="bg-blue-700 text-white text-[8px] sm:text-[9px] font-bold px-2 py-1 uppercase">
                    Affective Domain
                  </div>
                  <div className="p-1 sm:p-1.5 print:p-1">
                    <table className="w-full border-collapse text-[7px] sm:text-[9px]">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-0.5 text-[7px] sm:text-[8px] font-semibold text-gray-600">Trait</th>
                          <th className="text-center py-0.5 text-[7px] sm:text-[8px] font-semibold text-gray-600 w-5">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratings.affective.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-0.5 pr-1 font-medium text-gray-700 text-[7px] sm:text-[8px]">{item.name}</td>
                            <td className="py-0.5 text-center font-bold text-blue-700 w-5">
                              <span className={cn(
                                "text-[8px] sm:text-[9px]",
                                item.rating >= 4 ? "text-emerald-600" :
                                item.rating >= 3 ? "text-amber-600" :
                                "text-red-500"
                              )}>
                                {item.rating}/5
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ─── PSYCHOMOTOR SKILLS ──────────────────────────────────── */}
                <div className="border-2 border-blue-900 rounded-sm overflow-hidden">
                  <div className="bg-blue-700 text-white text-[8px] sm:text-[9px] font-bold px-2 py-1 uppercase">
                    Psychomotor Skills
                  </div>
                  <div className="p-1 sm:p-1.5 print:p-1">
                    <table className="w-full border-collapse text-[7px] sm:text-[9px]">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-0.5 text-[7px] sm:text-[8px] font-semibold text-gray-600">Skill</th>
                          <th className="text-center py-0.5 text-[7px] sm:text-[8px] font-semibold text-gray-600 w-5">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratings.psychomotor.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-0.5 pr-1 font-medium text-gray-700 text-[7px] sm:text-[8px]">{item.name}</td>
                            <td className="py-0.5 text-center font-bold text-green-700 w-5">
                              <span className={cn(
                                "text-[8px] sm:text-[9px]",
                                item.rating >= 4 ? "text-emerald-600" :
                                item.rating >= 3 ? "text-amber-600" :
                                "text-red-500"
                              )}>
                                {item.rating}/5
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rating Key */}
                <div className="border-2 border-blue-900 rounded-sm overflow-hidden">
                  <div className="bg-blue-700 text-white text-[8px] sm:text-[9px] font-bold px-2 py-1 uppercase">
                    Key To Ratings
                  </div>
                  <div className="p-2 text-[8px] sm:text-[9px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-0.5 print:grid-cols-1 print:p-1.5">
                    {[
                      { value: 5, label: 'Excellent' },
                      { value: 4, label: 'Very Good' },
                      { value: 3, label: 'Good' },
                      { value: 2, label: 'Fair' },
                      { value: 1, label: 'Poor' },
                    ].map(r => (
                      <div key={r.value} className="flex items-center gap-1 font-medium text-gray-700 text-[7px] sm:text-[8px]">
                        <span className={cn(
                          "font-bold",
                          r.value >= 4 ? "text-emerald-600" :
                          r.value >= 3 ? "text-amber-600" :
                          "text-red-500"
                        )}>
                          {r.value}
                        </span>
                        <span className="text-gray-500">– {r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-blue-900 mt-3 sm:mt-4 pt-1 sm:pt-1.5 text-center text-[7px] sm:text-[9px] text-gray-500 print:mt-2 print:pt-1">
              Powered by Vincollins Portal | {school.motto}
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