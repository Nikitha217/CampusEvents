import { useMemo, useState, useEffect } from "react";
import {
  Edit, Trash2, Shield, Search, ChevronLeft, ChevronRight,
  Filter, UserCheck, UserX, X, Save, Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import userService from "../../services/userService";

/**
 * ManageUsers
 *
 * FIX 1: /users/all → /users  (correct backend endpoint)
 * FIX 2: /users/{id}/status?enabled= → /users/{id}/toggle-status
 * FIX 3: /users/{id}/role?role= → /users/{id}/role (PUT with body)
 * FIX 4: /users/profile?email= → /users/me (wrong endpoint for edit)
 * FIX 5: Removed localStorage.getItem("token") — API interceptor handles auth
 * FIX 6: Uses userService instead of inline API calls
 */

const USERS_PER_PAGE = 10;
const ROLES = ["STUDENT", "COORDINATOR", "ADMIN"];

const getRoleName = (user) => {
  if (!user.roles || user.roles.length === 0) return "STUDENT";
  return user.roles[0]?.name?.replace("ROLE_", "") || "STUDENT";
};

const roleBadgeClass = {
  ADMIN:       "bg-red-500/20 text-red-300 border-red-500/30",
  COORDINATOR: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  STUDENT:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const ManageUsers = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // poll every 30s (was 5s — too aggressive)
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setActionLoading(id + "-delete");
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setActionLoading(user.id + "-status");
      const updated = await userService.toggleStatus(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      console.error("Toggle failed", err);
      alert("Failed to toggle user status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId + "-role");
      const updated = await userService.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      console.error("Role change failed", err);
      alert("Failed to update role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      setActionLoading(editingUser.id + "-edit");
      await userService.updateRole(editingUser.id, getRoleName(editingUser));
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error("Edit save failed", err);
      alert("Failed to update user.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "all" || getRoleName(u) === roleFilter.toUpperCase();
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
        <p className="text-slate-400 mt-1">View, edit, and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r.toLowerCase()}>{r}</option>)}
          </select>
        </div>
        <span className="text-sm text-slate-500 ml-auto">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["User", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((u) => {
                const role = getRoleName(u);
                const isActive = u.enabled !== false;
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-white text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeClass[role] || roleBadgeClass.STUDENT}`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${isActive ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                        {isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm" variant="outline"
                          className="h-8 px-2"
                          onClick={() => setEditingUser({ ...u })}
                          title="Edit user"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className={`h-8 px-2 ${isActive ? "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" : "text-green-400 border-green-500/30 hover:bg-green-500/10"}`}
                          disabled={actionLoading === u.id + "-status"}
                          onClick={() => handleToggleStatus(u)}
                          title={isActive ? "Disable user" : "Enable user"}
                        >
                          {isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="sm" variant="destructive"
                          className="h-8 px-2"
                          disabled={actionLoading === u.id + "-delete"}
                          onClick={() => handleDelete(u.id)}
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginated.length === 0 && (
          <div className="text-center py-14 text-slate-500">
            <Users className="h-10 w-10 mx-auto mb-3 text-slate-600" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Name</label>
                <Input value={editingUser.name || ""} readOnly className="bg-white/5 text-slate-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
                <Input value={editingUser.email || ""} readOnly className="bg-white/5 text-slate-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Role</label>
                <select
                  value={getRoleName(editingUser)}
                  onChange={(e) => setEditingUser((prev) => ({
                    ...prev,
                    roles: [{ name: "ROLE_" + e.target.value }],
                  }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50"
                >
                  {ROLES.map((r) => <option key={r} value={r} className="bg-[#1E293B]">{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1" onClick={handleSaveEdit} disabled={actionLoading === editingUser.id + "-edit"}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
