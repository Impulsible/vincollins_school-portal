/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

// Generate random 4-digit number
const generateRandomNumber = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Generate VIN ID for admin
const generateVINId = (): string => {
  const year = new Date().getFullYear()
  const randomNum = generateRandomNumber()
  return `VIN-ADM-${year}-${randomNum}`
}

// Capitalize words
const capitalizeWords = (str: string): string => {
  if (!str) return ''
  return str
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

// Main function
async function createAdmin() {
  console.log('\n🔐 Vincollins Schools - Admin Setup\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Get admin details from user
    const email = await question('📧 Admin Email (default: vincollinsschools@gmail.com): ')
    const adminEmail = email.trim() || 'vincollinsschools@gmail.com'

    const fullName = await question('👤 Full Name (default: Vincollins Admin): ')
    const adminName = fullName.trim() || 'Vincollins Admin'

    // Generate VIN ID
    const vinId = generateVINId()
    console.log(`\n📋 Generated VIN ID: ${vinId}`)

    // Generate password (VIN-ADM-XXXX)
    const randomNum = generateRandomNumber()
    const password = `VIN-ADM-${randomNum}`
    console.log(`🔑 Generated Password: ${password}`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  Please confirm the details above:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Name: ${adminName}`)
    console.log(`   VIN ID: ${vinId}`)
    console.log(`   Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const confirm = await question('✅ Create admin user? (y/N): ')
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Admin creation cancelled.')
      rl.close()
      return
    }

    console.log('\n⏳ Creating admin user...\n')

    // Step 1: Create auth user
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
      rl.close()
      return
    }

    const userId = authData.user.id
    console.log('✅ Auth user created:', userId)

    // Step 2: Create profile
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message)
      // Rollback: Delete the auth user
      await supabase.auth.admin.deleteUser(userId)
      console.log('🔄 Rolled back auth user')
      rl.close()
      return
    }

    console.log('✅ Profile created successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!\n')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', password)
    console.log('🆔 VIN ID:', vinId)
    console.log('👤 Name:', adminName)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💡 You can now login at: http://localhost:3000/portal')
    console.log('   Use the email and password above.\n')
    console.log('💡 After login, you can create students and staff from the admin UI.\n')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    rl.close()
  }
}

// Run the script
createAdmin()