import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Hook for the list of chats
export const useChats = (userId) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchChats = useCallback(async () => {
    if (!userId || !supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner(user_id)
        `)
        .eq('chat_members.user_id', userId)

      if (error) throw error
      setChats(data)
    } catch (error) {
      console.error('Error fetching chats:', error.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const createChat = async (name, profile, isGroup = false) => {
    if (!userId || !supabase) return null
    try {
      // Fail-safe: Ensure profile exists
      const { error: profileCheckError } = await supabase
        .from('profiles')
        .upsert([{ 
          id: userId, 
          username: profile?.username || `user_${userId.slice(0, 5)}`,
          status: 'online' 
        }], { onConflict: 'id' })
      
      if (profileCheckError) throw profileCheckError;

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert([{ name, is_group: isGroup, created_by: userId }])
        .select()
        .single()

      if (chatError) throw chatError

      const { error: memberError } = await supabase
        .from('chat_members')
        .insert([{ chat_id: chat.id, user_id: userId }])

      if (memberError) throw memberError

      await fetchChats()
      return chat
    } catch (error) {
      console.error('Error creating chat:', error.message)
      alert('Failed to create chat: ' + error.message)
      return null
    }
  }

  return { chats, loading, createChat, refreshChats: fetchChats }
}

// Hook for a single chat's messages and presence
export const useChatMessages = (chatId, userId, profile) => {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const presenceChannelRef = useRef(null)

  const fetchMessages = useCallback(async () => {
    if (!chatId || !supabase) return
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error.message)
    }
  }, [chatId])

  useEffect(() => {
    if (!chatId || !userId || !supabase) return
    
    setMessages([])
    fetchMessages()

    const channel = supabase
      .channel(`chat_messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
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

    const presenceChannel = supabase.channel(`presence:${chatId}`)
    presenceChannelRef.current = presenceChannel
    
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
      presenceChannelRef.current = null
    }
  }, [chatId, userId, profile?.username, fetchMessages])

  const setTyping = async (isTyping) => {
    if (presenceChannelRef.current) {
      await presenceChannelRef.current.track({
        user_id: userId,
        username: profile?.username,
        is_typing: isTyping
      })
    }
  }

  const sendMessage = async (content, fileUrl = null) => {
    if (!chatId || !userId || !supabase) return
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          user_id: userId,
          content,
          file_url: fileUrl
        }])
      if (error) throw error
    } catch (error) {
      console.error('Error sending message:', error.message)
    }
  }

  return { messages, typingUsers, sendMessage, setTyping }
}
