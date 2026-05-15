import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useChat = (roomId, userId, profile) => {
  const [messages, setMessages] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])

  // Fetch all rooms for the user
  const fetchRooms = useCallback(async () => {
    if (!userId || !supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(user_id)
        `)
        .eq('room_members.user_id', userId)

      if (error) throw error
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Fetch messages for a specific room
  const fetchMessages = useCallback(async (currentRoomId) => {
    if (!currentRoomId || !supabase) return
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .eq('room_id', currentRoomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error.message)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  useEffect(() => {
    if (!roomId || !userId || !supabase) return
    
    fetchMessages(roomId)

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const { data, error } = await supabase
            .from('messages')
            .select('*, profiles(username, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          
          if (!error && data) {
            setMessages((prev) => [...prev, data])
          }
        }
      )
      .subscribe()

    // Presence channel for typing indicators
    const presenceChannel = supabase.channel(`presence:${roomId}`)
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const typing = []
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (p.is_typing && p.user_id !== userId) {
              typing.push(p.username)
            }
          })
        })
        setTypingUsers(typing)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId,
            username: profile?.username,
            is_typing: false
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(presenceChannel)
    }
  }, [roomId, userId, profile?.username, fetchMessages])

  const setTyping = async (isTyping) => {
    if (!supabase || !roomId) return
    const presenceChannel = supabase.channel(`presence:${roomId}`)
    await presenceChannel.track({
      user_id: userId,
      username: profile?.username,
      is_typing: isTyping
    })
  }

  const sendMessage = async (content, fileUrl = null) => {
    if (!roomId || !userId || !supabase) return
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          room_id: roomId,
          user_id: userId,
          content,
          file_url: fileUrl
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error sending message:', error.message)
    }
  }

  return {
    rooms,
    messages,
    loading,
    typingUsers,
    sendMessage,
    setTyping,
    refreshRooms: fetchRooms
  }
}
