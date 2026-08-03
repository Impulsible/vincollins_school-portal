/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useLoginRateLimit.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

interface RateLimitState {
  attempts: number
  lockedUntil: number | null
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5 minutes

export function useLoginRateLimit() {
  const [state, setState] = useState<RateLimitState>(() => {
    if (typeof window === 'undefined') {
      return { attempts: 0, lockedUntil: null }
    }
    try {
      const stored = localStorage.getItem('login_attempts')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return { attempts: 0, lockedUntil: null }
  })

  const [isLocked, setIsLocked] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  // Check lock status
  useEffect(() => {
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      setIsLocked(true)
      const remaining = Math.floor((state.lockedUntil - Date.now()) / 1000)
      setRemainingSeconds(remaining)
    } else if (state.lockedUntil && state.lockedUntil <= Date.now()) {
      // Lock expired, reset
      const newState = { attempts: 0, lockedUntil: null }
      setState(newState)
      localStorage.setItem('login_attempts', JSON.stringify(newState))
      setIsLocked(false)
      setRemainingSeconds(0)
    }
  }, [state.lockedUntil])

  // Countdown timer
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setIsLocked(false)
          const newState = { attempts: 0, lockedUntil: null }
          setState(newState)
          localStorage.setItem('login_attempts', JSON.stringify(newState))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocked, remainingSeconds])

  const checkAndRecord = useCallback((success: boolean) => {
    if (success) {
      // Reset on successful login
      const newState = { attempts: 0, lockedUntil: null }
      setState(newState)
      localStorage.setItem('login_attempts', JSON.stringify(newState))
      setIsLocked(false)
      setRemainingSeconds(0)
      return { allowed: true, message: null }
    }

    // Failed attempt
    const newAttempts = state.attempts + 1

    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock the account
      const lockedUntil = Date.now() + LOCKOUT_DURATION
      const newState = { attempts: newAttempts, lockedUntil }
      setState(newState)
      localStorage.setItem('login_attempts', JSON.stringify(newState))
      setIsLocked(true)
      setRemainingSeconds(Math.floor(LOCKOUT_DURATION / 1000))
      return {
        allowed: false,
        message: `Too many failed attempts. Please wait ${Math.ceil(LOCKOUT_DURATION / 60000)} minutes.`
      }
    }

    // Update attempts
    const newState = { ...state, attempts: newAttempts }
    setState(newState)
    localStorage.setItem('login_attempts', JSON.stringify(newState))

    const remainingAttempts = MAX_ATTEMPTS - newAttempts
    return {
      allowed: true,
      message: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
    }
  }, [state])

  return {
    isLocked,
    remainingSeconds,
    checkAndRecord,
    attempts: state.attempts,
    maxAttempts: MAX_ATTEMPTS,
  }
}