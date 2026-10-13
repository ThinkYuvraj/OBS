import React, { useState, useEffect } from 'react';
import { X, User, Plus, Check, Shield, Zap, Sparkles, Award, Radio } from 'lucide-react';
import { OperatorRole, SportType, UserProfile } from '../../types/sports';
import { fetchUsers, switchActiveUser, createOperatorUser } from '../../services/api';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged?: (user: UserProfile) => void;
}

const ALL_SPORTS: { id: SportType; label: string }[] = [
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'kabaddi', label: 'Kabaddi' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'table_tennis', label: 'Table Tennis' },
  { id: 'volleyball', label: 'Volleyball' },
  { id: 'field_hockey', label: 'Field Hockey' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'rugby', label: 'Rugby' },
];

export const UserRoleModal: React.FC<UserRoleModalProps> = ({ isOpen, onClose, onUserChanged }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<OperatorRole>('scorer');
  const [newTitle, setNewTitle] = useState('Official Match Operator');
  const [newEmail, setNewEmail] = useState('');
  const [newAvatar, setNewAvatar] = useState('⚡');
  const [newAssignedSports, setNewAssignedSports] = useState<SportType[]>(['cricket', 'football']);
  const [newSetup, setNewSetup] = useState('Arena Scoring Deck');

  const loadUsers = () => {
    fetchUsers()
      .then((data) => {
        setUsers(data.users);
        setActiveUser(data.activeUser);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectUser = async (user: UserProfile) => {
    try {
      const res = await switchActiveUser(user.id);
      setActiveUser(res.activeUser);
      if (onUserChanged) onUserChanged(res.activeUser);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await createOperatorUser({
        name: newName,
        role: newRole,
        title: newTitle,
        email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@broadcast.live`,
        avatar: newAvatar,
        assignedSports: newAssignedSports,
        preferredSetup: newSetup,
      });

      setUsers((prev) => [res.user, ...prev]);
      setActiveUser(res.user);
      if (onUserChanged) onUserChanged(res.user);
      setIsCreating(false);
      setNewName('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSport = (sport: SportType) => {
    setNewAssignedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const ROLE_BADGES: Record<OperatorRole, { label: string; color: string; desc: string }> = {
    producer: {
      label: 'Executive Producer',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      desc: 'Master Studio access: billing, RTMP uplinks, match admin',
    },
    scorer: {
      label: 'Lead Scorer / Umpire',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      desc: 'Rapid event entry, ball-by-ball score input, hotkeys',
    },
    graphics: {
      label: 'Broadcast Graphics TD',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'OBS URL positioning, lower thirds, alert triggers',
    },
    viewer: {
      label: 'Production Viewer',
      color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      desc: 'Clean feed viewing, live read-only telemetry',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#0c1424] via-[#090f1f] to-[#060a14] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/90 flex items-center justify-between bg-[#070b14]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400">
                MULTI-USER SETUP &amp; OPERATOR PROFILES
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                Broadcast Console Operators
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isCreating ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Switch the active operator to tailor console shortcuts, sports configurations, and authorization badges:
                </span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Operator</span>
                </button>
              </div>

              {/* Operators List */}
              <div className="space-y-3">
                {users.map((u) => {
                  const isActive = activeUser?.id === u.id;
                  const badge = ROLE_BADGES[u.role] || ROLE_BADGES.scorer;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#11203d] to-[#0a1426] border-cyan-400 shadow-lg shadow-cyan-500/15 ring-2 ring-cyan-500/30'
                          : 'bg-[#0a1120]/70 border-slate-800 hover:border-slate-700 hover:bg-[#0d1629]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#070b14] border border-slate-700 flex items-center justify-center text-2xl shadow">
                          {u.avatar || '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{u.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{u.title}</div>
                          <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                            Setup: {u.preferredSetup} • {u.assignedSports?.length || 0} Sports Assigned
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs font-bold font-mono">
                            <Check className="w-3.5 h-3.5" />
                            <span>ACTIVE ON AIR</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Create New Operator Profile Form */
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Create New Setup Operator</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operator Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operator Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as OperatorRole)}
                    className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="scorer">Lead Match Scorer</option>
                    <option value="producer">Executive Producer</option>
                    <option value="graphics">Broadcast Graphics TD</option>
                    <option value="viewer">Production Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Cricket Scorer"
                    className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Emoji</label>
                  <input
                    type="text"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    placeholder="e.g. 🎧, ⚡, 🎬, 🏆"
                    className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Setup / Console Preset</label>
                <input
                  type="text"
                  value={newSetup}
                  onChange={(e) => setNewSetup(e.target.value)}
                  placeholder="e.g. Studio Desk Alpha"
                  className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Assigned Sports</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SPORTS.map((s) => {
                    const isAssigned = newAssignedSports.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSport(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isAssigned
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-[#0a1120] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save &amp; Activate Operator
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
