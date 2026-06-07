export interface User {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string | null
  email: string | null
  phone: string | null
  profile_photo_url: string | null
  role: 'volunteer' | 'client' | 'advisor'
  privacy_agreement: boolean
  privacy_agreement_timestamp: string | null
  account_status: 'waiting_for_interview' | 'verified'
  is_admin: boolean
  created_at: string
  updated_at: string
  client?: Client
}

export interface Client {
  id: number
  personal_description: string | null
  status: 'seeking help' | 'not seeking'
  membership_active: boolean
  background_notes?: string | null
  user_id: number
  user?: User
  subscriptions?: Subscription[]
}

export interface Volunteer {
  id: number
  personal_description: string | null
  background_notes: string | null
  user_id: number
  user?: User
  availabilities?: Availability[]
  categories?: HelpRequestCategory[]
  is_favorited?: boolean
}

export interface Advisor {
  id: number
  user_id: number
  user?: User
}

export interface Address {
  id: number
  postal_code: string | null
  municipality: string | null
  street: string | null
  house_number: number | null
  bus: string | null
  user_id: number
}

export interface Availability {
  id: number
  date: string
  time_of_day: 'morning' | 'afternoon' | 'evening'
  volunteer_id: number
}

export interface HelpRequestCategory {
  id: number
  name: string
  description: string | null
  icon: string | null
}

export interface HelpRequest {
  id: number
  extra_notes: string | null
  region: string | null
  date: string | null
  time: string | null
  status: 'open' | 'matched' | 'completed' | 'cancelled'
  help_request_category_id: number
  client_id: number
  volunteer_id: number | null
  category?: HelpRequestCategory
  client?: Client
  volunteer?: Volunteer
  appointments?: Appointment[]
}

export interface Appointment {
  id: number
  type: 'introduction' | 'assistance'
  date: string
  start_time: string
  end_time: string
  location: string
  status: 'planned' | 'completed' | 'cancelled'
  volunteer_id: number | null
  advisor_id: number | null
  client_id: number | null
  help_request_id: number | null
  client?: Client
  volunteer?: Volunteer
  help_request?: HelpRequest & { category?: HelpRequestCategory }
}

export interface AppointmentNote {
  id: number
  document_url: string | null
  client_id: number | null
  volunteer_id: number | null
  advisor_id: number
}

export interface Intake {
  id: number
  status: 'pending' | 'scheduled'
  document_url: string | null
  notes: string | null
  advisor_id: number
  user_id: number
  appointment_id: number | null
  user?: User
  appointment?: Appointment
  created_at: string
  updated_at: string
}

export interface Review {
  id: number
  content: string
  created_at: string
  client?: Client
  appointment?: Appointment & { help_request?: HelpRequest & { category?: HelpRequestCategory } }
}

export interface Subscription {
  id: number
  start_date: string
  end_date: string
  amount: number
  status: 'pending' | 'active' | 'cancelled' | 'expired'
  paid_at: string | null
  client_id: number
  client?: Client
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  per_page: number
  total: number
  last_page: number
  next_page_url: string | null
  prev_page_url: string | null
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface LoginPayload {
  email?: string
  phone?: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email?: string
  password: string
  password_confirmation: string
  phone?: string
  date_of_birth?: string
  role: 'volunteer' | 'client'
  contact_preference: 'email' | 'phone'
  privacy_agreement: true
}

export interface LoginResponse {
  user: User
  token: string
}
