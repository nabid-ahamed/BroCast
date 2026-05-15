import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, User, Shield, Search } from 'lucide-react';
import Avatar from '../ui/Avatar';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-dark-panel h-full overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-2xl font-bold text-white m-0 flex items-center gap-3">
          <Shield className="text-primary" size={28} />
          User Management
        </h2>
        <p className="text-gray-400 mt-1">Approve or reject new member registrations.</p>
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
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">No users found.</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.username} size="md" />
                      <div>
                        <div className="font-semibold text-white">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.full_name || 'No full name'}</div>
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
                    <div className="flex justify-end gap-2">
                      {user.approval_status !== 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.id, 'approved')}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {user.approval_status !== 'rejected' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.id, 'rejected')}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
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
