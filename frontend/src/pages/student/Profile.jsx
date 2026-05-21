import { useState, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import {
  User,
  Mail,
  Shield,
  Save,
  Camera,
} from "lucide-react";

const Profile = () => {

  const { user } = useAuth();

  // State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [saved, setSaved] = useState(false);

  // Load saved profile from localStorage
  useEffect(() => {

    const savedProfile = localStorage.getItem("profile");

    if (savedProfile) {

      setProfile(JSON.parse(savedProfile));

    } else {

      setProfile({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
      });

    }

  }, [user]);

  // Save Changes
  const handleSave = () => {

    localStorage.setItem(
      "profile",
      JSON.stringify(profile)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-2xl font-bold">
          Profile
        </h1>

        <p className="text-muted-foreground mt-1">
          Manage your account settings
        </p>

      </div>

      {/* Profile Card */}
      <div className="bg-white border rounded-2xl p-6 max-w-3xl shadow-sm">

        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">

          {/* Avatar */}
          <div className="relative">

            <div
              className="
                h-24 w-24 rounded-full
                bg-gradient-to-r from-blue-700 to-teal-500
                flex items-center justify-center
                text-white text-3xl font-bold
                shadow-lg
              "
            >
              {profile.name?.charAt(0)}
            </div>

            <button
              className="
                absolute bottom-0 right-0
                h-8 w-8 rounded-full
                bg-white border
                flex items-center justify-center
                shadow
              "
            >
              <Camera className="h-4 w-4" />
            </button>

          </div>

          {/* User Info */}
          <div>

            <h2 className="text-2xl font-bold">
              {profile.name}
            </h2>

            <p className="text-muted-foreground capitalize">
              {profile.role}
            </p>

          </div>

        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Name */}
          <div className="space-y-2">

            <Label>Full Name</Label>

            <div className="relative">

              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                className="pl-10"
              />

            </div>

          </div>

          {/* Email */}
          <div className="space-y-2">

            <Label>Email</Label>

            <div className="relative">

              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                value={profile.email}
                readOnly
                className="pl-10"
              />

            </div>

          </div>

          {/* Role */}
          <div className="space-y-2">

            <Label>Role</Label>

            <div className="relative">

              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                value={profile.role}
                readOnly
                className="pl-10 capitalize"
              />

            </div>

          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="
              w-full sm:w-auto
              bg-gradient-to-r from-blue-700 to-teal-500
              text-white
            "
          >

            <Save className="h-4 w-4 mr-2" />

            {saved ? "Saved Successfully!" : "Save Changes"}

          </Button>

        </div>

      </div>

    </div>
  );
};

export default Profile;