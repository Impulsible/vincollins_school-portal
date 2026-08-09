/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/layout/header/types.ts

// ✅ 3 roles: Admin, Teacher/Staff, Pupil
export type UserRole = 'admin' | 'teacher' | 'pupil'

export interface HeaderUser {
  id: string
  name: string
  firstName: string
  email: string
  role: UserRole
  avatar?: string
  isAuthenticated: boolean
}

export interface SchoolSettings {
  school_name?: string | null
  logo_path?: string | null
  school_phone?: string | null
  school_email?: string | null
  school_motto?: string | null
  school_address?: string | null
  current_term?: string | null
  current_session?: string | null
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message?: string | null
  type?: string
  is_read: boolean // ✅ Only use is_read, remove 'read'
  link?: string | null
  data?: Record<string, any> | null
  created_at: string
  updated_at?: string | null
}

export interface NavigationItem {
  name: string
  href: string
  icon: any
  isDropdown?: boolean
  dropdownItems?: { name: string; href: string; icon: any }[]
}