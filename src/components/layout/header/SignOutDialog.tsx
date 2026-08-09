// src/components/layout/header/SignOutDialog.tsx
'use client'

import { memo } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface SignOutDialogProps {
  open: boolean
  onClose: () => void
  onLogout?: () => Promise<void> | void
  isLoggingOut?: boolean
}

export const SignOutDialog = memo(function SignOutDialog({ 
  open, 
  onClose, 
  onLogout, 
  isLoggingOut = false 
}: SignOutDialogProps) {
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoggingOut) return
    
    if (onLogout) {
      await onLogout()
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoggingOut) return
    onClose()
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-red-600" />
            </div>
            Sign Out?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            className="rounded-xl text-sm" 
            disabled={isLoggingOut}
            onClick={handleCancel}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSignOut} 
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})