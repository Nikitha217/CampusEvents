import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import { User, Mail, Shield, GraduationCap, Save, Phone, Building, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

/**
 * Profile page
 *
 * FIX 1: Was calling GET /users/profile (wrong) → now GET /users/me
 * FIX 2: Was calling PUT /users/profile (wrong) → now PUT /users/me
 * FIX 3: Added password-change section (was completely missing)
 * FIX 4: Uses userService instead of raw API calls
 */
const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile]   = useState({ name: "", email: "", department: "", phone: "", college: "" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getMe();
      setProfile({
        name:       data.name       || "",
        email:      data.email      || "",
        department: data.department || "",
        phone:      data.phone      || "",
        college:    data.college    || "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const handleChange = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateMe({
        name:       profile.name,
        department: profile.department,
        phone:      profile.phone,
        college:    profile.college,
      });
      updateUser({ name: profile.name });
      toast({ title: "Profile updated successfully ✓" });
    } catch (err) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required.", variant: "destructive" });
      return;
    }
    try {
      setSavingPw(true);
      await userService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast({ title: "Password changed successfully ✓" });
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response.data : "Failed to change password";
      toast({ title: "Change Failed", description: msg, variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const fields = [
    { label: "Full Name",  field: "name",       icon: User,         readOnly: false, placeholder: "Enter full name" },
    { label: "Email",      field: "email",       icon: Mail,         readOnly: true,  placeholder: "" },
    { label: "Department", field: "department",  icon: GraduationCap, readOnly: false, placeholder: "CSE / IT / ECE" },
    { label: "Phone",      field: "phone",       icon: Phone,        readOnly: false, placeholder: "+91 9999999999" },
    { label: "College",    field: "college",     icon: Building,     readOnly: false, placeholder: "College name" },
    { label: "Role",       field: "_role",       icon: Shield,       readOnly: true,  placeholder: "" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your personal information</p>
      </div>

      {/* Profile card */}
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-purple-500/10 p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-10">
          <div className="relative flex-shrink-0">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-purple-500/30">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-[#0F172A]" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white">{profile.name || "User"}</h2>
            <p className="text-purple-400 capitalize mt-1 font-medium">{user?.role}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
              <Shield className="h-3 w-3" /> Verified Account
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mb-8" />

        <div className="grid md:grid-cols-2 gap-6">
          {fields.map(({ label, field, icon: Icon, readOnly, placeholder }) => {
            const value = field === "_role" ? user?.role : profile[field] || "";
            return (
              <div key={field} className="space-y-2">
                <label className="text-sm font-medium text-slate-300">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input
                    value={value}
                    readOnly={readOnly}
                    onChange={(e) => !readOnly && handleChange(field, e.target.value)}
                    placeholder={placeholder}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm border transition-all focus:outline-none capitalize
                      ${readOnly
                        ? "bg-white/3 border-white/5 text-slate-500 cursor-not-allowed"
                        : "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:bg-white/10"
                      }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-8 rounded-2xl py-3.5 text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            : <><Save className="h-4 w-4" /> Save Changes</>
          }
        </button>
      </div>

      {/* Password change card */}
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-purple-500/10 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Lock className="h-4 w-4 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full rounded-xl pl-10 pr-11 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                placeholder="Current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
              <input
                type={showNew ? "text" : "password"}
                required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full rounded-xl pl-10 pr-11 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={savingPw}
              className="rounded-2xl px-8 py-3 text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {savingPw
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : <><Lock className="h-4 w-4" /> Change Password</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
