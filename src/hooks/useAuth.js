import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      return
    }

    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError('Connection timed out. Please check your Supabase configuration.')
      }
    }, 10000)

    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
          await updateOnlineStatus(session.user.id, 'online')
        }
      } catch (err) {
        console.error('Session error:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
        await updateOnlineStatus(session.user.id, 'online')
      } else {
        if (user) await updateOnlineStatus(user.id, 'offline')
        setProfile(null)
        setLoading(false)
      }
    })

    // Handle browser close/tab close
    const handleBeforeUnload = () => {
      if (user) updateOnlineStatus(user.id, 'offline')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const fetchProfile = async (userId) => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    }
  }

  const updateOnlineStatus = async (userId, status) => {
    if (!supabase) return
    try {
      await supabase
        .from('profiles')
        .update({ status, last_seen: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating status:', error.message)
    }
  }

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, username) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, username, status: 'online' }])
      
      if (profileError) throw profileError
    }
    
    return data
  }

  const signOut = async () => {
    if (!supabase) return
    if (user) await updateOnlineStatus(user.id, 'offline')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }
}
