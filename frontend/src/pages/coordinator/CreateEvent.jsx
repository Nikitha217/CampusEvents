import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  CheckCircle2,
  Sparkles,
  X,
  ChevronDown,
  Upload,
  Zap,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getCategories } from "../../services/categoryService";

/* =========================
   STATIC SUB-COMPONENTS
========================== */

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-purple-400/70">
      {children}
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
  </div>
);

const FieldWrap = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-slate-300 tracking-wide">{label}</label>
    {children}
  </div>
);

/* =========================
   STYLE CONSTANTS
========================== */

const inputClass =
  "w-full rounded-xl pl-11 pr-4 py-3.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300";

const selectClass =
  "w-full rounded-xl pl-4 pr-10 py-3.5 text-sm appearance-none bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 cursor-pointer";

/* =========================
   MAIN COMPONENT
========================== */

const CreateEvent = () => {
  const { user } = useAuth();
  
  // UI States
  const [successModal, setSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // Data States
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    department: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    participants: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        // Ensure data is array to prevent errors
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        // Suppress console logs in production for cleaner output
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => c.name === formData.category);
      if (!selectedCategory) {
        alert("Please select a valid event category.");
        setIsSubmitting(false);
        return;
      }
      if (!formData.department) {
        alert("Please select a department.");
        setIsSubmitting(false);
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        category: selectedCategory.name,
        categoryId: selectedCategory.id,
        department: formData.department,
        location: formData.location,
        image: previewImage,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        maxParticipants: Number(formData.participants) || 100,
        coordinatorId: user?.id?.toString(),
        coordinatorName: user?.name,
        coordinatorEmail: user?.email,
      };

      await API.post("/events", eventData);
      
      setSuccessModal(true);
      
      // Reset form
      setFormData({
        title: "", category: "", department: "", startDate: "", endDate: "",
        startTime: "", endTime: "", location: "", participants: "",
        duration: "", description: "",
      });
      setPreviewImage("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit event for review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreviewImage(response.data.url);
    } catch (error) {
      alert("Failed to upload event banner. Please try again.");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageUpload(file);
  };

  // Helper for displaying absolute URLs for uploaded images
  const getImageUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
    return url.startsWith("/") ? `${API_BASE}${url}` : url;
  };

  // Format date for preview
  const formatPreviewDate = () => {
    if (!formData.startDate) return "Date pending";
    const date = new Date(formData.startDate);
    return isNaN(date) ? "Invalid date" : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <>
      <div className="pb-12">
        {/* HEADER */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Event</h1>
          </div>
          <p className="text-slate-400 text-sm pl-14 max-w-2xl">
            Provide the details below to schedule your upcoming campus event. 
            Your submission will be reviewed by the administration team before publishing.
          </p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN - FORM */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* BASIC INFO SECTION */}
              <div className="bg-[#0F172A]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-purple-500/5">
                <SectionLabel>Basic Information</SectionLabel>
                <div className="grid md:grid-cols-2 gap-6">

                  <div className="md:col-span-2">
                    <FieldWrap label="Event Title">
                      <div className="relative group">
                        <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                        <input
                          className={inputClass}
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="e.g. Annual Tech Summit 2025"
                          required
                          autoComplete="off"
                        />
                      </div>
                    </FieldWrap>
                  </div>

                  <FieldWrap label="Category">
                    <div className="relative group">
                      <select
                        className={`${selectClass} ${categoriesLoading ? 'opacity-50' : ''}`}
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        disabled={categoriesLoading}
                      >
                        <option value="" disabled className="bg-[#0F172A] text-slate-500">
                          {categoriesLoading ? "Loading categories..." : "Select Event Category"}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name} className="bg-[#0F172A] text-white">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {categoriesLoading ? (
                        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 animate-spin" />
                      ) : (
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      )}
                    </div>
                  </FieldWrap>

                  <FieldWrap label="Department">
                    <div className="relative group">
                      <select
                        className={selectClass}
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled className="bg-[#0F172A] text-slate-500">Select department</option>
                        {["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AI&DS", "MBA"].map((dept) => (
                          <option key={dept} value={dept} className="bg-[#0F172A] text-white">
                            {dept}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    </div>
                  </FieldWrap>

                </div>
              </div>

              {/* DATE, TIME & DETAILS SECTION */}
              <div className="bg-[#0F172A]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-purple-500/5">
                <SectionLabel>Scheduling & Logistics</SectionLabel>
                <div className="grid md:grid-cols-2 gap-6">

                  <FieldWrap label="Start Date">
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <input type="date" className={inputClass} name="startDate" value={formData.startDate} onChange={handleChange} required />
                    </div>
                  </FieldWrap>

                  <FieldWrap label="End Date">
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <input type="date" className={inputClass} name="endDate" value={formData.endDate} onChange={handleChange} required />
                    </div>
                  </FieldWrap>

                  <FieldWrap label="Start Time">
                    <div className="relative group">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <input type="time" className={inputClass} name="startTime" value={formData.startTime} onChange={handleChange} required />
                    </div>
                  </FieldWrap>

                  <FieldWrap label="End Time">
                    <div className="relative group">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <input type="time" className={inputClass} name="endTime" value={formData.endTime} onChange={handleChange} required />
                    </div>
                  </FieldWrap>
                  
                  <FieldWrap label="Venue / Address">
                    <div className="relative group">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <input className={inputClass} name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Main Auditorium" required autoComplete="off" />
                    </div>
                  </FieldWrap>
                  
                  <FieldWrap label="Max Participants">
                    <div className="relative group">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <input type="number" className={inputClass} name="participants" value={formData.participants} onChange={handleChange} placeholder="e.g. 150" required min="1" />
                    </div>
                  </FieldWrap>

                </div>
              </div>

              {/* DESCRIPTION & MEDIA */}
              <div className="bg-[#0F172A]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-purple-500/5">
                <SectionLabel>Description & Media</SectionLabel>
                <div className="space-y-6">
                  <FieldWrap label="About This Event">
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-4 h-4 w-4 text-purple-400/50 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                      <textarea
                        className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 resize-vertical min-h-[120px] leading-relaxed"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your event — agenda, highlights, what attendees can expect..."
                        rows={4}
                        required
                      />
                    </div>
                  </FieldWrap>

                  <FieldWrap label="Event Banner (Optional)">
                    {!previewImage ? (
                      <label
                        className={`flex flex-col items-center justify-center gap-3 min-h-[160px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
                          ${dragOver
                            ? "border-purple-500/80 bg-purple-500/10 scale-[1.01]"
                            : "border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-purple-500/5"
                          }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${dragOver ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-slate-400"}`}>
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-300">
                            <span className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">Click to upload</span> or drag & drop
                          </p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
                      </label>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                        <img
                          src={getImageUrl(previewImage)}
                          alt="Banner preview"
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setPreviewImage("")}
                          className="absolute top-3 right-3 bg-black/50 hover:bg-red-500/80 backdrop-blur-md p-2 rounded-full text-white transition-all duration-200 shadow-lg"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs text-white/90 font-medium bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-md">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Banner Uploaded
                        </div>
                      </div>
                    )}
                  </FieldWrap>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 items-center justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: "", category: "", department: "", startDate: "", endDate: "",
                      startTime: "", endTime: "", location: "", participants: "",
                      duration: "", description: "",
                    });
                    setPreviewImage("");
                  }}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-purple-600 disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Publish Event</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - LIVE PREVIEW */}
          <div className="lg:col-span-1 hidden lg:block sticky top-8">
            <div className="bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl">
              <SectionLabel>Live Preview</SectionLabel>
              <div className="bg-[#1E293B]/50 rounded-2xl overflow-hidden border border-white/5 flex flex-col group transition-all duration-300">
                
                {/* Preview Image */}
                <div className="relative h-40 bg-slate-800 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img 
                      src={getImageUrl(previewImage)} 
                      alt="Event" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs font-medium uppercase tracking-wider">Event Banner</span>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {formData.department && (
                      <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {formData.department}
                      </span>
                    )}
                    {formData.category && (
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {formData.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview Details */}
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                      {formData.title || "Your Event Title Here"}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed min-h-[60px]">
                      {formData.description || "Add an event description to give participants an idea of what to expect."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Calendar className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <span className="truncate">{formatPreviewDate()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <span className="truncate">{formData.location || "Venue pending"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Users className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <span className="truncate">{formData.participants ? `${formData.participants} spots max` : "Capacity pending"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> This is how students will see your event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVAL MODAL */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.15)] w-full max-w-md p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-purple-500/20 blur-[60px] pointer-events-none" />

            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-400 animate-in spin-in-12 duration-500" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Clock className="h-3 w-3" />
              Pending Admin Approval
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
              Event Submitted Successfully
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Your event has been submitted for review and approval. Once approved by an administrator, it will become visible to students and open for registrations.
            </p>

            <button
              onClick={() => setSuccessModal(false)}
              className="w-full rounded-xl py-3.5 text-white font-bold bg-white/10 hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all duration-300 active:scale-[0.98]"
            >
              Close & View Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEvent;