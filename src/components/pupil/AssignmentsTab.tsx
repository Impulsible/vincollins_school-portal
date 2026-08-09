/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AssignmentsTabProps {
  assignments: any[]
  profile: any
}

export function AssignmentsTab({ assignments, profile }: AssignmentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'graded':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'graded':
        return <Badge variant="success" className="text-xs">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status || 'Unknown'}</Badge>
    }
  }

  const filteredAssignments = assignments.filter((a: any) => {
    const matchesSearch = a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: assignments.length,
    completed: assignments.filter((a: any) => a.status === 'completed' || a.status === 'graded').length,
    pending: assignments.filter((a: any) => a.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Assignments</h1>
          <p className="text-sm text-slate-500">Track and complete your assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {stats.completed} Completed
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {stats.pending} Pending
          </Badge>
          <Badge variant="default" className="text-sm">
            {stats.total} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-0">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-slate-400 text-sm">No assignments found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAssignments.map((assignment: any) => (
                <div key={assignment.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === assignment.id ? null : assignment.id)}
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(assignment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span>{assignment.subject}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {assignment.due_date || 'No due date'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.score !== undefined && (
                        <Badge variant="outline" className="text-xs font-semibold">
                          Score: {assignment.score}%
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedId === assignment.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === assignment.id && (
                    <div className="mt-3 pl-7 space-y-3 border-t border-slate-100 pt-3">
                      <div className="text-sm text-slate-600">
                        <p><span className="font-medium">Description:</span> {assignment.description || 'No description provided'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {assignment.instructions && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Instructions:</span> {assignment.instructions}
                          </div>
                        )}
                        {assignment.attachment && (
                          <Button variant="outline" size="sm" className="text-xs">
                            📎 Download Attachment
                          </Button>
                        )}
                      </div>
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