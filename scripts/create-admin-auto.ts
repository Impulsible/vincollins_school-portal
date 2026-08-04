/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import WebSocket from 'ws'

// Try to load .env.local manually
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').trim()
        if (key && value) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
        }
      }
    }
    return true
  }
  return false
}

// Load environment variables
const envLoaded = loadEnvFile()

// Initialize Supabase admin client with WebSocket
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Checking environment variables...')
console.log(`   .env.local file: ${envLoaded ? '✅ Found' : '❌ Not found'}`)
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Found' : '❌ Missing'}`)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    transport: WebSocket as any,
  },
})

// Generate random 4-digit number
const generateRandomNumber = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

async function createAdmin() {
  console.log('\n🔐 Creating Vincollins Admin...\n')

  try {
    // Admin details
    const adminEmail = 'vincollinsschools@gmail.com'
    const adminName = 'Vincollins Admin'
    
    // Generate 4-digit number
    const randomNum = generateRandomNumber()
    
    // VIN ID: VIN-ADM-XXXX (without year)
    const vinId = `VIN-ADM-${randomNum}`
    
    // Password: Same as VIN ID
    const password = vinId

    console.log('📋 Generated credentials:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Name: ${adminName}`)
    console.log(`   VIN ID: ${vinId}`)
    console.log(`   Password: ${password}`)
    console.log('\n⏳ Creating admin user...\n')

    // Step 1: Check if auth user exists
    let userId: string | null = null
    
    // First, check if user exists in auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (!listError && authUsers) {
      const existingUser = authUsers.users.find(u => u.email === adminEmail)
      if (existingUser) {
        userId = existingUser.id
        console.log('ℹ️  Auth user already exists:', userId)
        
        // If user exists, update their password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: password }
        )
        
        if (updateError) {
          console.error('❌ Failed to update password:', updateError.message)
        } else {
          console.log('✅ Password updated successfully!')
        }
      }
    }

    // If user doesn't exist, create them
    if (!userId) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: adminName,
          display_name: adminName,
          role: 'admin',
          vin_id: vinId,
        },
      })

      if (authError) {
        console.error('❌ Failed to create auth user:', authError.message)
        process.exit(1)
      }

      userId = authData.user.id
      console.log('✅ Auth user created')
    }

    // Step 2: Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (existingProfile) {
      console.log('✅ Profile already exists!')
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎉 ADMIN ALREADY EXISTS!\n')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', password)
      console.log('🆔 VIN ID:', vinId)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n💡 Login at: http://localhost:3000/portal')
      process.exit(0)
    }

    // Step 3: Create profile
    const profileData = {
      id: userId,
      vin_id: vinId,
      full_name: adminName,
      display_name: adminName,
      first_name: adminName.split(' ')[0] || 'Admin',
      last_name: adminName.split(' ').slice(-1)[0] || 'User',
      email: adminEmail,
      role: 'admin',
      is_active: true,
      password_changed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Profile created successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 ADMIN USER CREATED!\n')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', password)
    console.log('🆔 VIN ID:', vinId)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💡 Login at: http://localhost:3000/portal')
    console.log('   Email:', adminEmail)
    console.log('   Password:', password)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
createAdmin()