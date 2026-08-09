/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Staff {
  last_name: any
  first_name: any
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  role: 'staff' | 'teacher'
  department?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
  date_joined?: string
  gender?: string
  photo_url?: string
  password_changed?: boolean
  title?: string
}

export interface StaffFormData {
  first_name: string
  middle_name: string
  last_name: string
  department: string
  phone: string
  address: string
  date_joined: string
  gender: string
  title: string
  email: string
}