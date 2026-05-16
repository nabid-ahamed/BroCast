import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useConnections = (userId) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetchConnections();

    let subscription;
    try {
      subscription = supabase
        .channel('connections_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'connections' },
          (payload) => {
            // If the change involves this user, refetch
            if (
              payload.new?.requester_id === userId ||
              payload.new?.receiver_id === userId ||
              payload.old?.requester_id === userId ||
              payload.old?.receiver_id === userId
            ) {
              fetchConnections();
            }
          }
        )
        .subscribe((status, err) => {
          if (err) console.warn('Realtime subscription error:', err);
        });
    } catch (e) {
      console.warn("Could not subscribe to realtime connections:", e);
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      // Fetch connections where the user is either requester or receiver
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          requester_id,
          receiver_id,
          created_at,
          requester:profiles!connections_requester_id_fkey(id, username, full_name, avatar_url, status),
          receiver:profiles!connections_receiver_id_fkey(id, username, full_name, avatar_url, status)
        `)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) throw error;
      setConnections(data || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequestByUsername = async (username) => {
    try {
      // First, find the user ID
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (userError) throw userError;
      if (!users || users.length === 0) throw new Error('User not found');
      
      const targetUserId = users[0].id;
      if (targetUserId === userId) throw new Error('Cannot send request to yourself');

      return await sendRequestById(targetUserId);
    } catch (err) {
      return { error: err.message };
    }
  };

  const sendRequestByInviteToken = async (token) => {
    try {
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('invite_token', token);

      if (userError) throw userError;
      if (!users || users.length === 0) throw new Error('Invalid invite token');
      
      const targetUserId = users[0].id;
      if (targetUserId === userId) throw new Error('Cannot connect with yourself');

      return await sendRequestById(targetUserId);
    } catch (err) {
      return { error: err.message };
    }
  };

  const sendRequestById = async (targetUserId) => {
    try {
      // Check if connection already exists
      const existing = connections.find(c => 
        (c.requester_id === targetUserId && c.receiver_id === userId) ||
        (c.requester_id === userId && c.receiver_id === targetUserId)
      );

      if (existing) {
        if (existing.status === 'pending') throw new Error('Connection request already pending');
        if (existing.status === 'accepted') throw new Error('Already connected');
        // if rejected, maybe we allow re-request? For now, no.
        throw new Error('Connection request previously rejected');
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          receiver_id: targetUserId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (err) {
      return { error: err.message };
    }
  };

  const acceptRequest = async (connectionId) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .eq('receiver_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const rejectRequest = async (connectionId) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId)
        .eq('receiver_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const removeConnection = async (connectionId) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Helper to get actual friend profiles
  const acceptedFriends = connections
    .filter(c => c.status === 'accepted')
    .map(c => {
      const friend = c.requester_id === userId ? c.receiver : c.requester;
      return { ...friend, connection_id: c.id };
    });

  const pendingIncoming = connections.filter(c => c.status === 'pending' && c.receiver_id === userId);
  const pendingOutgoing = connections.filter(c => c.status === 'pending' && c.requester_id === userId);

  return {
    connections,
    acceptedFriends,
    pendingIncoming,
    pendingOutgoing,
    loading,
    sendRequestByUsername,
    sendRequestByInviteToken,
    sendRequestById,
    acceptRequest,
    rejectRequest,
    removeConnection
  };
};
