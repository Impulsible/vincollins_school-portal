/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-render */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  Save,
  Search,
  Edit,
  Trash2,
  Users,
  Loader2,
  RefreshCw,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  GraduationCap,
  SaveAll,
  Trash,
  AlertTriangle,
  Database,
  Lock,
  Circle,
  ChevronRight,
  BookOpen,
  Settings2,
  Eye,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Student {
  id: string;
  full_name: string;
  class: string;
  class_arm?: string;
  admission_number: string;
}

interface ScoreEntry {
  ca: string;
  exam: string;
  is_saved?: boolean;
}

interface ScoreRecord {
  student_admission: string;
  id: string;
  student_id: string;
  class: string;
  subject: string;
  term: string;
  academic_year: string;
  ca_score: number;
  exam_score: number;
  total_score: number;
  remark: string;
  teacher_id: string;
  teacher_name: string;
  created_at?: string;
  updated_at?: string;
}

type ScoreInsert = Omit<
  ScoreRecord,
  "id" | "created_at" | "updated_at" | "student_admission"
>;

interface ScoreUpdate {
  ca_score: number;
  exam_score: number;
  total_score: number;
  remark: string;
  updated_at: string;
}

interface Stats {
  totalStudents: number;
  gradedStudents: number;
  classAverage: number;
  highestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

interface SubjectStatus {
  hasScores: boolean;
  enteredByMe: boolean;
  enteredByOther: boolean;
  otherTeacherName?: string;
  studentCount: number;
}

interface TermOption {
  value: string;
  label: string;
  is_current: boolean;
}

interface SchoolSettings {
  current_term: string;
  current_session: string;
}

interface PrimaryScoresTabProps {
  staffProfile: any;
  onScoresSaved?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CLASSES = [
  { id: "playgroup", name: "Playgroup", code: "PG" },
  { id: "nursery_1", name: "Nursery 1", code: "N1" },
  { id: "nursery_2", name: "Nursery 2", code: "N2" },
  { id: "kindergarten", name: "Kindergarten", code: "KG" },
  { id: "primary_1", name: "Primary 1", code: "P1" },
  { id: "primary_2", name: "Primary 2", code: "P2" },
  { id: "primary_3", name: "Primary 3", code: "P3" },
  { id: "primary_4", name: "Primary 4", code: "P4" },
  { id: "primary_5", name: "Primary 5", code: "P5" },
] as const;

const PRIMARY_SUBJECTS: string[] = [
  "English",
  "Mathematics",
  "Basic Science",
  "Social Studies",
  "Phonics",
  "Yoruba",
  "Civic Education",
  "Creative Arts",
  "Agriculture",
  "Computer Education",
  "Christian Religious Studies",
  "French",
  "Quantitative Reasoning",
  "Verbal Reasoning",
  "Music",
  "Handwriting",
  "Literature",
  "Vocational Aptitude",
  "History",
  "Security Education",
  "Home Economics",
  "Physical and Health Education",
];

const STORAGE_KEYS = {
  SELECTED_CLASS: "primary_scores_selected_class",
  SELECTED_SUBJECT: "primary_scores_selected_subject",
  SELECTED_TERM: "primary_scores_selected_term",
  SELECTED_YEAR: "primary_scores_selected_year",
  ACTIVE_TAB: "primary_scores_active_tab",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getRemark = (total: number): string => {
  if (total >= 80) return "Excellent";
  if (total >= 70) return "Very Good";
  if (total >= 60) return "Good";
  if (total >= 50) return "Satisfactory";
  if (total >= 45) return "Average";
  if (total > 0) return "Fair";
  return "No Score";
};

const getRemarkColor = (remark: string | null): string => {
  switch (remark) {
    case "Excellent":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "Very Good":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "Good":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "Satisfactory":
      return "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800";
    case "Average":
      return "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800";
    case "Fair":
      return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800";
    default:
      return "text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700";
  }
};

const getScoreBarColor = (total: number): string => {
  if (total >= 80) return "bg-emerald-500";
  if (total >= 70) return "bg-blue-500";
  if (total >= 60) return "bg-amber-500";
  if (total >= 45) return "bg-purple-500";
  if (total > 0) return "bg-orange-500";
  return "bg-slate-200";
};

function calcStats(
  entries: Record<string, ScoreEntry>,
  studentCount: number,
): Stats {
  let totalSum = 0,
    gradedCount = 0,
    highest = 0,
    passCount = 0,
    failCount = 0;
  Object.values(entries).forEach((e) => {
    const total = (parseInt(e.ca) || 0) + (parseInt(e.exam) || 0);
    if (total > 0) {
      totalSum += total;
      gradedCount++;
      if (total > highest) highest = total;
      const r = getRemark(total);
      if (r !== "Fair" && r !== "No Score") passCount++;
      else failCount++;
    }
  });
  return {
    totalStudents: studentCount,
    gradedStudents: gradedCount,
    classAverage: gradedCount > 0 ? Math.round(totalSum / gradedCount) : 0,
    highestScore: highest,
    passCount,
    failCount,
    passRate: gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SubjectStatusIcon({ status }: { status?: SubjectStatus }) {
  if (!status) return null;
  if (status.enteredByOther) {
    return (
      <span
        className="inline-flex items-center gap-1 text-red-500 dark:text-red-400"
        title={`Locked — ${status.otherTeacherName || "Another teacher"} entered scores`}
      >
        <Lock className="h-3 w-3" />
        <span className="text-[11px] font-semibold">Locked</span>
      </span>
    );
  }
  if (status.enteredByMe) {
    return (
      <span
        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
        title={`You entered scores for ${status.studentCount} student(s)`}
      >
        <CheckCircle2 className="h-3 w-3" />
        <span className="text-[11px] font-semibold">{status.studentCount}</span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500"
      title="Available"
    >
      <Circle className="h-3 w-3" />
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <Card className="group relative overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900">
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] dark:opacity-[0.06]",
          gradient,
        )}
      />
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {value}
            </p>
            {sub && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {sub}
              </p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl", gradient, "shadow-sm")}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",
        className,
      )}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function ScoreBar({ total, max = 100 }: { total: number; max?: number }) {
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getScoreBarColor(total),
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "text-sm font-bold tabular-nums min-w-[28px] text-right",
          total > 0
            ? "text-slate-800 dark:text-slate-100"
            : "text-slate-300 dark:text-slate-600",
        )}
      >
        {total > 0 ? total : "—"}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl blur-xl" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <Icon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PrimaryScoresTab({
  staffProfile,
  onScoresSaved,
}: PrimaryScoresTabProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");
  const [isRestoring, setIsRestoring] = useState(true);
  const [isLoadingTerm, setIsLoadingTerm] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [scoreEntries, setScoreEntries] = useState<Record<string, ScoreEntry>>(
    {},
  );
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [subjectsStatus, setSubjectsStatus] = useState<
    Record<string, SubjectStatus>
  >({});
  const [termOptions, setTermOptions] = useState<TermOption[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingSubjects, setCheckingSubjects] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [staffError, setStaffError] = useState<string>("");

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingScore, setEditingScore] = useState<ScoreRecord | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isInitialMount = useRef(true);

  // ── Derived ────────────────────────────────────────────────────────────────
  // ✅ Check if staff profile is valid
  const isValidStaff = useMemo(() => {
    if (!staffProfile) {
      setStaffError("Staff profile is missing");
      return false;
    }
    if (!staffProfile.id) {
      setStaffError("Staff ID is missing");
      return false;
    }
    setStaffError("");
    return true;
  }, [staffProfile]);

  const isLocked = useMemo(
    () =>
      selectedSubject
        ? !!subjectsStatus[selectedSubject]?.enteredByOther
        : false,
    [selectedSubject, subjectsStatus],
  );

  const stats = useMemo(
    () => calcStats(scoreEntries, students.length),
    [scoreEntries, students.length],
  );

  const filteredScores = useMemo(
    () =>
      scores.filter((s) => {
        const name =
          students.find((st) => st.id === s.student_id)?.full_name ?? "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    [scores, students, searchQuery],
  );

  const getStudentName = useCallback(
    (id: string) => students.find((s) => s.id === id)?.full_name ?? "Unknown",
    [students],
  );

  const unsavedCount = useMemo(() => {
    return Object.entries(scoreEntries).filter(([id, e]) => {
      const hasValue = (parseInt(e.ca) || 0) + (parseInt(e.exam) || 0) > 0;
      return hasValue && !savedStatus[id];
    }).length;
  }, [scoreEntries, savedStatus]);

  // ── Staff Info Display ──
  const staffDisplayName = useMemo(() => {
    if (!staffProfile) return "Not logged in";
    return staffProfile.full_name || staffProfile.display_name || staffProfile.firstName || "Teacher";
  }, [staffProfile]);

  // ═════════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═════════════════════════════════════════════════════════════════════════════

  const fetchTerms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("terms")
        .select("term_code, session_year")
        .order("term_code", { ascending: true });
      if (error || !data) return;
      const options: TermOption[] = data.map((t: any) => ({
        value: t.term_code,
        label: t.term_code,
        is_current: false,
      }));
      setTermOptions(options);
    } catch (e) {
      console.error("fetchTerms:", e);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("terms")
        .select("session_year")
        .not("session_year", "is", null)
        .order("session_year", { ascending: false });
      if (error || !data) return;
      const sessions = [
        ...new Set(
          (data as { session_year: string }[])
            .map((t) => t.session_year)
            .filter(Boolean),
        ),
      ];
      setAvailableSessions(sessions);
    } catch (e) {
      console.error("fetchSessions:", e);
    }
  }, []);

  const fetchCurrentTerm = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("school_settings")
        .select("current_term, current_session")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error || !data) {
        setIsLoadingTerm(false);
        return;
      }
      const settings = data as SchoolSettings;
      setSelectedTerm(settings.current_term ?? "");
      setSelectedYear(settings.current_session ?? "");
      setTermOptions((prev) =>
        prev.map((t) => ({
          ...t,
          is_current: t.value === settings.current_term,
        })),
      );
    } catch (e) {
      console.error("fetchCurrentTerm:", e);
    } finally {
      setIsLoadingTerm(false);
    }
  }, []);

  const checkSubjectsStatus = useCallback(
    async (cls: string, term: string, year: string, staffId: string) => {
      if (!cls || !term || !year || !staffId) return;
      setCheckingSubjects(true);
      try {
        const { data: allScores, error } = await supabase
          .from("primary_scores")
          .select("subject, teacher_id, teacher_name, student_id")
          .eq("class", cls)
          .eq("term", term)
          .eq("academic_year", year);

        if (error) {
          const statusMap: Record<string, SubjectStatus> = {};
          for (const subject of PRIMARY_SUBJECTS) {
            statusMap[subject] = {
              hasScores: false,
              enteredByMe: false,
              enteredByOther: false,
              studentCount: 0,
            };
          }
          setSubjectsStatus(statusMap);
          return;
        }

        const rows = (allScores ?? []) as {
          subject: string;
          teacher_id: string;
          teacher_name: string;
          student_id: string;
        }[];

        const statusMap: Record<string, SubjectStatus> = {};
        for (const subject of PRIMARY_SUBJECTS) {
          const subjectRows = rows.filter((r) => r.subject === subject);
          if (subjectRows.length === 0) {
            statusMap[subject] = {
              hasScores: false,
              enteredByMe: false,
              enteredByOther: false,
              studentCount: 0,
            };
            continue;
          }
          const uniqueStudents = new Set(subjectRows.map((r) => r.student_id));
          const byMe = subjectRows.some((r) => r.teacher_id === staffId);
          const byOther = subjectRows.some((r) => r.teacher_id !== staffId);
          const otherRow = subjectRows.find((r) => r.teacher_id !== staffId);
          statusMap[subject] = {
            hasScores: true,
            enteredByMe: byMe && !byOther,
            enteredByOther: byOther,
            otherTeacherName: otherRow?.teacher_name,
            studentCount: uniqueStudents.size,
          };
        }
        setSubjectsStatus(statusMap);
      } catch (e) {
        console.error("checkSubjectsStatus:", e);
      } finally {
        setCheckingSubjects(false);
      }
    },
    [],
  );

  const loadStudents = useCallback(async (cls: string) => {
    if (!cls) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, class, class_arm, admission_number")
        .in("role", ["pupil", "student"])
        .eq("class", cls)
        .eq("is_active", true)
        .order("full_name");
      if (error) {
        toast.error("Failed to load students");
        return;
      }
      const formatted: Student[] = (data ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name ?? "Unknown",
        class: p.class,
        class_arm: p.class_arm ?? "",
        admission_number: p.admission_number ?? "—",
      }));
      setStudents(formatted);
      setScoreEntries({});
      setSavedStatus({});
      setScores([]);
    } catch (e) {
      console.error("loadStudents:", e);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadScores = useCallback(
    async (
      cls: string,
      subject: string,
      term: string,
      year: string,
      currentStudents: Student[],
    ) => {
      if (!cls || !subject || !term || !year || currentStudents.length === 0)
        return;
      setLoading(true);
      try {
        const { data: scoresData, error } = await supabase
          .from("primary_scores")
          .select("*")
          .eq("class", cls)
          .eq("subject", subject)
          .eq("term", term)
          .eq("academic_year", year);

        if (error) {
          const entries: Record<string, ScoreEntry> = {};
          currentStudents.forEach((s) => {
            entries[s.id] = { ca: "", exam: "", is_saved: false };
          });
          setScoreEntries(entries);
          setSavedStatus({});
          setScores([]);
          return;
        }

        const entries: Record<string, ScoreEntry> = {};
        const savedMap: Record<string, boolean> = {};
        currentStudents.forEach((s) => {
          entries[s.id] = { ca: "", exam: "", is_saved: false };
        });

        const rows = (scoresData ?? []) as ScoreRecord[];
        rows.forEach((score) => {
          entries[score.student_id] = {
            ca: String(score.ca_score ?? ""),
            exam: String(score.exam_score ?? ""),
            is_saved: true,
          };
          savedMap[score.student_id] = true;
        });

        setScores(rows);
        setScoreEntries(entries);
        setSavedStatus(savedMap);
      } catch (e) {
        console.error("loadScores:", e);
        toast.error("Failed to load scores");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    Promise.all([fetchTerms(), fetchSessions(), fetchCurrentTerm()]);
  }, [fetchTerms, fetchSessions, fetchCurrentTerm]);

  useEffect(() => {
    if (isLoadingTerm) return;
    if (typeof window !== "undefined") {
      const get = (k: string) => localStorage.getItem(k);
      const cls = get(STORAGE_KEYS.SELECTED_CLASS);
      const subject = get(STORAGE_KEYS.SELECTED_SUBJECT);
      const term = get(STORAGE_KEYS.SELECTED_TERM);
      const year = get(STORAGE_KEYS.SELECTED_YEAR);
      const tab = get(STORAGE_KEYS.ACTIVE_TAB);
      if (cls) setSelectedClass(cls);
      if (subject) setSelectedSubject(subject);
      if (term) setSelectedTerm(term);
      if (year) setSelectedYear(year);
      if (tab) setActiveTab(tab);
    }
    setIsRestoring(false);
    setMounted(true);
  }, [isLoadingTerm]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (!isInitialMount.current && !isRestoring && selectedClass)
      localStorage.setItem(STORAGE_KEYS.SELECTED_CLASS, selectedClass);
  }, [selectedClass, isRestoring]);

  useEffect(() => {
    if (!isInitialMount.current && !isRestoring && selectedSubject)
      localStorage.setItem(STORAGE_KEYS.SELECTED_SUBJECT, selectedSubject);
  }, [selectedSubject, isRestoring]);

  useEffect(() => {
    if (!isInitialMount.current && !isRestoring && selectedTerm)
      localStorage.setItem(STORAGE_KEYS.SELECTED_TERM, selectedTerm);
  }, [selectedTerm, isRestoring]);

  useEffect(() => {
    if (!isInitialMount.current && !isRestoring && selectedYear)
      localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, selectedYear);
  }, [selectedYear, isRestoring]);

  useEffect(() => {
    if (!isInitialMount.current && !isRestoring)
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab, isRestoring]);

  useEffect(() => {
    if (!mounted || isRestoring || isLoadingTerm || !selectedClass) return;
    loadStudents(selectedClass);
  }, [mounted, isRestoring, isLoadingTerm, selectedClass, loadStudents]);

  useEffect(() => {
    if (
      !mounted ||
      isRestoring ||
      !selectedClass ||
      !selectedTerm ||
      !selectedYear ||
      !isValidStaff
    )
      return;
    checkSubjectsStatus(
      selectedClass,
      selectedTerm,
      selectedYear,
      staffProfile.id,
    );
  }, [
    mounted,
    isRestoring,
    selectedClass,
    selectedTerm,
    selectedYear,
    isValidStaff,
    staffProfile?.id,
    checkSubjectsStatus,
  ]);

  useEffect(() => {
    if (
      !mounted ||
      isRestoring ||
      isLoadingTerm ||
      !selectedClass ||
      !selectedSubject ||
      !selectedTerm ||
      !selectedYear ||
      students.length === 0
    )
      return;
    loadScores(
      selectedClass,
      selectedSubject,
      selectedTerm,
      selectedYear,
      students,
    );
  }, [
    mounted,
    isRestoring,
    isLoadingTerm,
    selectedClass,
    selectedSubject,
    selectedTerm,
    selectedYear,
    students,
    loadScores,
  ]);

  // ═════════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════════════════

  const resetScoreState = () => {
    setScoreEntries({});
    setSavedStatus({});
    setScores([]);
  };

  const buildPayload = (
    studentId: string,
    ca: number,
    exam: number,
  ): ScoreInsert | null => {
    if (!isValidStaff || !staffProfile?.id) {
      return null;
    }
    const total = ca + exam;
    return {
      student_id: studentId,
      class: selectedClass,
      subject: selectedSubject,
      term: selectedTerm,
      academic_year: selectedYear,
      ca_score: ca,
      exam_score: exam,
      total_score: total,
      remark: getRemark(total),
      teacher_id: staffProfile.id,
      teacher_name:
        staffProfile.full_name ?? 
        staffProfile.display_name ?? 
        staffProfile.firstName ?? 
        "Teacher",
    };
  };

  // ✅ Refresh all data after saving
  const refreshAllData = useCallback(async () => {
    if (selectedClass && selectedSubject && selectedTerm && selectedYear && students.length > 0) {
      await loadScores(selectedClass, selectedSubject, selectedTerm, selectedYear, students);
    }
    if (selectedClass && selectedTerm && selectedYear && isValidStaff && staffProfile?.id) {
      await checkSubjectsStatus(selectedClass, selectedTerm, selectedYear, staffProfile.id);
    }
    // ✅ Notify parent that scores were saved
    if (onScoresSaved) {
      try {
        await onScoresSaved();
      } catch (e) {
        console.error("Error in parent callback:", e);
      }
    }
  }, [selectedClass, selectedSubject, selectedTerm, selectedYear, students, isValidStaff, staffProfile?.id, onScoresSaved, loadScores, checkSubjectsStatus]);

  const handleSaveSingle = async (studentId: string) => {
    if (!isValidStaff || !staffProfile?.id) {
      const msg = "Missing teacher information. Please log in again.";
      toast.error(msg);
      return;
    }
    if (isLocked) {
      toast.error(
        `Locked by ${subjectsStatus[selectedSubject]?.otherTeacherName || "another teacher"}`,
      );
      return;
    }
    const entry = scoreEntries[studentId];
    if (!entry) return;
    const ca = parseInt(entry.ca) || 0;
    const exam = parseInt(entry.exam) || 0;
    const total = ca + exam;
    
    if (total === 0) {
      toast.info("No scores to save");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(studentId, ca, exam);
      if (!payload) {
        throw new Error("Failed to build payload - invalid staff");
      }
      
      const { data, error } = await supabase
        .from("primary_scores")
        .upsert(payload as any, {
          onConflict: "student_id,subject,term,academic_year",
        });
      
      if (error) throw error;

      setSavedStatus((prev) => ({ ...prev, [studentId]: true }));
      setScoreEntries((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], is_saved: true },
      }));
      
      const remark = getRemark(total);
      toast.success(`✅ Saved: ${total}/100 (${remark})`);
      
      // ✅ Refresh all data after saving
      await refreshAllData();
      
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!isValidStaff || !staffProfile?.id) {
      const msg = "Missing teacher information. Please log in again.";
      toast.error(msg);
      return;
    }
    if (isLocked) {
      toast.error(
        `Locked by ${subjectsStatus[selectedSubject]?.otherTeacherName || "another teacher"}`,
      );
      return;
    }
    
    if (unsavedCount === 0) {
      toast.info("No new scores to save");
      return;
    }
    
    setSaving(true);
    let saved = 0,
      errors = 0;
    let totalSum = 0;
    const failedStudents: string[] = [];
    
    try {
      for (const student of students) {
        const entry = scoreEntries[student.id];
        if (!entry) continue;
        const ca = parseInt(entry.ca) || 0;
        const exam = parseInt(entry.exam) || 0;
        const total = ca + exam;
        if (total === 0) continue;
        
        const payload = buildPayload(student.id, ca, exam);
        if (!payload) {
          errors++;
          failedStudents.push(student.full_name);
          continue;
        }
        
        const { error } = await supabase
          .from("primary_scores")
          .upsert(payload as any, {
            onConflict: "student_id,subject,term,academic_year",
          });
        if (error) {
          errors++;
          failedStudents.push(student.full_name);
          continue;
        }
        saved++;
        totalSum += total;
      }
      
      if (saved > 0) {
        const avgScore = Math.round(totalSum / saved);
        const message = `✅ Saved ${saved} score(s) (Avg: ${avgScore}/100)${errors > 0 ? `, ${errors} failed` : ""}`;
        toast.success(message);
        
        if (failedStudents.length > 0) {
          toast.error(`Failed for: ${failedStudents.join(", ")}`);
        }
        
        setSavedStatus((prev) => {
          const next = { ...prev };
          students.forEach((s) => {
            const e = scoreEntries[s.id];
            if (e && (parseInt(e.ca) || 0) + (parseInt(e.exam) || 0) > 0)
              next[s.id] = true;
          });
          return next;
        });
        
        // ✅ Refresh all data after saving
        await refreshAllData();
        
      } else if (errors > 0) {
        toast.error(`❌ Failed to save ${errors} student(s)`);
      } else {
        toast.info("No new scores to save");
      }
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    if (isLocked) {
      toast.error("Locked by another teacher");
      return;
    }
    setIsDeletingAll(true);
    setDeleteProgress(0);
    setShowDeleteAllDialog(false);
    try {
      const { data: toDelete, error: fetchError } = await supabase
        .from("primary_scores")
        .select("id")
        .eq("class", selectedClass)
        .eq("subject", selectedSubject)
        .eq("term", selectedTerm)
        .eq("academic_year", selectedYear);
      if (fetchError) throw fetchError;
      const rows = (toDelete ?? []) as { id: string }[];
      if (rows.length === 0) {
        toast.info("No scores to delete");
        return;
      }
      const total = rows.length;
      let deleted = 0;
      for (const row of rows) {
        const { error } = await supabase
          .from("primary_scores")
          .delete()
          .eq("id", row.id);
        if (!error) deleted++;
        setDeleteProgress(Math.round((deleted / total) * 100));
      }
      toast.success(`Deleted ${deleted} score(s)`);
      
      // ✅ Refresh all data after deleting
      await refreshAllData();
      
      resetScoreState();
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setIsDeletingAll(false);
      setDeleteProgress(0);
    }
  };

  const handleRefresh = async () => {
    const tid = toast.loading("Refreshing…");
    try {
      await Promise.all([
        fetchCurrentTerm(),
        selectedClass ? loadStudents(selectedClass) : Promise.resolve(),
        selectedClass && selectedTerm && selectedYear && isValidStaff && staffProfile?.id
          ? checkSubjectsStatus(
              selectedClass,
              selectedTerm,
              selectedYear,
              staffProfile.id,
            )
          : Promise.resolve(),
        selectedClass &&
        selectedSubject &&
        selectedTerm &&
        selectedYear &&
        students.length > 0
          ? loadScores(
              selectedClass,
              selectedSubject,
              selectedTerm,
              selectedYear,
              students,
            )
          : Promise.resolve(),
      ]);
      toast.success("Refreshed", { id: tid });
    } catch {
      toast.error("Refresh failed", { id: tid });
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════

  if (!mounted || isRestoring || isLoadingTerm) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative h-10 w-10 animate-spin text-emerald-600 mx-auto" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isLoadingTerm
                ? "Loading term settings…"
                : "Preparing assessment module…"}
            </p>
            <p className="text-xs text-slate-400">This won&apos;t take long</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ═══ Staff Status Banner ═══ */}
      {!isValidStaff && (
        <Card className="border-2 border-amber-400 bg-amber-50/80 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Staff Profile Issue
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {staffError || "Staff profile is not loaded properly. Save functionality is disabled."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Score Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              {selectedClass && selectedSubject
                ? `${selectedClass} · ${selectedSubject} · ${selectedTerm} · ${selectedYear}`
                : "Configure class and subject to begin"}
              {isValidStaff && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {staffDisplayName}
                </span>
              )}
              {!isValidStaff && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  No staff profile
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || checkingSubjects}
            className="h-9 gap-2 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                (loading || checkingSubjects) && "animate-spin",
              )}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* ═══ Stats Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Pupils"
          value={stats.totalStudents}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="Graded"
          value={stats.gradedStudents}
          sub={`of ${stats.totalStudents} pupils`}
          icon={GraduationCap}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          label="Class Average"
          value={stats.classAverage > 0 ? `${stats.classAverage}%` : "—"}
          icon={BarChart3}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          label="Pass Rate"
          value={stats.passRate > 0 ? `${stats.passRate}%` : "—"}
          sub={
            stats.gradedStudents > 0
              ? `${stats.passCount} pass · ${stats.failCount} fail`
              : undefined
          }
          icon={Award}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* ═══ Legend ═══ */}
      <div className="flex flex-wrap items-center gap-4 px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
          Status
        </span>
        <span className="flex items-center gap-1.5">
          <Circle className="h-3 w-3 text-slate-400" />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          Your scores
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-red-500" />
          Locked
        </span>
      </div>

      {/* ═══ Configuration ═══ */}
      <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Settings2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Configuration
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {students.length > 0
                    ? `${students.length} pupils loaded`
                    : "Select class to load pupils"}
                </p>
              </div>
            </div>
            {unsavedCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs border-amber-200 dark:border-amber-800">
                {unsavedCount} unsaved
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Class */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Class
              </Label>
              <Select
                value={selectedClass}
                onValueChange={(v) => {
                  setSelectedClass(v);
                  setSelectedSubject("");
                  resetScoreState();
                }}
              >
                <SelectTrigger className="h-10 bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem
                      key={cls.id}
                      value={cls.name}
                      className="text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {cls.code}
                        </span>
                        {cls.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subject
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={(v) => {
                  setSelectedSubject(v);
                  resetScoreState();
                }}
              >
                <SelectTrigger className="h-10 bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <SelectValue placeholder="Select subject">
                    {selectedSubject && (
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="truncate">{selectedSubject}</span>
                        <SubjectStatusIcon
                          status={subjectsStatus[selectedSubject]}
                        />
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {checkingSubjects ? (
                    <div className="flex items-center gap-2 py-6 px-3 text-sm text-slate-500 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking availability…
                    </div>
                  ) : (
                    PRIMARY_SUBJECTS.map((sub) => (
                      <SelectItem key={sub} value={sub} className="text-sm">
                        <div className="flex items-center justify-between w-full gap-3">
                          <span>{sub}</span>
                          <SubjectStatusIcon status={subjectsStatus[sub]} />
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isLocked && selectedSubject && (
                <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50 text-xs animate-in fade-in slide-in-from-top-1">
                  <Lock className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Score entry locked
                    </p>
                    <p className="text-red-600 dark:text-red-500 mt-0.5">
                      {subjectsStatus[selectedSubject]?.otherTeacherName ||
                        "Another teacher"}{" "}
                      has entered scores for this subject.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Term */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Term
              </Label>
              <Select
                value={selectedTerm}
                onValueChange={(v) => {
                  setSelectedTerm(v);
                  resetScoreState();
                }}
              >
                <SelectTrigger className="h-10 bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((o, i) => (
                    <SelectItem
                      key={`${o.value}-${i}`}
                      value={o.value}
                      className="text-sm"
                    >
                      <span
                        className={cn(
                          o.is_current &&
                            "font-semibold text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {o.label}
                        {o.is_current && " ✦"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Session
              </Label>
              <Select
                value={selectedYear}
                onValueChange={(v) => {
                  setSelectedYear(v);
                  resetScoreState();
                }}
              >
                <SelectTrigger className="h-10 bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {availableSessions.map((s, i) => (
                    <SelectItem key={`${s}-${i}`} value={s} className="text-sm">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Score info */}
            <div className="flex items-end pb-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-8 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-500">
                    CA: 40 marks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-12 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-slate-500">
                    Exam: 60 marks
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleSaveAll}
              disabled={
                saving || students.length === 0 || isLocked || !selectedSubject || unsavedCount === 0 || !isValidStaff
              }
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20 h-9 gap-2 font-medium"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SaveAll className="h-4 w-4" />
              )}
              {!isValidStaff ? "No Staff" : isLocked ? "Locked" : saving ? "Saving…" : "Save All"}
            </Button>

            {unsavedCount > 0 && !saving && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {unsavedCount} unsaved change{unsavedCount !== 1 && "s"}
              </span>
            )}

            {!isValidStaff && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Staff profile missing
              </span>
            )}

            <Button
              onClick={() => setShowDeleteAllDialog(true)}
              disabled={scores.length === 0 || loading || isLocked}
              variant="ghost"
              size="sm"
              className="h-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 ml-auto gap-2"
            >
              <Trash className="h-3.5 w-3.5" />
              Delete All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══ Tabs ═══ */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="h-11 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl w-auto inline-flex gap-1 border border-slate-200/60 dark:border-slate-700/60">
          <TabsTrigger
            value="entry"
            className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 px-4 h-9 font-medium transition-all"
          >
            <FileText className="h-4 w-4" />
            Score Entry
            {students.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px] font-bold"
              >
                {students.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="view"
            className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 px-4 h-9 font-medium transition-all"
          >
            <Eye className="h-4 w-4" />
            View Scores
            {scores.length > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0">
                {scores.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Entry Tab ────────────────────────────────────────────────── */}
        <TabsContent value="entry" className="mt-0 space-y-4">
          {!selectedClass ? (
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <EmptyState
                  icon={BookOpen}
                  title="Select a Class"
                  description="Choose a class from the configuration panel above to load pupils and start entering scores."
                />
              </CardContent>
            </Card>
          ) : !selectedSubject ? (
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <EmptyState
                  icon={FileText}
                  title="Select a Subject"
                  description={`Class "${selectedClass}" is selected. Now choose a subject to enter scores for.`}
                />
              </CardContent>
            </Card>
          ) : isLocked ? (
            <Card className="border border-red-200/60 dark:border-red-900/40 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <EmptyState
                  icon={Lock}
                  title="Score Entry Locked"
                  description={`${selectedSubject} scores for ${selectedClass} were entered by ${subjectsStatus[selectedSubject]?.otherTeacherName || "another teacher"}. You cannot modify them.`}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const avail = PRIMARY_SUBJECTS.find(
                          (s) =>
                            !subjectsStatus[s]?.enteredByOther &&
                            s !== selectedSubject,
                        );
                        if (avail) setSelectedSubject(avail);
                        else toast.info("All subjects have scores entered.");
                      }}
                      className="gap-1.5"
                    >
                      Switch Subject <ChevronRight className="h-4 w-4" />
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="text-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  Loading pupils…
                </p>
              </CardContent>
            </Card>
          ) : students.length === 0 ? (
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <EmptyState
                  icon={Users}
                  title="No Pupils Found"
                  description={`No active pupils found in ${selectedClass}. Ensure pupils are enrolled and active.`}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadStudents(selectedClass)}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    {selectedSubject}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-sm text-slate-500">
                    {selectedClass}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold ml-1 h-5"
                  >
                    {students.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-6 rounded-full bg-emerald-400" />
                    CA /40
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-9 rounded-full bg-blue-400" />
                    Exam /60
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent bg-slate-50/50 dark:bg-slate-800/30">
                      <TableHead className="pl-5 font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">
                        Pupil
                      </TableHead>
                      <TableHead className="text-center font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">
                        Adm No
                      </TableHead>
                      <TableHead className="text-center font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                        CA /40
                      </TableHead>
                      <TableHead className="text-center font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                        Exam /60
                      </TableHead>
                      <TableHead className="text-center font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                        Total
                      </TableHead>
                      <TableHead className="text-center font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                        Remark
                      </TableHead>
                      <TableHead className="text-center pr-5 font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, idx) => {
                      const entry = scoreEntries[student.id] ?? {
                        ca: "",
                        exam: "",
                      };
                      const ca = parseInt(entry.ca) || 0;
                      const exam = parseInt(entry.exam) || 0;
                      const total = ca + exam;
                      const remark = total > 0 ? getRemark(total) : "";
                      const isSaved = savedStatus[student.id];

                      return (
                        <TableRow
                          key={student.id}
                          className={cn(
                            "border-slate-100/80 dark:border-slate-800/80 transition-all duration-200",
                            idx % 2 === 0
                              ? "bg-white dark:bg-slate-900"
                              : "bg-slate-50/30 dark:bg-slate-800/10",
                            isSaved &&
                              "bg-emerald-50/40 dark:bg-emerald-950/10",
                            !isSaved &&
                              total > 0 &&
                              "bg-amber-50/20 dark:bg-amber-950/5",
                          )}
                        >
                          <TableCell className="pl-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                                  isSaved
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                                )}
                              >
                                {student.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200 leading-tight">
                                  {student.full_name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {student.class_arm || student.class}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {student.admission_number}
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Input
                              type="number"
                              min="0"
                              max="40"
                              value={entry.ca}
                              onChange={(e) => {
                                if (isLocked) return;
                                const num = Math.min(
                                  40,
                                  Math.max(0, parseFloat(e.target.value) || 0),
                                );
                                setScoreEntries((prev) => ({
                                  ...prev,
                                  [student.id]: {
                                    ...prev[student.id],
                                    ca: String(num),
                                    is_saved: false,
                                  },
                                }));
                                setSavedStatus((prev) => ({
                                  ...prev,
                                  [student.id]: false,
                                }));
                              }}
                              className="w-[72px] h-9 text-center mx-auto text-sm font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 focus-visible:border-emerald-400 rounded-lg"
                              placeholder="0"
                              disabled={isLocked}
                            />
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Input
                              type="number"
                              min="0"
                              max="60"
                              value={entry.exam}
                              onChange={(e) => {
                                if (isLocked) return;
                                const num = Math.min(
                                  60,
                                  Math.max(0, parseFloat(e.target.value) || 0),
                                );
                                setScoreEntries((prev) => ({
                                  ...prev,
                                  [student.id]: {
                                    ...prev[student.id],
                                    exam: String(num),
                                    is_saved: false,
                                  },
                                }));
                                setSavedStatus((prev) => ({
                                  ...prev,
                                  [student.id]: false,
                                }));
                              }}
                              className="w-[72px] h-9 text-center mx-auto text-sm font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-blue-400 rounded-lg"
                              placeholder="0"
                              disabled={isLocked}
                            />
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <ScoreBar total={total} />
                          </TableCell>
                          <TableCell className="text-center py-3">
                            {remark ? (
                              <Badge
                                className={cn(
                                  getRemarkColor(remark),
                                  "font-semibold text-[11px] border px-2 py-0.5",
                                )}
                              >
                                {remark}
                              </Badge>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center pr-5 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveSingle(student.id)}
                              disabled={saving || isLocked || total === 0 || !isValidStaff}
                              className={cn(
                                "h-8 w-8 p-0 rounded-lg transition-all",
                                isSaved
                                  ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  : total > 0
                                    ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                    : "text-slate-300 dark:text-slate-600 cursor-not-allowed",
                              )}
                              title={!isValidStaff ? "Staff profile missing" : total === 0 ? "No scores to save" : isSaved ? "Already saved" : "Save score"}
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isSaved ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Table footer */}
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {Object.values(savedStatus).filter(Boolean).length} saved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    Avg: {stats.classAverage}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-3 w-3 text-amber-500" />
                    High: {stats.highestScore}
                  </span>
                  {unsavedCount > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {unsavedCount} unsaved
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSaveAll}
                  disabled={saving || isLocked || unsavedCount === 0 || !isValidStaff}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5 shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <SaveAll className="h-3.5 w-3.5" />
                  )}
                  Save All ({unsavedCount})
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ─── View Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="view" className="mt-0">
          <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Published Scores
                  </CardTitle>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center flex-wrap gap-1.5">
                    <span>
                      {selectedClass || "No class"} ·{" "}
                      {selectedSubject || "No subject"}
                    </span>
                    {isLocked && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] border-red-200 dark:border-red-800">
                        <Lock className="h-2.5 w-2.5 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search pupils…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      loadScores(
                        selectedClass,
                        selectedSubject,
                        selectedTerm,
                        selectedYear,
                        students,
                      )
                    }
                    disabled={loading || !selectedClass}
                    className="h-9 w-9 p-0 rounded-lg"
                  >
                    <RefreshCw
                      className={cn("h-3.5 w-3.5", loading && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedClass || !selectedSubject ? (
                <EmptyState
                  icon={FileText}
                  title="Configure Selection"
                  description="Select a class and subject above to view published scores."
                />
              ) : loading ? (
                <div className="text-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">
                    Loading scores…
                  </p>
                </div>
              ) : scores.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Scores Published"
                  description="Enter and save scores in the Score Entry tab to see them here."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("entry")}
                      disabled={isLocked}
                      className="gap-1.5"
                    >
                      Go to Score Entry <ChevronRight className="h-4 w-4" />
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-transparent">
                        {[
                          "Pupil",
                          "Adm. No",
                          "CA",
                          "Exam",
                          "Total",
                          "Remark",
                          "Teacher",
                          "Actions",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            className={cn(
                              "font-semibold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3",
                              h === "Pupil"
                                ? "pl-5 min-w-[180px]"
                                : "text-center",
                              h === "Actions" ? "pr-5" : "",
                            )}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScores.map((score, idx) => {
                        const total =
                          (score.ca_score || 0) + (score.exam_score || 0);
                        const remark = getRemark(total);
                        const name = getStudentName(score.student_id);
                        const isOwn = score.teacher_id === staffProfile?.id;

                        return (
                          <TableRow
                            key={score.id}
                            className={cn(
                              "border-slate-100/80 dark:border-slate-800/80 transition-colors",
                              idx % 2 === 0
                                ? "bg-white dark:bg-slate-900"
                                : "bg-slate-50/30 dark:bg-slate-800/10",
                            )}
                          >
                            <TableCell className="pl-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                  {name}
                                </span>
                                {!isOwn && (
                                  <Lock className="h-3 w-3 text-red-400 flex-shrink-0" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs font-mono text-slate-500 dark:text-slate-400">
                              {score.student_admission || "—"}
                            </TableCell>
                            <TableCell className="text-center text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {score.ca_score || "—"}
                            </TableCell>
                            <TableCell className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">
                              {score.exam_score || "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <ScoreBar total={total} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={cn(
                                  getRemarkColor(remark),
                                  "font-semibold text-[11px] border px-2 py-0.5",
                                )}
                              >
                                {remark}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {isOwn ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] gap-1 font-medium"
                                >
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                                  You
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] gap-1 font-medium border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                  {score.teacher_name || "Other"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center pr-5">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!isOwn}
                                  onClick={() => {
                                    setEditingScore(score);
                                    setShowEditDialog(true);
                                  }}
                                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-20"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!isOwn}
                                  onClick={async () => {
                                    if (!confirm("Delete this score?")) return;
                                    const { error } = await supabase
                                      .from("primary_scores")
                                      .delete()
                                      .eq("id", score.id);
                                    if (error) {
                                      toast.error("Failed to delete");
                                      return;
                                    }
                                    toast.success("Deleted");
                                    await refreshAllData();
                                  }}
                                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ Delete All Dialog ═══ */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                Delete All Scores?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pl-[52px]">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    selectedClass,
                    selectedSubject,
                    selectedTerm,
                    selectedYear,
                  ].map(
                    (v, i) =>
                      v && (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[11px] font-medium"
                        >
                          {v}
                        </Badge>
                      ),
                  )}
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/50">
                  <Database className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {scores.length} record{scores.length !== 1 ? "s" : ""} will
                    be permanently deleted
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-3">
            <AlertDialogCancel
              disabled={isDeletingAll}
              className="h-9 rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="bg-red-600 hover:bg-red-700 text-white h-9 gap-1.5 rounded-lg shadow-sm"
            >
              {isDeletingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ Delete Progress ═══ */}
      <Dialog
        open={isDeletingAll && deleteProgress > 0 && deleteProgress < 100}
        onOpenChange={() => {}}
      >
        <DialogContent className="max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
              Deleting scores…
            </DialogTitle>
            <DialogDescription className="sr-only">
              Deletion in progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <ProgressBar value={deleteProgress} />
            <p className="text-right text-xs text-slate-500 font-medium tabular-nums">
              {deleteProgress}%
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Edit Score Dialog ═══ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Edit Score
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
              {getStudentName(editingScore?.student_id ?? "")}
            </DialogDescription>
          </DialogHeader>

          {editingScore &&
            (() => {
              const editTotal =
                (editingScore.ca_score || 0) + (editingScore.exam_score || 0);
              const editRemark = getRemark(editTotal);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        CA /40
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={editingScore.ca_score ?? 0}
                        onChange={(e) =>
                          setEditingScore({
                            ...editingScore,
                            ca_score: Math.min(
                              40,
                              parseInt(e.target.value) || 0,
                            ),
                          })
                        }
                        className="h-10 text-center text-sm font-medium rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Exam /60
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        value={editingScore.exam_score ?? 0}
                        onChange={(e) =>
                          setEditingScore({
                            ...editingScore,
                            exam_score: Math.min(
                              60,
                              parseInt(e.target.value) || 0,
                            ),
                          })
                        }
                        className="h-10 text-center text-sm font-medium rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                        Total
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                          {editTotal}
                        </span>
                        <Badge
                          className={cn(
                            getRemarkColor(editRemark),
                            "text-[10px] font-bold border",
                          )}
                        >
                          {editRemark}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <ScoreBar total={editTotal} />
                    </div>
                  </div>
                </div>
              );
            })()}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm gap-1.5"
              onClick={async () => {
                if (!editingScore) return;
                const ca = editingScore.ca_score || 0;
                const exam = editingScore.exam_score || 0;
                const total = ca + exam;
                const updateData: ScoreUpdate = {
                  ca_score: ca,
                  exam_score: exam,
                  total_score: total,
                  remark: getRemark(total),
                  updated_at: new Date().toISOString(),
                };
                const { error } = await supabase
                  .from("primary_scores")
                  .update(updateData as never)
                  .eq("id", editingScore.id);
                if (error) {
                  toast.error("Failed to update");
                  return;
                }
                toast.success("Score updated");
                setShowEditDialog(false);
                await refreshAllData();
              }}
            >
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}