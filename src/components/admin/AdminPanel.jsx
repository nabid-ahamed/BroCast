import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, User, Shield, Search, Clock } from 'lucide-react';
import Avatar from '../ui/Avatar';

const AdminPanel = ({ currentUserProfile }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime profile changes
    const channel = supabase.channel('admin-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          fetchUsers(); // Refresh the list if any profile changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, approval_status: status } : u));
    } catch (error) {
      alert('Error updating user: ' + error.message);
    }
  };

  const handleUsernameRequest = async (user, approve) => {
    try {
      const updateData = approve 
        ? { username: user.pending_username, pending_username: null } 
        : { pending_username: null };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, ...updateData } : u
      ));
    } catch (error) {
      alert('Error handling username request: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-dark-panel h-full overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white m-0 flex items-center gap-3">
            <Shield className="text-primary" size={28} />
            User Management
          </h2>
          <p className="text-gray-400 mt-1">Approve or reject new member registrations and username changes.</p>
        </div>
        <button 
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors border border-white/10 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 px-4 flex items-center gap-3 text-gray-400 max-w-md mb-8">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search users by name or username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-white w-full focus:outline-none"
          />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4 px-6 text-gray-300 font-semibold text-sm">User</th>
                <th className="p-4 px-6 text-gray-300 font-semibold text-sm">Status</th>
                <th className="p-4 px-6 text-gray-300 font-semibold text-sm">Role</th>
                <th className="p-4 px-6 text-gray-300 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {error ? (
                <tr><td colSpan="4" className="p-10 text-center text-red-400 bg-red-400/10 rounded-lg m-4 block">Database Error: {error}</td></tr>
              ) : loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">No users found.</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.username} size="md" />
                      <div>
                        <div className="font-semibold text-white">{user.username} {user.id === currentUserProfile?.id && <span className="text-primary text-xs ml-2">(You)</span>}</div>
                        <div className="text-xs text-gray-500">{user.full_name || 'No full name'}</div>
                        {user.pending_username && (
                          <div className="text-xs text-yellow-500 mt-1 flex items-center gap-1 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded w-fit">
                            <Clock size={12} />
                            Wants to change to: {user.pending_username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${
                      user.approval_status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      user.approval_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {user.approval_status}
                    </span>
                  </td>
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      {user.is_admin ? <Shield size={14} className="text-primary" /> : <User size={14} />}
                      {user.is_admin ? 'Admin' : 'Member'}
                    </div>
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {user.pending_username && (
                        <div className="flex items-center gap-1 mr-4 bg-white/5 p-1 rounded-lg">
                          <span className="text-xs text-gray-400 mr-1 px-1">Name:</span>
                          <button 
                            onClick={() => handleUsernameRequest(user, true)}
                            className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-all"
                            title="Approve Name Change"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleUsernameRequest(user, false)}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all"
                            title="Reject Name Change"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      
                      {user.id !== currentUserProfile?.id && (
                        <>
                          {user.approval_status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateStatus(user.id, 'approved')}
                              className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                              title="Approve Account"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {user.approval_status !== 'rejected' && (
                            <button 
                              onClick={() => handleUpdateStatus(user.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                              title="Reject Account"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
