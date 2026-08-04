/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  console.log('📦 API called: Create User')
  
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials')
      return NextResponse.json({ 
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
      phone, 
      address,
      admission_year,
      admission_number,
      gender,
      date_of_birth,
      next_term_begins,
      join_year,
      email: customEmail,
      guardian_name,
      guardian_phone,
      guardian_email,
      emergency_contact,
      medical_notes
    } = body
    
    // Validate required fields
    if (!first_name || !last_name || !role) {
      return NextResponse.json({ 
        error: 'First name, last name, and role are required' 
      }, { status: 400 })
    }
    
    // Helper functions
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
    
    // Generate VIN ID
    const year = admission_year || join_year || new Date().getFullYear()
    let vin_id = generateVINId(role, year)
    
    // Check if VIN ID exists and regenerate if needed
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
    
    // Generate email
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
    
    // Build full name
    let fullName = last_name.trim() + ' ' + first_name.trim()
    if (middle_name && middle_name.trim()) {
      fullName += ' ' + middle_name.trim()
    }
    fullName = capitalizeWords(fullName)
    const displayName = fullName
    
    console.log('📧 Creating user:', { email, vin_id, fullName, displayName, role })
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: vin_id, // Use VIN ID as initial password
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        display_name: displayName,
        first_name: capitalizeWords(first_name.trim()),
        middle_name: middle_name?.trim() ? capitalizeWords(middle_name.trim()) : '',
        last_name: capitalizeWords(last_name.trim()),
        role: role,
        vin_id: vin_id
      }
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }
    
    const userId = authData.user.id
    console.log('✅ Auth user created:', userId)
    
    // Step 2: Insert into profiles
    const profileData: any = {
      id: userId,
      vin_id: vin_id,
      full_name: fullName,
      display_name: displayName,
      first_name: capitalizeWords(first_name.trim()),
      last_name: capitalizeWords(last_name.trim()),
      email: email,
      role: role,
      phone: phone || null,
      address: address || null,
      is_active: true,
      password_changed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Add optional fields
    if (middle_name?.trim()) {
      profileData.middle_name = capitalizeWords(middle_name.trim())
    }
    if (role === 'student' || role === 'student') {
      if (studentClass) profileData.class = studentClass
      if (admission_year) profileData.admission_year = admission_year
      if (admission_number) profileData.admission_number = admission_number
      if (guardian_name) profileData.guardian_name = guardian_name
      if (guardian_phone) profileData.guardian_phone = guardian_phone
      if (guardian_email) profileData.guardian_email = guardian_email
      if (emergency_contact) profileData.emergency_contact = emergency_contact
      if (medical_notes) profileData.medical_notes = medical_notes
    }
    if (role === 'teacher' || role === 'staff') {
      if (department) profileData.department = department
      if (join_year) profileData.join_year = join_year
    }
    if (gender) profileData.gender = gender
    if (date_of_birth) profileData.date_of_birth = date_of_birth
    if (next_term_begins) profileData.next_term_begins = next_term_begins
    
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
        error: `Failed to create profile: ${profileError.message}`
      }, { status: 500 })
    }
    
    console.log('✅ Profile created:', profile?.id)
    
    // Success!
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: userId, 
        email: email, 
        full_name: fullName,
        display_name: displayName,
        vin_id: vin_id,
        role: role,
        admission_number: admission_number?.trim() || '',
        gender: gender || null,
        class: studentClass || null,
        department: department || null,
      },
      credentials: {
        email: email,
        password: vin_id,
        vin_id: vin_id,
        admission_number: admission_number?.trim() || '',
      }
    })
    
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}