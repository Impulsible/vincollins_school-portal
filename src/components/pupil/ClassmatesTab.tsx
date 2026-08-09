/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { 
  Users, 
  Search,
  ChevronRight,
  User,
  GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ClassmatesTabProps {
  classmates: any[]
  profile: any
}

export function ClassmatesTab({ classmates, profile }: ClassmatesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)

  // Get unique classes for filter
  const classes = ['all', ...new Set(classmates.map((c: any) => c.class).filter(Boolean))]

  // Filter classmates
  const filteredClassmates = classmates.filter((c: any) => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === 'all' || c.class === selectedClass
    return matchesSearch && matchesClass
  })

  // Show only first 6 if not showing all
  const displayedClassmates = showAll ? filteredClassmates : filteredClassmates.slice(0, 6)

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0]?.toUpperCase() || '?'
  }

  const getFullName = (classmate: any) => {
    if (classmate.full_name) return classmate.full_name
    if (classmate.first_name && classmate.last_name) {
      return `${classmate.first_name} ${classmate.last_name}`
    }
    return classmate.first_name || 'Unknown'
  }

  const getClassDisplay = (classmate: any) => {
    if (classmate.class) return classmate.class
    if (classmate.class_arm) return classmate.class_arm
    return 'Not Assigned'
  }

  const roleColors = {
    primary: '#059669',
    light: '#ECFDF5',
    dark: '#047857',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Classmates</h1>
          <p className="text-sm text-slate-500">Connect with your classmates</p>
        </div>
        <Badge variant="default" className="text-sm">
          {filteredClassmates.length} Classmates
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search classmates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2472]/20"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : cls}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Classmates Grid */}
      {filteredClassmates.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-slate-400 text-sm">No classmates found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedClassmates.map((classmate: any) => (
              <Card 
                key={classmate.id} 
                className="border-0 shadow-soft hover:shadow-lg transition-all hover:scale-[1.02] duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="w-14 h-14 border-2 border-white shadow-md flex-shrink-0">
                      <AvatarImage src={classmate.photo_url} />
                      <AvatarFallback 
                        className="text-white font-bold text-lg"
                        style={{ backgroundColor: roleColors.primary }}
                      >
                        {getInitials(getFullName(classmate))}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Name and Class */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {getFullName(classmate)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium"
                        >
                          {getClassDisplay(classmate)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* View button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Show More / Show Less Button */}
          {filteredClassmates.length > 6 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
              >
                {showAll ? (
                  <>Show Less</>
                ) : (
                  <>Show All {filteredClassmates.length} Classmates</>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}