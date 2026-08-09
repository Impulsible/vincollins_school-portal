/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { 
  Award, 
  FileText, 
  Download, 
  Printer,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ReportCardTabProps {
  reportCards: any[]
  profile: any
  currentTerm: string
  currentSession: string
}

export function ReportCardTab({ reportCards, profile, currentTerm, currentSession }: ReportCardTabProps) {
  const [selectedTerm, setSelectedTerm] = useState<string>(currentTerm || 'all')
  const [selectedSession, setSelectedSession] = useState<string>(currentSession || 'all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Get unique terms and sessions for filters
  const terms = ['all', ...new Set(reportCards.map((r: any) => r.term))].filter(Boolean)
  const sessions = ['all', ...new Set(reportCards.map((r: any) => r.session_year))].filter(Boolean)

  const filteredCards = reportCards.filter((r: any) => {
    const matchTerm = selectedTerm === 'all' || r.term === selectedTerm
    const matchSession = selectedSession === 'all' || r.session_year === selectedSession
    return matchTerm && matchSession
  })

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <Badge variant="success" className="text-xs">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status || 'Draft'}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Report Cards</h1>
          <p className="text-sm text-slate-500">View and download your report cards</p>
        </div>
        <Badge variant="default" className="text-sm">
          {filteredCards.length} Report Cards
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term === 'all' ? 'All Terms' : term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session} value={session}>
                    {session === 'all' ? 'All Sessions' : session}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards List */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-0">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-slate-400 text-sm">No report cards available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCards.map((card: any) => (
                <div key={card.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}
                  >
                    <div className="mt-0.5">
                      {card.status === 'approved' || card.status === 'completed' ? (
                        <Award className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {card.term || currentTerm} Term Report
                        </h3>
                        {getStatusBadge(card.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span>Session: {card.session_year || currentSession}</span>
                        <span>•</span>
                        <span>{profile?.class || 'Class'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.status === 'approved' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Print">
                            <Printer className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedId === card.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content - Subjects */}
                  {expandedId === card.id && (
                    <div className="mt-3 pl-7 border-t border-slate-100 pt-3">
                      {card.subjects && card.subjects.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-500">Subjects</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {card.subjects.map((subject: any, idx: number) => (
                              <div 
                                key={idx} 
                                className="flex items-center justify-between p-2 bg-[#F9F7F4] rounded-lg"
                              >
                                <span className="text-sm text-slate-700">{subject.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {subject.grade || '-'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="font-medium">Average: {card.average || 'N/A'}%</span>
                            <span className="font-medium">Grade: {card.grade || 'N/A'}</span>
                          </div>
                          {card.teacher_comment && (
                            <p className="text-sm text-slate-600 mt-2">
                              <span className="font-medium">Teacher's Comment:</span> {card.teacher_comment}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No subject details available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}