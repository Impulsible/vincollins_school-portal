/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local')
    throw new Error('Missing Supabase environment variables on server')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function capitalizeWords(str: string): string {
  if (!str) return ''
  return str
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function generateVINId(role: string, year: number): string {
  const prefixes: Record<string, string> = {
    admin: 'VIN-ADM',
    staff: 'VIN-STF',
    teacher: 'VIN-TCH',
    student: 'VIN-STD',
    pupil: 'VIN-STD',
  }
  const prefix = prefixes[role.toLowerCase()] || 'VIN-STF'
  const randomNum = Math.floor(Math.random() * 9000) + 1000
  return `${prefix}-${year}-${randomNum}`
}

// ─── Helper: Check admission number uniqueness ────────────────────────────────
async function checkAdmissionNumberUnique(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  admissionNumber: string,
  excludeUserId?: string
): Promise<{ unique: boolean; conflictName?: string }> {
  const admNo = admissionNumber.trim().toUpperCase()
  if (!admNo) return { unique: true }  // empty → always allowed

  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, display_name')
    .eq('admission_number', admNo)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data } = await query.maybeSingle()

  if (data) {
    return {
      unique: false,
      conflictName: data.full_name || data.display_name || 'another pupil',
    }
  }
  return { unique: true }
}

// ─── GET: Fetch users ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const id = searchParams.get('id')

    let query = supabaseAdmin.from('profiles').select('*')

    if (id) {
      query = query.eq('id', id)
    }

    if (role) {
      if (role === 'staff') {
        query = query.in('role', ['staff', 'teacher'])
      } else {
        query = query.eq('role', role)
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ GET profiles error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('❌ GET API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── POST: Create User ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log('📦 API called: POST Create User')

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await req.json()
    console.log('📦 Received body:', JSON.stringify(body, null, 2))

    // Support both camelCase and snake_case inputs from frontend
    const firstName = body.first_name || body.firstName || ''
    const middleName = body.middle_name || body.middleName || ''
    const lastName = body.last_name || body.lastName || ''
    const role = (body.role || '').toLowerCase()
    const studentClass = body.class || body.studentClass || ''
    const department = body.department || ''
    const admissionNumber = (body.admission_number || body.admissionNumber || '').trim().toUpperCase()
    const admissionYear = body.admission_year || body.admissionYear
    const gender = body.gender || null
    const customEmail = body.email || body.customEmail || ''
    const guardianName = body.guardian_name || body.guardianName || ''
    const guardianPhone = body.guardian_phone || body.guardianPhone || ''
    const guardianEmail = body.guardian_email || body.guardianEmail || ''
    const phone = body.phone || ''
    const address = body.address || ''
    const dateOfBirth = body.date_of_birth || body.dateOfBirth || null
    const joinYear = body.join_year || body.joinYear
    const title = body.title || ''

    // ─── 1. Validation ──────────────────────────────────────────────────
    if (!firstName.trim() || !lastName.trim() || !role) {
      const missing = []
      if (!firstName.trim()) missing.push('First Name')
      if (!lastName.trim()) missing.push('Last Name')
      if (!role) missing.push('Role')
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if ((role === 'student' || role === 'pupil') && (!studentClass || !admissionYear)) {
      return NextResponse.json(
        { success: false, error: 'Class and Admission Year are required for student accounts.' },
        { status: 400 }
      )
    }

    // ─── 1b. Admission Number — OPTIONAL but must be unique if provided ─
    if (admissionNumber) {
      const { unique, conflictName } = await checkAdmissionNumberUnique(supabaseAdmin, admissionNumber)
      if (!unique) {
        return NextResponse.json(
          { success: false, error: `Admission number "${admissionNumber}" already exists for ${conflictName}` },
          { status: 409 }
        )
      }
    }

    // Parse Integer fields safely
    const parsedJoinYear = joinYear && !isNaN(parseInt(joinYear)) ? parseInt(joinYear) : new Date().getFullYear()
    const parsedAdmissionYear = admissionYear && !isNaN(parseInt(admissionYear)) ? parseInt(admissionYear) : new Date().getFullYear()
    const yearForVin = role === 'student' || role === 'pupil' ? parsedAdmissionYear : parsedJoinYear

    // ─── 2. Generate unique VIN ID ─────────────────────────────────────
    let vin_id = generateVINId(role, yearForVin)
    let vinExists = true
    let attempts = 0

    while (vinExists && attempts < 10) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('vin_id')
        .eq('vin_id', vin_id)
        .maybeSingle()

      if (!existingUser) {
        vinExists = false
      } else {
        vin_id = generateVINId(role, yearForVin)
        attempts++
      }
    }

    // ─── 3. Determine Email & Handle Duplicates ─────────────────────────
    let email = customEmail.trim()
    const isAutoEmail = !email

    if (!email) {
      const sanitizedFirst = firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'user'
      const sanitizedLast = lastName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'account'
      email = `${sanitizedFirst}.${sanitizedLast}@vincollins.edu.ng`
    }

    // ─── 4. Format Names ───────────────────────────────────────────────
    let fullName = `${lastName.trim()} ${firstName.trim()}`
    if (middleName.trim()) {
      fullName += ` ${middleName.trim()}`
    }
    fullName = capitalizeWords(fullName)
    const displayName = fullName

    console.log('📧 Creating Auth User:', { email, vin_id, fullName, role })

    // ─── 5. Create Supabase Auth User (Retry loop if email collision) ──
    let authUser = null
    let authError = null
    let currentEmailAttempt = email
    let emailCounter = 1

    while (!authUser && emailCounter <= 10) {
      const { data: authData, error: err } = await supabaseAdmin.auth.admin.createUser({
        email: currentEmailAttempt,
        password: vin_id, // Default password is VIN ID
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          display_name: displayName,
          first_name: capitalizeWords(firstName.trim()),
          middle_name: middleName.trim() ? capitalizeWords(middleName.trim()) : '',
          last_name: capitalizeWords(lastName.trim()),
          role,
          vin_id,
          ...(title && { title }),
        },
      })

      if (err) {
        authError = err
        if ((err.message.includes('already registered') || err.message.includes('already exists')) && isAutoEmail) {
          const sanitizedFirst = firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'user'
          const sanitizedLast = lastName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'account'
          currentEmailAttempt = `${sanitizedFirst}.${sanitizedLast}${emailCounter}@vincollins.edu.ng`
          emailCounter++
        } else {
          break
        }
      } else {
        authUser = authData.user
        email = currentEmailAttempt
      }
    }

    if (!authUser) {
      console.error('❌ Supabase Auth creation error:', authError)
      const errorMsg = authError?.message?.includes('already registered')
        ? `A user with email "${email}" already exists.`
        : authError?.message || 'Failed to create user account.'
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 })
    }

    const userId = authUser.id
    console.log('✅ Auth user created successfully ID:', userId)

    // ─── 6. Build Profile Data & Upsert ───────────────────────────────
    const now = new Date().toISOString()
    const profileData: Record<string, any> = {
      id: userId,
      vin_id,
      full_name: fullName,
      display_name: displayName,
      first_name: capitalizeWords(firstName.trim()),
      last_name: capitalizeWords(lastName.trim()),
      email,
      role,
      is_active: true,
      password_changed: false,
      created_at: now,
      updated_at: now,
    }

    if (middleName.trim()) profileData.middle_name = capitalizeWords(middleName.trim())
    if (title.trim()) profileData.title = title.trim()
    if (department.trim()) profileData.department = department.trim()
    if (joinYear && !isNaN(parseInt(joinYear))) profileData.join_year = parseInt(joinYear)
    if (gender && gender.trim()) profileData.gender = gender.trim()
    if (phone && phone.trim()) profileData.phone = phone.trim()
    if (address && address.trim()) profileData.address = address.trim()
    if (dateOfBirth && dateOfBirth.trim()) profileData.date_of_birth = dateOfBirth.trim()

    if (role === 'student' || role === 'pupil') {
      if (studentClass.trim()) profileData.class = studentClass.trim()
      if (admissionYear && !isNaN(parseInt(admissionYear))) profileData.admission_year = parseInt(admissionYear)
      // 👇 Admission number is OPTIONAL — store null if not provided
      profileData.admission_number = admissionNumber || null
      if (guardianName.trim()) profileData.guardian_name = guardianName.trim()
      if (guardianPhone.trim()) profileData.guardian_phone = guardianPhone.trim()
      if (guardianEmail.trim()) profileData.guardian_email = guardianEmail.trim()
    }

    console.log('💾 Upserting Profile Data:', JSON.stringify(profileData, null, 2))

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError)
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log('🔄 Rolled back auth user creation')
      return NextResponse.json(
        { success: false, error: `Database Error: ${profileError.message}` },
        { status: 400 }
      )
    }

    console.log('✅ Profile created/updated successfully ID:', profile?.id)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        full_name: fullName,
        display_name: displayName,
        vin_id,
        role,
      },
      credentials: {
        email,
        password: vin_id,
        vin_id,
      },
    })
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── PUT: Update user ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await req.json()

    const { id, is_active } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // ─── 1. Admission Number — OPTIONAL but must be unique if provided ──
    // Only check if the client explicitly sent the field
    const hasAdmissionNumberField = 'admission_number' in body
    const rawAdmissionNumber = hasAdmissionNumberField
      ? (body.admission_number || '').toString().trim().toUpperCase()
      : undefined

    if (hasAdmissionNumberField && rawAdmissionNumber) {
      const { unique, conflictName } = await checkAdmissionNumberUnique(
        supabaseAdmin,
        rawAdmissionNumber,
        id
      )
      if (!unique) {
        return NextResponse.json(
          { success: false, error: `Admission number "${rawAdmissionNumber}" already exists for ${conflictName}` },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // ─── 2. Apply optional fields only when present in payload ──────────
    // For text fields, allow empty string → store as null (clears the field)
    if ('first_name' in body && body.first_name !== undefined)
      updateData.first_name = capitalizeWords(String(body.first_name).trim())
    if ('last_name' in body && body.last_name !== undefined)
      updateData.last_name = capitalizeWords(String(body.last_name).trim())
    if ('middle_name' in body && body.middle_name !== undefined)
      updateData.middle_name = body.middle_name ? capitalizeWords(String(body.middle_name).trim()) : null
    if ('full_name' in body && body.full_name !== undefined)
      updateData.full_name = body.full_name || null
    if ('class' in body && body.class !== undefined)
      updateData.class = body.class || null
    if ('gender' in body && body.gender !== undefined)
      updateData.gender = body.gender || null
    if ('phone' in body && body.phone !== undefined)
      updateData.phone = body.phone || null
    if ('address' in body && body.address !== undefined)
      updateData.address = body.address || null
    if ('date_of_birth' in body && body.date_of_birth !== undefined)
      updateData.date_of_birth = body.date_of_birth || null
    if ('guardian_name' in body && body.guardian_name !== undefined)
      updateData.guardian_name = body.guardian_name || null
    if ('guardian_phone' in body && body.guardian_phone !== undefined)
      updateData.guardian_phone = body.guardian_phone || null
    if ('guardian_email' in body && body.guardian_email !== undefined)
      updateData.guardian_email = body.guardian_email || null

    // 👇 Admission number — store null if empty/cleared
    if (hasAdmissionNumberField) {
      updateData.admission_number = rawAdmissionNumber || null
    }

    if ('admission_year' in body && body.admission_year !== undefined && body.admission_year !== '')
      updateData.admission_year = parseInt(body.admission_year)
    if (is_active !== undefined)
      updateData.is_active = is_active
    if ('role' in body && body.role)
      updateData.role = body.role
    if ('department' in body && body.department !== undefined)
      updateData.department = body.department || null
    if ('title' in body && body.title !== undefined)
      updateData.title = body.title || null

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Update failed:', profileError)
      return NextResponse.json({ success: false, error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'User updated successfully',
    })
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── DELETE: Delete user ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id)

    if (profileError) {
      console.error('❌ Delete profile failed:', profileError)
      return NextResponse.json({ success: false, error: profileError.message }, { status: 400 })
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error('❌ Delete auth user failed:', authError)
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('❌ API FATAL ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}