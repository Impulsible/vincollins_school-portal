/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Suspense } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import {
  Loader2,
  Printer,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  School,
  Mail,
  Phone,
  User,
  FileX,
  Sparkles,
  Edit3,
  X,
  CheckCircle2,
  RotateCcw,
  Info,
  ClipboardCheck,
  MapPin,
  Calendar,
  Award,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── PRIMARY SUBJECTS ──────────────────────────────────────────────────────
const PRIMARY_SUBJECTS = [
  { id: "english", name: "English", category: "Core" },
  { id: "mathematics", name: "Mathematics", category: "Core" },
  { id: "basic_science", name: "Basic Science", category: "Core" },
  { id: "social_studies", name: "Social Studies", category: "Core" },
  { id: "phonics", name: "Phonics", category: "Core" },
  { id: "yoruba", name: "Yoruba", category: "Languages" },
  { id: "civic_education", name: "Civic Education", category: "Core" },
  { id: "creative_arts", name: "Creative Arts", category: "Arts" },
  { id: "agriculture", name: "Agriculture", category: "Sciences" },
  { id: "computer_education", name: "Computer Education", category: "Sciences" },
  { id: "crs", name: "Christian Religious Studies", category: "Core" },
  { id: "french", name: "French", category: "Languages" },
  { id: "quantitative_reasoning", name: "Quantitative Reasoning", category: "Core" },
  { id: "verbal_reasoning", name: "Verbal Reasoning", category: "Core" },
  { id: "music", name: "Music", category: "Arts" },
  { id: "handwriting", name: "Handwriting", category: "Core" },
  { id: "literature", name: "Literature", category: "Arts" },
  { id: "vocational_aptitude", name: "Vocational Aptitude", category: "Vocational" },
  { id: "history", name: "History", category: "Core" },
  { id: "security_education", name: "Security Education", category: "Core" },
  { id: "home_economics", name: "Home Economics", category: "Vocational" },
  { id: "phe", name: "Physical and Health Education", category: "Core" },
];

const AFFECTIVE_DOMAIN = [
  { id: "honesty", name: "Honesty" },
  { id: "neatness", name: "Neatness" },
  { id: "obedience", name: "Obedience" },
  { id: "orderliness", name: "Orderliness" },
  { id: "diligence", name: "Diligence" },
  { id: "punctuality", name: "Punctuality" },
  { id: "leadership", name: "Leadership" },
  { id: "politeness", name: "Politeness" },
];

const PSYCHOMOTOR_SKILLS = [
  { id: "handwriting", name: "Handwriting" },
  { id: "verbal_fluency", name: "Verbal Fluency" },
  { id: "sports", name: "Sports" },
  { id: "handling_tools", name: "Handling Tools" },
  { id: "club_activities", name: "Club Activities" },
  { id: "art_craft", name: "Art & Craft" },
  { id: "singing", name: "Singing" },
  { id: "dancing", name: "Dancing" },
];

const SUBJECT_ORDER: Record<string, number> = {
  English: 1,
  Mathematics: 2,
  "Basic Science": 3,
  "Social Studies": 4,
  Phonics: 5,
  Yoruba: 6,
  "Civic Education": 7,
  "Creative Arts": 8,
  Agriculture: 9,
  "Computer Education": 10,
  "Christian Religious Studies": 11,
  French: 12,
  "Quantitative Reasoning": 13,
  "Verbal Reasoning": 14,
  Music: 15,
  Handwriting: 16,
  Literature: 17,
  "Vocational Aptitude": 18,
  History: 19,
  "Security Education": 20,
  "Home Economics": 21,
  "Physical and Health Education": 22,
};

const MAX_SCORE_PER_SUBJECT = 100;

interface SubjectScore {
  subject: string;
  subject_display: string;
  ca: number;
  exam: number;
  total: number;
  remark: string;
}

interface SchoolSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  motto?: string;
  next_term_resume?: string | null;
}

interface AttendanceData {
  totalDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
}

const DEFAULT_SCHOOL: SchoolSettings = {
  name: "VINCOLLINS SCHOOLS",
  address: "7/9 Lawani Street, off Ishaga Rd, Surulere, Lagos",
  phone: "+234 907 082 9999",
  email: "vincollinsschools@gmail.com",
  motto: "Geared Towards Excellence",
};

// ─── GLOBAL UTILITY HELPER FUNCTIONS ───────────────────────────────────────
const normalizeSubjectName = (name: string): string => {
  const map: Record<string, string> = {
    English: "English", Eng: "English",
    Mathematics: "Mathematics", Math: "Mathematics", Maths: "Mathematics",
    Agriculture: "Agriculture", Agric: "Agriculture",
    "Christian Religious Studies": "Christian Religious Studies", CRK: "Christian Religious Studies", CRS: "Christian Religious Studies",
    "Civic Education": "Civic Education", Civic: "Civic Education",
    "Creative Arts": "Creative Arts", CCA: "Creative Arts", Art: "Creative Arts",
    Yoruba: "Yoruba", Yor: "Yoruba",
    French: "French",
    "Security Education": "Security Education", Security: "Security Education", "Sec Ed": "Security Education",
    "Physical and Health Education": "Physical and Health Education", PHE: "Physical and Health Education",
    "Home Economics": "Home Economics", "H. Econ": "Home Economics", "Home Econ": "Home Economics",
    "Vocational Aptitude": "Vocational Aptitude", Vocational: "Vocational Aptitude",
    "Quantitative Reasoning": "Quantitative Reasoning", Quant: "Quantitative Reasoning",
    "Verbal Reasoning": "Verbal Reasoning", Verbal: "Verbal Reasoning",
  };
  return map[name] || name;
};

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  "Christian Religious Studies": "Christian Religious Studies",
  "Physical and Health Education": "Physical and Health Education",
  "Computer Education": "Computer Education",
  "Quantitative Reasoning": "Quantitative Reasoning",
  "Verbal Reasoning": "Verbal Reasoning",
  "Creative Arts": "Creative Arts",
  "Home Economics": "Home Economics",
  "Security Education": "Security Education",
  "Vocational Aptitude": "Vocational Aptitude",
  "Basic Science": "Basic Science",
  "Social Studies": "Social Studies",
  "Civic Education": "Civic Education",
};

const getSchoolLevel = (className?: string): "Primary" | "Nursery" | "Playgroup" => {
  if (!className) return "Primary";
  const lower = className.toLowerCase();
  if (
    lower.includes("primary") ||
    (lower.includes("p") && /\d/.test(lower)) ||
    ["p1", "p2", "p3", "p4", "p5", "p6"].some((p) => lower.includes(p)) ||
    lower.includes("basic")
  ) {
    return "Primary";
  }
  if (
    lower.includes("nursery") ||
    lower.includes("n1") ||
    lower.includes("n2") ||
    lower.includes("n3") ||
    lower.includes("creche") ||
    lower.includes("toddler")
  ) {
    return "Nursery";
  }
  if (
    lower.includes("playgroup") ||
    lower.includes("play group") ||
    lower.includes("pre-school") ||
    lower.includes("preschool") ||
    lower.includes("kindergarten") ||
    lower.includes("kg")
  ) {
    return "Playgroup";
  }
  return "Primary";
};

const getFullSchoolName = (school: SchoolSettings, className?: string): string => {
  const level = getSchoolLevel(className);
  const baseName = school.name.replace(/\s*SCHOOLS?\s*$/i, "").trim();
  return `${baseName} ${level}`;
};

const getTeacherForClass = async (className: string): Promise<{ id: string; full_name: string } | null> => {
  try {
    const { data, error } = await supabase
      .from("teacher_classes")
      .select(`
        teacher_id,
        teacher:profiles!teacher_classes_teacher_id_fkey(
          id,
          full_name,
          display_name
        )
      `)
      .eq("class_name", className)
      .maybeSingle();

    if (error || !data) return null;

    const teacherData = Array.isArray(data.teacher) ? data.teacher[0] : data.teacher;
    if (!teacherData) return null;

    return {
      id: data.teacher_id,
      full_name: teacherData.full_name || teacherData.display_name || "Class Teacher",
    };
  } catch (error) {
    console.error("Error fetching teacher for class:", error);
    return null;
  }
};

const getRemark = (score: number): string => {
  if (score >= 80) return "Excellent";
  else if (score >= 70) return "Very Good";
  else if (score >= 60) return "Good";
  else if (score >= 50) return "Satisfactory";
  else if (score >= 45) return "Average";
  else if (score > 0) return "Fair";
  else return "Not graded";
};

const getRemarkPillColor = (remark: string): string => {
  const colors: Record<string, string> = {
    Excellent: "bg-emerald-600 text-white",
    "Very Good": "bg-blue-600 text-white",
    Good: "bg-cyan-600 text-white",
    Satisfactory: "bg-amber-600 text-white",
    Average: "bg-orange-600 text-white",
    Fair: "bg-rose-600 text-white",
    "Not graded": "bg-slate-400 text-white",
  };
  return colors[remark] || "bg-slate-400 text-white";
};

const generateRatings = (averageScore: number) => {
  const baseRating = (avg: number): number => {
    if (avg >= 80) return 5;
    if (avg >= 70) return 4;
    if (avg >= 60) return 3;
    if (avg >= 50) return 2;
    return 1;
  };
  const base = baseRating(averageScore);
  return {
    affective: AFFECTIVE_DOMAIN.map((item, index) => ({
      ...item,
      rating: Math.min(5, Math.max(1, base + (index % 2 === 0 ? 1 : 0) - 1)),
    })),
    psychomotor: PSYCHOMOTOR_SKILLS.map((item, index) => ({
      ...item,
      rating: Math.min(5, Math.max(1, base + (index % 3 === 0 ? 1 : 0) - 1)),
    })),
  };
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-[1px]">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-2 w-2 print:h-[7px] print:w-[7px]",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════
function AdminReportPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  const studentId = searchParams.get("studentId");
  const paramTerm = searchParams.get("term") || "First";
  const paramYear = searchParams.get("year") || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<SchoolSettings>(DEFAULT_SCHOOL);
  const [student, setStudent] = useState<any>(null);
  const [subjects, setSubjects] = useState<SubjectScore[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [overallRemark, setOverallRemark] = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [principalComment, setPrincipalComment] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [resumptionDate, setResumptionDate] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData>({
    totalDays: 0, daysPresent: 0, daysAbsent: 0, daysLate: 0,
  });

  const [editingTeacher, setEditingTeacher] = useState(false);
  const [editingPrincipal, setEditingPrincipal] = useState(false);
  const [tempTeacherComment, setTempTeacherComment] = useState("");
  const [tempPrincipalComment, setTempPrincipalComment] = useState("");
  const [generatingComments, setGeneratingComments] = useState(false);

  // ─── Handle Print ──────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Report_${student?.display_name || "Student"}_${paramTerm}_${paramYear}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 0.4cm; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { height: auto !important; overflow: visible !important; }
        body { background: white !important; margin: 0 !important; padding: 0 !important; }
        .no-print { display: none !important; }
        .print-card { 
          page-break-inside: avoid !important; 
          break-inside: avoid !important; 
          transform: scale(0.97);
          transform-origin: top center;
        }
      }
    `,
  });

  // ─── Fetch Next Term Resumption Date from system_settings & terms ─────────
  const fetchResumptionDate = useCallback(async (currentTerm?: string, currentSession?: string) => {
    try {
      const { data: sysSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'next_term_date')
        .maybeSingle();

      if (sysSetting?.value) {
        return sysSetting.value;
      }

      if (currentSession) {
        const termCodeLower = (currentTerm || 'first').toLowerCase();
        const nextTermMap: Record<string, string[]> = {
          first: ['second', '2nd', 'Second', 'second_term'],
          second: ['third', '3rd', 'Third', 'third_term'],
          third: ['first', '1st', 'First', 'first_term'],
        };
        const targetNextCodes = nextTermMap[termCodeLower] || ['second', 'Second'];

        const { data: nextTermRow } = await supabase
          .from('terms')
          .select('start_date')
          .eq('session_year', currentSession)
          .in('term_code', targetNextCodes)
          .maybeSingle();

        if (nextTermRow?.start_date) {
          return nextTermRow.start_date;
        }
      }

      const { data: schoolSet } = await supabase
        .from('school_settings')
        .select('next_term_resume, next_term_resumption_date, next_term_start')
        .maybeSingle();

      if (schoolSet) {
        return schoolSet.next_term_resume || schoolSet.next_term_resumption_date || schoolSet.next_term_start || null;
      }

    } catch (err) {
      console.warn('Error fetching next term resumption date:', err);
    }
    return null;
  }, []);

  // ─── Load School Settings ──────────────────────────────────────────────────
  const loadSchoolSettings = useCallback(async () => {
    try {
      const { data } = await supabase.from("school_settings").select("*").maybeSingle();
      if (data) {
        setSchool({
          name: data.school_name || DEFAULT_SCHOOL.name,
          address: data.school_address || DEFAULT_SCHOOL.address,
          phone: data.school_phone || DEFAULT_SCHOOL.phone,
          email: data.school_email || DEFAULT_SCHOOL.email,
          logo_url: data.logo_path,
          motto: data.school_motto || DEFAULT_SCHOOL.motto,
          next_term_resume: data.next_term_resume || data.next_term_start || data.next_term_resume_date || null
        });
      }
    } catch (error) {
      console.error("Error loading school settings:", error);
    }
  }, []);

  // ─── Load Attendance from attendance_records and attendance ─────────────────
  const loadAttendance = useCallback(
    async (sid: string) => {
      try {
        // Query attendance_records directly for student
        const { data: recordsData, error: recsErr } = await supabase
          .from("attendance_records")
          .select("status, date, term_code, session_year")
          .eq("student_id", sid);

        let rowsToParse: any[] = recordsData || [];

        // Fallback: Query 'attendance' table
        if (rowsToParse.length === 0) {
          const { data: attTableData } = await supabase
            .from("attendance")
            .select("status, date, term, session_year")
            .eq("student_id", sid);

          if (attTableData && attTableData.length > 0) {
            rowsToParse = attTableData as any[];
          }
        }

        if (rowsToParse.length > 0) {
          const termLower = (paramTerm || "first").toLowerCase().trim();
          const yearLower = (paramYear || "").toLowerCase().replace(/\s+/g, "");

          // Filter by term and session
          const filtered = rowsToParse.filter((r: any) => {
            const rTerm = (r.term_code || r.term || "").toString().toLowerCase().trim();
            const rYear = (r.session_year || r.academic_year || "").toString().toLowerCase().replace(/\s+/g, "");
            
            const termMatch = rTerm.includes(termLower) || termLower.includes(rTerm) || rTerm === termLower;
            const yearMatch = !paramYear || rYear === yearLower || rYear.includes(yearLower);
            
            return termMatch && yearMatch;
          });

          const targetRows = filtered.length > 0 ? filtered : rowsToParse;

          let present = 0;
          let absent = 0;
          let late = 0;

          for (const r of targetRows) {
            const rawStatus = (r.status || "").toString().trim().toLowerCase();
            if (rawStatus === "present" || rawStatus === "p") {
              present++;
            } else if (rawStatus === "absent" || rawStatus === "a") {
              absent++;
            } else if (rawStatus === "late" || rawStatus === "l") {
              late++;
            }
          }

          const total = present + absent + late;
          if (total > 0) {
            setAttendance({
              totalDays: total,
              daysPresent: present,
              daysAbsent: absent,
              daysLate: late,
            });
            return;
          }
        }

        setAttendance({ totalDays: 0, daysPresent: 0, daysAbsent: 0, daysLate: 0 });
      } catch (error) {
        console.error("Error loading attendance:", error);
        setAttendance({ totalDays: 0, daysPresent: 0, daysAbsent: 0, daysLate: 0 });
      }
    },
    [paramTerm, paramYear]
  );

  // ─── Generate & Auto-Save Principal Comment ─────────────────────────────
  const generateAndSavePrincipalComment = useCallback(async (std: any, subjs: SubjectScore[], avg: number) => {
    if (!std || subjs.length === 0 || !studentId) return;
    setGeneratingComments(true);
    try {
      const subjectsForApi = subjs.map((s) => ({ name: s.subject, score: s.total }));
      const response = await fetch("/api/generate-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: (std.display_name || std.full_name || "Student").split(" ")[0],
          averageScore: Math.round(avg),
          subjects: subjectsForApi,
          className: std.class,
          gender: std.gender || "male",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");
      const data = await response.json();
      const generatedRemark = data.principal_comment;
      
      const { error: saveError } = await supabase.from("report_cards").upsert(
        {
          student_id: std.id,
          term: paramTerm,
          session_year: paramYear,
          principal_comment: generatedRemark,
          class: std.class,
          average: Math.round(avg),
          grade: getRemark(avg),
        },
        { onConflict: "student_id,term,session_year" }
      );

      if (saveError) {
        console.error("Failed to auto-save principal comment:", saveError);
      } else {
        setPrincipalComment(generatedRemark);
        setTempPrincipalComment(generatedRemark);
      }
    } catch (err) {
      console.error("Error in auto-generating comment:", err);
    } finally {
      setGeneratingComments(false);
    }
  }, [studentId, paramTerm, paramYear]);

  // ─── Load Scores & Setup ──────────────────────────────────────────────────
  const loadScores = useCallback(async () => {
    if (!studentId) {
      toast.error("No student ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setSubjects([]);
    setTotalScore(0);
    setAverageScore(0);

    try {
      const { data: sd } = await supabase.from("profiles").select("*").eq("id", studentId).single();
      if (!sd) {
        toast.error("Student not found");
        setLoading(false);
        return;
      }
      setStudent(sd);

      await loadAttendance(studentId);

      // Fetch teacher assigned to class
      if (sd.class) {
        const teacher = await getTeacherForClass(sd.class);
        setClassTeacher(teacher?.full_name || "Class Teacher");
      } else {
        setClassTeacher("Class Teacher");
      }

      // Fetch resumption date
      const dynamicResume = await fetchResumptionDate(paramTerm, paramYear);
      if (dynamicResume) {
        setResumptionDate(dynamicResume);
      }

      // Load scores
      const { data: scores } = await supabase
        .from("primary_scores")
        .select("*")
        .eq("student_id", studentId)
        .eq("term", paramTerm)
        .eq("academic_year", paramYear);

      if (!scores || scores.length === 0) {
        setLoading(false);
        return;
      }

      const processed: SubjectScore[] = scores.map((s: any) => {
        const ca = s.ca_score || 0;
        const exam = s.exam_score || 0;
        const total = ca + exam;
        const subjectName = normalizeSubjectName(s.subject);
        const displayName = SUBJECT_DISPLAY_NAMES[subjectName] || subjectName;
        return {
          subject: displayName,
          subject_display: displayName,
          ca,
          exam,
          total,
          remark: getRemark(total),
        };
      });

      const subjectMap = new Map<string, SubjectScore>();
      processed.forEach((s) => {
        const existing = subjectMap.get(s.subject);
        if (!existing || s.total > existing.total) subjectMap.set(s.subject, s);
      });

      const sortedSubjects = Array.from(subjectMap.values()).sort((a, b) => {
        return (SUBJECT_ORDER[a.subject] || 999) - (SUBJECT_ORDER[b.subject] || 999);
      });

      setSubjects(sortedSubjects);

      const total = sortedSubjects.reduce((sum, s) => sum + s.total, 0);
      const avg = sortedSubjects.length > 0 ? total / sortedSubjects.length : 0;
      setTotalScore(total);
      setAverageScore(avg);
      setOverallRemark(getRemark(avg));

      // Fetch existing comments or generate
      const { data: existingCard } = await supabase
        .from("report_cards")
        .select("*")
        .eq("student_id", studentId)
        .eq("term", paramTerm)
        .eq("session_year", paramYear)
        .maybeSingle();

      if (existingCard) {
        setTeacherComment(existingCard.teacher_comment || "");
        
        if (existingCard.principal_comment) {
          setPrincipalComment(existingCard.principal_comment);
          setTempPrincipalComment(existingCard.principal_comment);
        } else {
          await generateAndSavePrincipalComment(sd, sortedSubjects, avg);
        }
      } else {
        await generateAndSavePrincipalComment(sd, sortedSubjects, avg);
      }

    } catch (e) {
      console.error(e);
      toast.error("Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, [studentId, paramTerm, paramYear, loadAttendance, generateAndSavePrincipalComment, fetchResumptionDate]);

  useEffect(() => {
    loadSchoolSettings();
  }, [loadSchoolSettings]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  // ─── Manual Action System Remark Regeneration ──────────────────────────
  const handleRegeneratePrincipal = useCallback(async () => {
    if (!student || subjects.length === 0) return;
    await generateAndSavePrincipalComment(student, subjects, averageScore);
    toast.success("Comment updated and saved!");
  }, [student, subjects, averageScore, generateAndSavePrincipalComment]);

  // ─── Manual Save Remarks ───────────────────────────────────────────────────
  const handleSaveTeacherComment = async () => {
    if (!studentId) return;
    try {
      const { error } = await supabase.from("report_cards").upsert(
        {
          student_id: studentId,
          term: paramTerm,
          session_year: paramYear,
          teacher_comment: tempTeacherComment || teacherComment,
          class: student?.class,
        },
        { onConflict: "student_id,term,session_year" }
      );

      if (error) throw error;
      setTeacherComment(tempTeacherComment || teacherComment);
      setEditingTeacher(false);
      toast.success("Teacher comment saved!");
    } catch (error) {
      console.error("Error saving teacher comment:", error);
      toast.error("Failed to save comment");
    }
  };

  const handleSavePrincipalComment = async () => {
    if (!studentId) return;
    try {
      const { error } = await supabase.from("report_cards").upsert(
        {
          student_id: studentId,
          term: paramTerm,
          session_year: paramYear,
          principal_comment: tempPrincipalComment || principalComment,
          class: student?.class,
        },
        { onConflict: "student_id,term,session_year" }
      );

      if (error) throw error;
      setPrincipalComment(tempPrincipalComment || principalComment);
      setEditingPrincipal(false);
      toast.success("Principal comment saved!");
    } catch (error) {
      console.error("Error saving principal comment:", error);
      toast.error("Failed to save comment");
    }
  };

  const ratings = generateRatings(averageScore);
  const fullSchoolName = getFullSchoolName(school, student?.class);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading preview…</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] p-4">
        <FileX className="h-10 w-10 text-red-600" />
        <p className="text-red-600 font-medium text-sm text-center">Student not found.</p>
        <Button onClick={() => router.back()} size="sm">Go Back</Button>
      </div>
    );
  }

  const fullName = student.display_name || student.full_name || "Student";
  const fmtAvg = averageScore.toFixed(2);
  const totalMarksObtained = totalScore;
  const totalMarksObtainable = subjects.length * MAX_SCORE_PER_SUBJECT;
  const attendancePercentage = attendance.totalDays > 0 ? Math.round((attendance.daysPresent / attendance.totalDays) * 100) : 0;

  const bestSubject = subjects.length > 0 ? subjects.reduce((a, b) => (a.total > b.total ? a : b)) : null;
  const worstSubject = subjects.length > 0 ? subjects.reduce((a, b) => (a.total < b.total ? a : b)) : null;

  // Format Next Term Resume Date from DB Settings or fallback
  const getResumeDateString = () => {
    const rawDate = resumptionDate || school.next_term_resume;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        }
      } catch {}
      return rawDate;
    }
    const nextTermDate = new Date();
    nextTermDate.setDate(nextTermDate.getDate() + 84);
    return nextTermDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const nextTermFormatted = getResumeDateString();

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-24 sm:pb-6 space-y-3 sm:space-y-4 print:p-0 print:max-w-none print:space-y-0 bg-slate-100 print:bg-white min-h-screen">
      
      {/* Controls Bar */}
      <div className="no-print bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-1.5">
              👁️ <span>Live Preview</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              {fullName} · {paramTerm} Term · {paramYear}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 text-xs px-2 sm:px-3 gap-1">
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Back to Broadsheet</span>
            </Button>
            {subjects.length > 0 && (
              <Button onClick={handlePrint} className="h-8 bg-slate-600 hover:bg-slate-700 text-white text-xs px-3 gap-1.5 shrink-0">
                <Printer className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden xs:inline">Print / </span>Download
              </Button>
            )}
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-violet-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-violet-900">Teacher: {classTeacher}</p>
              <p className="text-xs text-violet-700">This teacher is assigned to {student?.class || "this class"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-12 sm:py-16 px-4 sm:px-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileX className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">No Scores Yet</h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            {fullName} has no scores recorded for {paramTerm} Term, {paramYear}.
          </p>
        </div>
      )}

      {/* Main Report Card Presentation */}
      {subjects.length > 0 && (
        <div ref={printRef} className="print-card">
          <div className="bg-white w-full shadow-xl print:shadow-none relative overflow-hidden">
            
            {/* Outer Decorative Board frame */}
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
                  style={{ opacity: 0.08, filter: "grayscale(20%)" }}
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

                {/* School Info - Center */}
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
                      &quot;{school.motto}&quot;
                    </p>
                  </div>
                </div>

                {/* Student Photo — Passport size (face-focused portrait) */}
                <div
                  className={cn(
                    "shrink-0 overflow-hidden bg-slate-50 shadow-sm border-2 border-blue-800",
                    // Passport-like portrait ratio (~3:4), larger for face clarity
                    "w-[56px] h-[72px] sm:w-[68px] sm:h-[90px] print:w-[65px] print:h-[85px]",
                    "rounded-sm" // flatter corners = more passport-like than rounded-lg
                  )}
                >
                  {student?.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt="Student passport photo"
                      className="w-full h-full object-cover object-top"
                      // object-top keeps face in frame if photo is full-body/upper-body
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
                    <p className="text-[10px] sm:text-[11px] print:text-[10px] font-semibold text-blue-200">Session: {paramYear}</p>
                    <span className="text-blue-400 text-[10px]">•</span>
                    <p className="text-[10px] sm:text-[11px] print:text-[10px] font-semibold text-blue-200">{paramTerm} Term</p>
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
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{student.admission_number || student.vin_id || "—"}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Class:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{student.class || "—"}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Term:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{paramTerm} Term</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Session:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{paramYear}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-blue-800 w-20 shrink-0 uppercase text-[9px] tracking-wide">Resumes:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">{nextTermFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Main Score Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_215px] gap-2 print:grid print:grid-cols-[1fr_200px] print:gap-2 items-stretch">
                
                {/* Score details table (left) */}
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
                            "border-b border-blue-100 last:border-0",
                            i % 2 === 0 ? "bg-white/85" : "bg-blue-50/60"
                          )}>
                            <td className="px-1.5 py-[3px] font-semibold text-slate-800 leading-tight border-r border-blue-100">{s.subject}</td>
                            <td className="px-1 py-[3px] text-center font-bold text-slate-700 tabular-nums border-r border-blue-100">{s.ca}</td>
                            <td className="px-1 py-[3px] text-center font-bold text-slate-700 tabular-nums border-r border-blue-100">{s.exam}</td>
                            <td className="px-1 py-[3px] text-center font-black tabular-nums border-r border-blue-100">
                              <span className={cn(
                                "inline-block w-7 text-center rounded-sm py-[1px] text-[9px]",
                                s.total >= 70 ? "bg-emerald-100 text-emerald-800" :
                                s.total >= 50 ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
                              )}>
                                {s.total}
                              </span>
                            </td>
                            <td className="px-1.5 py-[3px] text-center">
                              <span className={cn(
                                "inline-block px-1.5 py-[1px] rounded-full text-[8px] font-bold tracking-wide",
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

                  {/* Teacher Comments panel */}
                  <div className="border-2 border-purple-700 rounded-lg overflow-hidden flex-1 flex flex-col bg-white/90 min-h-[85px]">
                    <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        Class Teacher&apos;s Remark
                      </div>
                      <div className="no-print flex items-center gap-1">
                        {!editingTeacher ? (
                          <button
                            onClick={() => {
                              setTempTeacherComment(teacherComment);
                              setEditingTeacher(true);
                            }}
                            className="h-4 w-4 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center"
                          >
                            <Edit3 className="h-2.5 w-2.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleSaveTeacherComment}
                              className="h-4 px-1 rounded bg-emerald-500 hover:bg-emerald-600 flex items-center gap-0.5 text-[8px] font-bold"
                            >
                              <CheckCircle2 className="h-2 w-2" /> Save
                            </button>
                            <button
                              onClick={() => setEditingTeacher(false)}
                              className="h-4 w-4 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingTeacher ? (
                      <Textarea
                        value={tempTeacherComment}
                        onChange={(e) => setTempTeacherComment(e.target.value)}
                        className="flex-1 min-h-[50px] text-[9px] rounded-none border-0 focus-visible:ring-0 resize-none bg-purple-50/30"
                        placeholder="Enter class teacher's remark..."
                      />
                    ) : (
                      <div className="flex-1 p-2 text-[9px] italic leading-relaxed bg-gradient-to-r from-purple-50/50 to-white/70">
                        {teacherComment || <span className="text-slate-400 not-italic">Teacher remark empty.</span>}
                      </div>
                    )}
                    <div className="px-2 py-0.5 text-[8px] text-purple-700 border-t border-purple-200 bg-purple-50/40 font-bold flex items-center justify-between shrink-0">
                      <span>Signed: {classTeacher}</span>
                      <span className="border-b border-dotted border-purple-400 w-16 inline-block" />
                    </div>
                  </div>

                  {/* Head Master/Mistress Remark panel (Automated on load) */}
                  <div className="border-2 border-blue-700 rounded-lg overflow-hidden flex-1 flex flex-col bg-white/90 min-h-[85px]">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1">
                        <ClipboardCheck className="h-2.5 w-2.5" />
                        Head Master/Mistress&apos;s Remark
                      </div>
                      <div className="no-print flex items-center gap-1">
                        {!editingPrincipal ? (
                          <>
                            <button
                              onClick={handleRegeneratePrincipal}
                              disabled={generatingComments}
                              className="h-4 px-1 rounded bg-white/20 hover:bg-white/30 flex items-center gap-0.5 text-[8px] font-bold"
                            >
                              {generatingComments ? (
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              ) : (
                                <>
                                  <RotateCcw className="h-2.5 w-2.5" /> Auto-Generate Comment
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setTempPrincipalComment(principalComment);
                                setEditingPrincipal(true);
                              }}
                              className="h-4 w-4 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center"
                            >
                              <Edit3 className="h-2.5 w-2.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleSavePrincipalComment}
                              className="h-4 px-1 rounded bg-emerald-500 hover:bg-emerald-600 flex items-center gap-0.5 text-[8px] font-bold"
                            >
                              <CheckCircle2 className="h-2 w-2" /> Save
                            </button>
                            <button
                              onClick={() => setEditingPrincipal(false)}
                              className="h-4 w-4 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingPrincipal ? (
                      <Textarea
                        value={tempPrincipalComment}
                        onChange={(e) => setTempPrincipalComment(e.target.value)}
                        className="flex-1 min-h-[50px] text-[9px] rounded-none border-0 focus-visible:ring-0 resize-none bg-blue-50/30"
                        placeholder="Enter head master/mistress's remark..."
                      />
                    ) : (
                      <div className="flex-1 p-2 text-[9px] italic leading-relaxed bg-gradient-to-r from-blue-50/50 to-white/70">
                        {principalComment || <span className="text-slate-400 not-italic">Auto-generating suggested comment...</span>}
                      </div>
                    )}
                    <div className="px-2 py-0.5 text-[8px] text-blue-700 border-t border-blue-200 bg-blue-50/40 font-bold flex items-center justify-between shrink-0">
                      <span>Signed: Head Master/Mistress</span>
                      <span className="border-b border-dotted border-blue-400 w-16 inline-block" />
                    </div>
                  </div>
                </div>

                {/* Sidebar column (right) */}
                <div className="flex flex-col gap-1.5">
                  
                  {/* Performance Summary Panel */}
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
                        <span className={cn("font-bold px-1.5 py-[1px] rounded-full text-[8px]", getRemarkPillColor(overallRemark))}>
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
                              {bestSubject.subject}
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
                            {worstSubject.subject}
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

                  {/* Rating keys & grading scale configurations */}
                  <div className="border border-blue-300 rounded-lg overflow-hidden bg-white/90">
                    <div className="bg-blue-50 text-blue-800 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-center border-b border-blue-200">
                      Rating Key
                    </div>
                    <div className="p-1.5 grid grid-cols-2 gap-x-2 gap-y-[1px] text-[8px]">
                      {[
                        { value: 5, label: "Excellent" },
                        { value: 4, label: "V. Good" },
                        { value: 3, label: "Good" },
                        { value: 2, label: "Fair" },
                        { value: 1, label: "Poor" },
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
                        { range: "80–100", label: "Excellent", color: "text-emerald-700" },
                        { range: "70–79", label: "V. Good", color: "text-blue-700" },
                        { range: "60–69", label: "Good", color: "text-cyan-700" },
                        { range: "50–59", label: "Satisfactory", color: "text-amber-700" },
                        { range: "45–49", label: "Average", color: "text-orange-700" },
                        { range: "0–44", label: "Fair", color: "text-rose-700" },
                      ].map((g) => (
                        <div key={g.range} className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 tabular-nums">{g.range}</span>
                          <span className={cn("font-bold", g.color)}>{g.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Document footer strip */}
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

      {/* Page Footer */}
      <div className="no-print text-center text-xs text-slate-400 pt-4 mt-6 border-t border-slate-200/50">
        <p>Vincollins Schools Admin · Live Preview</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>

    </div>
  );
}

export default function AdminReportPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AdminReportPreviewContent />
    </Suspense>
  );
}