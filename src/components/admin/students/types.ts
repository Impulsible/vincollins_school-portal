export interface Student {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  role: 'student'
  class?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
  admission_number?: string
  admission_year?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  password_changed?: boolean
}

export interface StudentFormData {
  first_name: string
  middle_name: string
  last_name: string
  class: string
  phone: string
  address: string
  admission_year: string
  admission_number: string
  gender: string
  date_of_birth: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  email: string
}