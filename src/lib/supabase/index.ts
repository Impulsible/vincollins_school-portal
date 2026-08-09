// src/lib/supabase/index.ts
// ✅ Re-export from client.ts to maintain single instance
export * from './client'

// ✅ Remove the default export since client.ts doesn't have one
// export { default } from './client'  // ❌ Remove this line

// ✅ Optionally, you can create a default export
import { supabase } from './client'
export default supabase