// app/api/admin/users/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── GET: Fetch users ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  console.log('📦 API called: GET Users')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const id = searchParams.get('id')
    
    let query = supabaseAdmin.from('profiles').select('*')
    
    if (id) {
      query = query.eq('id', id)
    }
    
    if (role) {
      // For staff, include both 'staff' and 'teacher' roles
      if (role === 'staff') {
        query = query.in('role', ['staff', 'teacher'])
      } else {
        query = query.eq('role', role)
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Fetch error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      data: data 
    })
    
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

// ─── POST: Create user ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log('📦 API called: POST Create User')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials')
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const body = await req.json()
    console.log('📦 Received body:', JSON.stringify(body, null, 2))
    
    const { 
      first_name, 
      middle_name,
      last_name, 
      role, 
      class: studentClass, 
      department,
      admission_number,
      admission_year,
      gender,
      email: customEmail,
      guardian_name,
      guardian_phone,
      guardian_email,
      phone,
      address,
      date_of_birth,
      join_year,
      title,
    } = body
    
    // ─── Validation ─────────────────────────────────────────────────────
    if (!first_name || !last_name || !role) {
      return NextResponse.json({ 
        success: false,
        error: 'First name, last name, and role are required' 
      }, { status: 400 })
    }

    // For students, require class and admission_year
    if (role === 'student' || role === 'pupil') {
      if (!studentClass) {
        return NextResponse.json({ 
          success: false,
          error: 'Class is required for students' 
        }, { status: 400 })
      }
      if (!admission_year) {
        return NextResponse.json({ 
          success: false,
          error: 'Admission year is required for students' 
        }, { status: 400 })
      }
    }
    
    // ─── Helper functions ──────────────────────────────────────────────
    const capitalizeWords = (str: string): string => {
      if (!str) return ''
      return str
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
    
    const generateVINId = (role: string, year: number): string => {
      const prefixes: Record<string, string> = {
        admin: 'VIN-ADM',
        staff: 'VIN-STF',
        teacher: 'VIN-TCH',
        student: 'VIN-STD'
      }
      const prefix = prefixes[role] || 'VIN-STD'
      const randomNum = Math.floor(Math.random() * 9000) + 1000
      return `${prefix}-${year}-${randomNum}`
    }
    
    // ─── Determine year for VIN ─────────────────────────────────────────
    const year = admission_year ? parseInt(admission_year) : (join_year ? parseInt(join_year) : new Date().getFullYear())
    let vin_id = generateVINId(role, year)
    
    let vinExists = true
    let attempts = 0
    while (vinExists && attempts < 10) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('vin_id')
        .eq('vin_id', vin_id)
        .single()
      
      if (!existingUser) {
        vinExists = false
      } else {
        vin_id = generateVINId(role, year)
        attempts++
      }
    }
    
    // ─── Generate email if not provided ───────────────────────────────
    let email = customEmail
    if (!email) {
      const sanitizedFirst = first_name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'user'
      const sanitizedLast = last_name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'account'
      
      let baseEmail = `${sanitizedFirst}.${sanitizedLast}@vincollins.edu.ng`
      let counter = 1
      let emailExists = true
      
      while (emailExists && counter < 20) {
        const { data: existingUser } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('email', baseEmail)
          .single()
        
        if (!existingUser) {
          emailExists = false
        } else {
          baseEmail = `${sanitizedFirst}.${sanitizedLast}${counter}@vincollins.edu.ng`
          counter++
        }
      }
      email = baseEmail
    }
    
    // ─── Build full name ──────────────────────────────────────────────
    let fullName = last_name.trim() + ' ' + first_name.trim()
    if (middle_name && middle_name.trim()) {
      fullName += ' ' + middle_name.trim()
    }
    fullName = capitalizeWords(fullName)
    const displayName = fullName
    
    console.log('📧 Creating user:', { email, vin_id, fullName, displayName, role, year })
    
    // ─── Create auth user with VIN ID as password ─────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: vin_id,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        display_name: displayName,
        first_name: capitalizeWords(first_name.trim()),
        middle_name: middle_name?.trim() ? capitalizeWords(middle_name.trim()) : '',
        last_name: capitalizeWords(last_name.trim()),
        role: role,
        vin_id: vin_id,
        ...(admission_year && { admission_year: year }),
        ...(title && { title }),
      }
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ 
          success: false,
          error: 'A user with this email already exists. Please use a different email.'
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        success: false,
        error: authError.message 
      }, { status: 500 })
    }
    
    const userId = authData.user.id
    console.log('✅ Auth user created:', userId)
    
    // ─── Insert into profiles ─────────────────────────────────────────
    const profileData: any = {
      id: userId,
      vin_id: vin_id,
      full_name: fullName,
      display_name: displayName,
      first_name: capitalizeWords(first_name.trim()),
      last_name: capitalizeWords(last_name.trim()),
      email: email,
      role: role,
      is_active: true,
      password_changed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Add optional fields
    if (middle_name?.trim()) {
      profileData.middle_name = capitalizeWords(middle_name.trim())
    }
    if (title) profileData.title = title
    if (department) profileData.department = department
    if (join_year) profileData.join_year = join_year
    if (gender) profileData.gender = gender
    if (phone) profileData.phone = phone
    if (address) profileData.address = address
    if (date_of_birth) profileData.date_of_birth = date_of_birth
    
    // Student-specific fields
    if (role === 'student' || role === 'pupil') {
      if (studentClass) profileData.class = studentClass
      if (admission_year) profileData.admission_year = parseInt(admission_year)
      if (admission_number) profileData.admission_number = admission_number
      if (guardian_name) profileData.guardian_name = guardian_name
      if (guardian_phone) profileData.guardian_phone = guardian_phone
      if (guardian_email) profileData.guardian_email = guardian_email
    }
    
    console.log('💾 Profile insert data:', JSON.stringify(profileData, null, 2))
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Profile insert failed:', profileError)
      // Rollback: Delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log('🔄 Rolled back auth user')
      return NextResponse.json({ 
        success: false,
        error: `Failed to create profile: ${profileError.message}`
      }, { status: 500 })
    }
    
    console.log('✅ Profile created:', profile?.id)
    
    // ─── Return success with credentials ─────────────────────────────
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: userId, 
        email: email, 
        full_name: fullName,
        display_name: displayName,
        vin_id: vin_id,
        role: role,
        admission_number: admission_number || '',
        admission_year: year,
        gender: gender || null,
        class: studentClass || null,
        department: department || null,
      },
      credentials: {
        email: email,
        password: vin_id,
        vin_id: vin_id,
        admission_number: admission_number || '',
        admission_year: year,
      }
    })
    
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

// ─── PUT: Update user ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  console.log('📦 API called: PUT Update User')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const body = await req.json()
    console.log('📦 Received body:', JSON.stringify(body, null, 2))
    
    const { 
      id,
      first_name,
      middle_name,
      last_name,
      class: studentClass,
      gender,
      phone,
      address,
      date_of_birth,
      guardian_name,
      guardian_phone,
      guardian_email,
      admission_number,
      admission_year,
      is_active,
      role,
      full_name,
      department,
      title,
    } = body
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'User ID is required' 
      }, { status: 400 })
    }
    
    // ─── Build update data ─────────────────────────────────────────────
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (first_name) updateData.first_name = capitalizeWords(first_name.trim())
    if (last_name) updateData.last_name = capitalizeWords(last_name.trim())
    if (middle_name) updateData.middle_name = capitalizeWords(middle_name.trim())
    if (full_name) updateData.full_name = full_name
    if (studentClass) updateData.class = studentClass
    if (gender) updateData.gender = gender
    if (phone) updateData.phone = phone
    if (address) updateData.address = address
    if (date_of_birth) updateData.date_of_birth = date_of_birth
    if (guardian_name) updateData.guardian_name = guardian_name
    if (guardian_phone) updateData.guardian_phone = guardian_phone
    if (guardian_email) updateData.guardian_email = guardian_email
    if (admission_number) updateData.admission_number = admission_number
    if (admission_year) updateData.admission_year = admission_year
    if (is_active !== undefined) updateData.is_active = is_active
    if (role) updateData.role = role
    if (department) updateData.department = department
    if (title) updateData.title = title
    
    // ─── Update profile ────────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Update failed:', profileError)
      return NextResponse.json({ 
        success: false,
        error: profileError.message 
      }, { status: 500 })
    }
    
    console.log('✅ Profile updated:', profile?.id)
    
    return NextResponse.json({ 
      success: true,
      data: profile,
      message: 'User updated successfully'
    })
    
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

// ─── DELETE: Delete user ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  console.log('📦 API called: DELETE User')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'User ID is required' 
      }, { status: 400 })
    }
    
    // ─── First, delete the profile ─────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)
    
    if (profileError) {
      console.error('❌ Delete profile failed:', profileError)
      return NextResponse.json({ 
        success: false,
        error: profileError.message 
      }, { status: 500 })
    }
    
    // ─── Then, delete the auth user ────────────────────────────────────
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    
    if (authError) {
      console.error('❌ Delete auth user failed:', authError)
      return NextResponse.json({ 
        success: false,
        error: authError.message 
      }, { status: 500 })
    }
    
    console.log('✅ User deleted:', id)
    
    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    })
    
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

// ─── Helper function ─────────────────────────────────────────────────────────
function capitalizeWords(str: string): string {
  if (!str) return ''
  return str
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}