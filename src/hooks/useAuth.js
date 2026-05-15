import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      return
    }

    const timeout = setTimeout(() => {
      if (loading || !profileLoaded) {
        setLoading(false)
        setProfileLoaded(true)
        setError('Connection timed out. This usually happens if your Supabase URL or Anon Key is incorrect, or if your internet is slow.')
      }
    }, 10000)

    // Basic check for Supabase key format
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (anonKey && !anonKey.startsWith('eyJ')) {
       console.warn('The VITE_SUPABASE_ANON_KEY doesn\'t look like a standard Supabase key (should start with "eyJ"). Check your .env file.')
    }

    let hasInitialized = false;

    const initialize = async (session) => {
      if (hasInitialized) return;
      hasInitialized = true;
      
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          // Fire and forget, don't block UI
          updateOnlineStatus(session.user.id, 'online');
        } else {
          setProfileLoaded(true);
        }
      } catch (err) {
        console.error('Init error:', err.message);
        setProfileLoaded(true);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    // First try to get session manually
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error during mount:", error.message);
        setLoading(false);
        setProfileLoaded(true);
        clearTimeout(timeout);
        // Do not block the app, let them log in again
      } else {
        initialize(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // If initialize() already ran, this won't double-fetch
        if (!hasInitialized) {
          await initialize(session);
        } else if (event === 'SIGNED_IN' && user?.id !== session?.user?.id) {
           // Handle case where user switched accounts without reloading
           setUser(session?.user ?? null);
           if (session?.user) {
             await fetchProfile(session.user.id);
             updateOnlineStatus(session.user.id, 'online');
           }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setProfileLoaded(true);
        setLoading(false);
      }
    });

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
    if (!supabase) {
      setProfileLoaded(true)
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          console.log('Profile not found, creating one...')
          const { data: userData } = await supabase.auth.getUser()
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: userId, 
              username: userData?.user?.user_metadata?.username || `user_${userId.slice(0, 5)}`,
              status: 'online' 
            }])
            .select()
            .single()
          
          if (!createError) setProfile(newProfile)
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setProfileLoaded(true)
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
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username,
        }
      }
    })
    if (error) throw error
    
    return data
  }

  const signOut = async () => {
    if (!supabase) return
    if (user) await updateOnlineStatus(user.id, 'offline')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
    setProfileLoaded(false)
  }

  return {
    user,
    profile,
    loading,
    profileLoaded,
    error,
    signIn,
    signUp,
    signOut
  }
}
