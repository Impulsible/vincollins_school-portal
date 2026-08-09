/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { 
  NotebookPen, 
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen
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

interface NotesTabProps {
  notes: any[]
  profile: any
}

export function NotesTab({ notes, profile }: NotesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredNotes = notes.filter((n: any) => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Notes</h1>
          <p className="text-sm text-slate-500">Study notes for your classes</p>
        </div>
        <Badge variant="default" className="text-sm">
          {notes.length} Notes Available
        </Badge>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-0">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📓</div>
              <p className="text-slate-400 text-sm">No notes available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotes.map((note: any) => (
                <div key={note.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                  >
                    <div className="mt-0.5">
                      <NotebookPen className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {note.title}
                        </h3>
                        {note.subject && (
                          <Badge variant="outline" className="text-xs">
                            {note.subject}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span>Class: {note.class || profile?.class || 'General'}</span>
                        {note.created_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedId === note.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === note.id && (
                    <div className="mt-3 pl-7 border-t border-slate-100 pt-3">
                      <div className="prose prose-sm max-w-none text-slate-600">
                        <p className="whitespace-pre-wrap">{note.content || 'No content available'}</p>
                      </div>
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-slate-500">Attachments:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {note.attachments.map((file: string, i: number) => (
                              <Button key={i} variant="outline" size="sm" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {file}
                              </Button>
                            ))}
                          </div>
                        </div>
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