import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { ArrowLeft, LogOut, Lock, Loader2, User, Shield, Camera, Settings, Info, Mail, Calendar, MapPin, Star, CheckCircle, AlertCircle, Brain } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

type TabId = "profile" | "kundali" | "security" | "preferences";

type DetailItem = {
  label: string;
  value: string;
};

type PlanetInfo = {
  name?: string;
  planet?: string;
  sign?: string;
  rasi?: string;
  nakshatra?: string | {
    name?: string;
    index?: number;
    pada?: number;
    lord?: string;
  };
  dasha?: string;
  mahadasha?: string;
  panchanga?: Record<string, unknown>;
};

type OnboardingDetails = {
  name?: string;
  dob?: string;
  time?: string;
  place?: string;
  birthPlace?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const Profile = () => {
  const { user, logout, loading } = useAuth();
  const { planName, expiresAt } = usePlan();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMemoryEligible = ["quick ask", "deep dive", "power pack"].some((name) => (planName || "").toLowerCase().includes(name));

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("Other");
  const [username, setUsername] = useState("");
  const [usernameLocked, setUsernameLocked] = useState(false);
  const [prefDaily, setPrefDaily] = useState(true);
  const [prefMonthly, setPrefMonthly] = useState(true);
  const [prefMatch, setPrefMatch] = useState(false);
  const [prefShowToday, setPrefShowToday] = useState(true);
  const [prefShowTomorrow, setPrefShowTomorrow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [themeStatus, setThemeStatus] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    // Load from localStorage first, fallback to auth
    try {
      const name = localStorage.getItem("profile_name");
      const photo = localStorage.getItem("profile_photo");
      const savedDob = localStorage.getItem("user_dob");
      const savedTob = null;
      const savedPob = null;
      const savedBio = localStorage.getItem("user_bio");
      const savedGender = localStorage.getItem("user_gender") || 'Other';
      const savedUsername = localStorage.getItem("user_username") || '';
      const savedUsernameLocked = localStorage.getItem("user_username_locked") === 'true';
      const savedDaily = localStorage.getItem("pref_daily") !== 'false';
      const savedMonthly = localStorage.getItem("pref_monthly") !== 'false';
      const savedMatch = localStorage.getItem("pref_match") === 'true';
      const savedShowToday = localStorage.getItem("pref_show_today");
      const savedShowTomorrow = localStorage.getItem("pref_show_tomorrow");
      const savedLastLogin = localStorage.getItem("last_login_info");
      setDisplayName(name || user?.displayName || user?.email?.split("@")[0] || "");
      setPhotoURL(photo || "");
      setDob(savedDob || "");
      
      setBio(savedBio || "");
      setGender(savedGender);
      setUsername(savedUsername);
      setUsernameLocked(savedUsernameLocked);
      setPrefDaily(savedDaily);
      setPrefMonthly(savedMonthly);
      setPrefMatch(savedMatch);
      setPrefShowToday(savedShowToday !== "false");
      setPrefShowTomorrow(savedShowTomorrow !== "false");
      setLastLogin(savedLastLogin);
    } catch {
      setDisplayName(user?.displayName || user?.email?.split("@")[0] || "");
    }
  }, [user]);

  useEffect(() => {
    try {
      const flag = localStorage.getItem("use_logo_theme") === "true";
      if (flag) applyLogoTheme();
    } catch {
      setThemeStatus(null);
    }
  }, []);

  function applyLogoTheme() {
    const root = document.documentElement;
    root.style.setProperty("--primary", "324 70% 33%");
    root.style.setProperty("--secondary", "324 70% 42%");
    root.style.setProperty("--accent", "324 70% 50%");
    root.style.setProperty("--ring", "324 70% 45%");
    localStorage.setItem("use_logo_theme", "true");
    setThemeStatus("Logo theme applied.");
  }

  function resetDefaultTheme() {
    // Forces reload to colors from index.css defaults
    localStorage.setItem("use_logo_theme", "false");
    window.location.reload();
  }

  async function saveProfile() {
    setSaving(true);
    setStatus(null);
    try {
      localStorage.setItem("profile_name", displayName || "");
      localStorage.setItem("user_dob", dob || "");
      
      localStorage.setItem("user_bio", bio || "");
      localStorage.setItem("user_gender", gender || 'Other');
      localStorage.setItem("pref_daily", String(prefDaily));
      localStorage.setItem("pref_monthly", String(prefMonthly));
      localStorage.setItem("pref_match", String(prefMatch));
      localStorage.setItem("pref_show_today", String(prefShowToday));
      localStorage.setItem("pref_show_tomorrow", String(prefShowTomorrow));
      if (!usernameLocked && username) {
        localStorage.setItem("user_username", username);
        localStorage.setItem("user_username_locked", 'true');
        setUsernameLocked(true);
      }
      // Prefer uploaded preview if present, else URL field
      const finalPhoto = uploadPreview || photoURL || "";
      localStorage.setItem("profile_photo", finalPhoto);
      setPhotoURL(finalPhoto);
      setUploadPreview(null);
      setStatus("Profile updated successfully.");
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (error: unknown) {
      setStatus(getErrorMessage(error, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void saveProfile();
  }

  function handleFileSelected(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setUploadPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) {
      setStatus("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    try {
      localStorage.setItem("profile_password", newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setStatus("Password updated.");
    } catch (error: unknown) {
      setStatus(getErrorMessage(error, "Failed to save password."));
    }
  }

  const kundaliData = getKundaliProfile();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          {/* title removed as requested */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-secondary/20 border-2 border-border/60">
                {uploadPreview || photoURL ? (
                  <img 
                    src={uploadPreview || photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg">
                    <Camera className="w-4 h-4" />
                  </div>
                </label>
              </div>
              <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileSelected(e.target.files?.[0] || null)} 
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {displayName || 'Complete Your Profile'}
              </h1>
              <p className="text-muted-foreground mb-4">
                {user?.email || 'veadicastro@user.com'}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30">
                  <Star className="w-4 h-4 text-secondary" />
                  <span className="text-foreground">{computeCompletion()}% Complete</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border font-medium text-sm ${
                  isPaidPlan(planName)
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40 text-yellow-300'
                    : 'bg-card/40 border-border/60 text-muted-foreground'
                }`}>
                  {isPaidPlan(planName) ? (
                    <Shield className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                  <span>{isPaidPlan(planName) ? 'PRO' : 'Free'} - {getCurrentPlan(planName)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="mb-6 border-border/60 bg-card/40 p-5 backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Vedika Memory</h2>
                <p className="text-sm text-muted-foreground">Save a few personal details locally so Vedika can make your chat guidance more relevant.</p>
              </div>
            </div>
            <Button variant={isMemoryEligible ? "cosmic" : "outline"} onClick={() => navigate("/chat", { state: { openMemory: true } })} className="shrink-0 gap-2">
              {!isMemoryEligible && <Lock className="h-4 w-4" />}
              {isMemoryEligible ? "Add / update memory" : "Memory locked"}
            </Button>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 p-1 bg-card/40 rounded-xl border border-border/60">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'kundali', label: 'My Kundali', icon: Calendar },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map(({ id, label, icon: Icon }: { id: TabId; label: string; icon: typeof User }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === id
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Progress Tracker */}
            <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-lg">Profile Completion</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-secondary">{computeCompletion()}%</span>
                  {computeCompletion() === 100 && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 rounded-full bg-background/60 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.06)_75%,transparent_75%,transparent)] bg-[size:12px_12px]"></div>
                  <div className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500" style={{ width: computeCompletion() + '%' }} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {computeCompletion() === 100 
                    ? '🎉 Your profile is complete! You\'re getting the most accurate insights.'
                    : 'Complete your profile to unlock personalized astrological insights and predictions.'
                  }
                </p>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6 bg-card/40 backdrop-blur-md border-border/60 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-lg">Personal Information</h3>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      placeholder="Enter your full name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e)=>setUsername(e.target.value)} 
                      disabled={usernameLocked} 
                      placeholder="Choose a username"
                      className="h-11"
                    />
                    {usernameLocked && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Username can only be edited once for security reasons.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Input 
                    id="bio" 
                    value={bio} 
                    onChange={(e)=> e.target.value.length <= 150 && setBio(e.target.value)} 
                    placeholder="Tell us about yourself (max 150 characters)"
                    className="h-11"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">{bio.length}/150 characters</div>
                    {bio.length >= 140 && (
                      <span className="text-xs text-orange-500">Almost at limit</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Profile Image</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="photo" className="text-xs text-muted-foreground">Image URL</Label>
                      <Input 
                        id="photo" 
                        value={photoURL} 
                        onChange={(e) => setPhotoURL(e.target.value)} 
                        placeholder="https://example.com/image.jpg"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upload" className="text-xs text-muted-foreground">Or upload from device</Label>
                      <Input 
                        id="upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button type="submit" variant="cosmic" disabled={saving} className="gap-2 h-11 px-6">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  {status && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {status.includes('success') ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      {status}
                    </div>
                  )}
                </div>
              </form>
            </Card>
          </div>
        )}

        {activeTab === 'kundali' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card/40 backdrop-blur-md border-border/60 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-lg">My Kundali</h3>
              </div>

              {kundaliData.hasData ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {kundaliData.basics.map((item) => (
                      <div key={item.label} className="p-4 rounded-lg bg-background/50 border border-border/60">
                        <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                        <div className="font-medium">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    {kundaliData.details.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-border/60">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {kundaliData.lucky.map((item) => (
                      <div key={item.label} className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                        <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                        <div className="font-semibold text-secondary">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-background/50 border border-border/60">
                  <p className="text-sm text-muted-foreground">
                    Kundali data is not available yet. Complete onboarding or generate your chart to view Moon sign, nakshatra, dasha, panchanga, and lucky details here.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Settings */}
            <Card className="p-6 bg-card/40 backdrop-blur-md border-border/60 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-lg">Security Settings</h3>
              </div>
              
              <div className="space-y-6">
                {/* Password Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">Change your account password</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>
                  
                  {showPasswordForm && (
                    <form onSubmit={handleSavePassword} className="space-y-4 p-4 bg-card/40 rounded-lg border border-border/60">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="curpass" className="text-sm">Current Password</Label>
                          <Input id="curpass" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newpass" className="text-sm">New Password</Label>
                          <Input id="newpass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmpass" className="text-sm">Confirm Password</Label>
                          <Input id="confirmpass" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-11" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button type="submit" variant="cosmic" className="gap-2">
                          <Lock className="w-4 h-4" />
                          Update Password
                        </Button>
                        <Button type="button" variant="ghost" className="text-xs underline gap-2" disabled={resetLoading} onClick={async ()=>{
                          if (!user?.email) { setStatus("No email found for reset."); return; }
                          setResetLoading(true);
                          try { 
                            const auth = await getAuthInstance();
                            await sendPasswordResetEmail(auth, user.email); 
                            toast({ title: "Reset link sent", description: `Email sent to ${user.email}` }); 
                          } catch(error: unknown){ 
                            setStatus(getErrorMessage(error, "Failed to send reset link")); 
                          } finally {
                            setResetLoading(false);
                          }
                        }}>
                          {resetLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                          Send password reset link
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Account Actions</h4>
                  <div className="space-y-3">
                    <Button variant="destructive" className="gap-2" onClick={async () => { await logout(); navigate("/"); }}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                    <div className="pt-2">
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={()=>{
                        if (!confirm('Delete your account data from this device? This action cannot be undone.')) return;
                        try {
                          localStorage.clear();
                          toast({ title: 'Account deleted on this device' });
                        } finally {
                          logout();
                          navigate('/');
                        }
                      }}>
                        Delete Account Data
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">This will remove all your data from this device only.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Preferences */}
            <Card className="p-6 bg-card/40 backdrop-blur-md border-border/60 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-lg">Preferences</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Notification Preferences</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-card/60 cursor-pointer">
                      <input type="checkbox" checked={prefDaily} onChange={(e)=>setPrefDaily(e.target.checked)} className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">Daily Horoscope</div>
                        <div className="text-xs text-muted-foreground">Get your daily predictions</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-card/60 cursor-pointer">
                      <input type="checkbox" checked={prefMonthly} onChange={(e)=>setPrefMonthly(e.target.checked)} className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">Monthly Insights</div>
                        <div className="text-xs text-muted-foreground">Monthly astrological insights</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-card/60 cursor-pointer">
                      <input type="checkbox" checked={prefMatch} onChange={(e)=>setPrefMatch(e.target.checked)} className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">Astro Match Updates</div>
                        <div className="text-xs text-muted-foreground">Compatibility and match updates</div>
                      </div>
                    </label>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Dashboard Display</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-card/60 cursor-pointer">
                      <input type="checkbox" checked={prefShowToday} onChange={(e) => setPrefShowToday(e.target.checked)} className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">Show "Today" insights</div>
                        <div className="text-xs text-muted-foreground">Display today's predictions</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-card/60 cursor-pointer">
                      <input type="checkbox" checked={prefShowTomorrow} onChange={(e) => setPrefShowTomorrow(e.target.checked)} className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-sm">Show "Tomorrow" insights</div>
                        <div className="text-xs text-muted-foreground">Display tomorrow's predictions</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button variant="cosmic" onClick={() => void saveProfile()} disabled={saving} className="gap-2 h-11 px-6">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : "Save Preferences"}
                  </Button>
                  {status && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {status.includes('success') ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      {status}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        </main>
    </div>
  );
};

export default Profile;

// Helpers
function zodiacFromDob(dob: string): string | null {
  if (!dob) return null;
  try {
    const d = new Date(dob + 'T00:00:00');
    const m = d.getUTCMonth() + 1; // 1-12
    const day = d.getUTCDate();
    // Simple Western zodiac
    const z = [
      ["Capricorn", m===1&&day<=19 || m===12&&day>=22],
      ["Aquarius", m===2&&day<=18 || m===1&&day>=20],
      ["Pisces", m===3&&day<=20 || m===2&&day>=19],
      ["Aries", m===4&&day<=19 || m===3&&day>=21],
      ["Taurus", m===5&&day<=20 || m===4&&day>=20],
      ["Gemini", m===6&&day<=20 || m===5&&day>=21],
      ["Cancer", m===7&&day<=22 || m===6&&day>=21],
      ["Leo", m===8&&day<=22 || m===7&&day>=23],
      ["Virgo", m===9&&day<=22 || m===8&&day>=23],
      ["Libra", m===10&&day<=22 || m===9&&day>=23],
      ["Scorpio", m===11&&day<=21 || m===10&&day>=23],
      ["Sagittarius", m===12&&day<=21 || m===11&&day>=22],
    ] as [string, boolean][];
    const found = z.find(([,ok])=>ok);
    return found ? found[0] : null;
  } catch { return null; }
}

function computeCompletion(): number {
  try {
    const fields = [
      !!localStorage.getItem("profile_name"),
      !!localStorage.getItem("user_username"),
      !!localStorage.getItem("user_dob"),
      !!localStorage.getItem("user_tob"),
      !!localStorage.getItem("user_pob"),
      !!localStorage.getItem("profile_photo"),
      !!localStorage.getItem("user_bio"),
    ];
    const done = fields.filter(Boolean).length;
    return Math.min(100, Math.round((done / fields.length) * 100));
  } catch {
    return 0;
  }
}

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
];

const YONI_TYPES = [
  "Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Goat", "Cat",
  "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer",
  "Dog", "Lion", "Cow", "Monkey", "Lion", "Horse", "Lion", "Elephant", "Horse",
];

const LUCKY_STONES: Record<string, string> = {
  Aries: "Red Coral",
  Taurus: "Diamond",
  Gemini: "Emerald",
  Cancer: "Pearl",
  Leo: "Ruby",
  Virgo: "Emerald",
  Libra: "Diamond",
  Scorpio: "Red Coral",
  Sagittarius: "Yellow Sapphire",
  Capricorn: "Blue Sapphire",
  Aquarius: "Blue Sapphire",
  Pisces: "Yellow Sapphire",
};

const LUCKY_COLORS: Record<string, string> = {
  Aries: "Red, Maroon",
  Taurus: "White, Pink",
  Gemini: "Green, Light Blue",
  Cancer: "White, Cream",
  Leo: "Gold, Orange",
  Virgo: "Green, Light Blue",
  Libra: "White, Pink",
  Scorpio: "Red, Maroon",
  Sagittarius: "Yellow, Orange",
  Capricorn: "Black, Blue",
  Aquarius: "Black, Blue",
  Pisces: "Yellow, Orange",
};

const LUCKY_DAYS: Record<string, string> = {
  Aries: "Tuesday, Sunday",
  Taurus: "Friday, Monday",
  Gemini: "Wednesday, Friday",
  Cancer: "Monday, Thursday",
  Leo: "Sunday, Tuesday",
  Virgo: "Wednesday, Friday",
  Libra: "Friday, Monday",
  Scorpio: "Tuesday, Thursday",
  Sagittarius: "Thursday, Sunday",
  Capricorn: "Saturday, Friday",
  Aquarius: "Saturday, Wednesday",
  Pisces: "Thursday, Monday",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStoredJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function readPlanets(): PlanetInfo[] {
  const stored = readStoredJson("astrology_planets");
  const candidate = Array.isArray(stored)
    ? stored
    : isRecord(stored) && Array.isArray(stored.planets)
      ? stored.planets
      : [];

  return candidate.filter(isRecord).map((planet) => ({
    name: toText(planet.name) || undefined,
    planet: toText(planet.planet) || undefined,
    sign: toText(planet.sign) || undefined,
    rasi: toText(planet.rasi) || undefined,
    nakshatra: isRecord(planet.nakshatra)
      ? {
          name: toText(planet.nakshatra.name) || undefined,
          index: typeof planet.nakshatra.index === "number" ? planet.nakshatra.index : undefined,
          pada: typeof planet.nakshatra.pada === "number" ? planet.nakshatra.pada : undefined,
          lord: toText(planet.nakshatra.lord) || undefined,
        }
      : toText(planet.nakshatra) || undefined,
    dasha: toText(planet.dasha) || undefined,
    mahadasha: toText(planet.mahadasha) || undefined,
    panchanga: isRecord(planet.panchanga) ? planet.panchanga : undefined,
  }));
}

function readOnboardingDetails(): OnboardingDetails | null {
  const stored = readStoredJson("onboarding_details");
  if (!isRecord(stored)) return null;
  return {
    name: toText(stored.name) || undefined,
    dob: toText(stored.dob) || undefined,
    time: toText(stored.time) || undefined,
    place: toText(stored.place) || undefined,
    birthPlace: toText(stored.birthPlace) || undefined,
  };
}

function findPlanet(planets: PlanetInfo[], planetName: string) {
  return planets.find((planet) => (planet.name || planet.planet || "").toLowerCase() === planetName.toLowerCase());
}

function getPlanetSign(planet?: PlanetInfo) {
  return planet?.sign || planet?.rasi || "Not set";
}

function getNakshatraName(planet?: PlanetInfo) {
  if (!planet?.nakshatra) return "Not set";
  return typeof planet.nakshatra === "string" ? planet.nakshatra : planet.nakshatra.name || "Not set";
}

function getNakshatraIndex(planet?: PlanetInfo) {
  return isRecord(planet?.nakshatra) && typeof planet.nakshatra.index === "number"
    ? planet.nakshatra.index
    : null;
}

function getNakshatraLord(planet?: PlanetInfo) {
  if (isRecord(planet?.nakshatra) && planet.nakshatra.lord) return planet.nakshatra.lord;
  const index = getNakshatraIndex(planet);
  return index === null ? "Not set" : NAKSHATRA_LORDS[index] || "Unknown";
}

function getYoni(planet?: PlanetInfo) {
  const index = getNakshatraIndex(planet);
  return index === null ? "Not set" : YONI_TYPES[index] || "Unknown";
}

function getPanchangaSummary(moon?: PlanetInfo) {
  if (!moon?.panchanga) return "Not set";
  const entries = Object.entries(moon.panchanga)
    .map(([key, value]) => {
      const text = toText(value);
      return text ? `${key}: ${text}` : null;
    })
    .filter((entry): entry is string => Boolean(entry));

  return entries.length ? entries.slice(0, 3).join(", ") : "Not set";
}

function getKundaliProfile(): { basics: DetailItem[]; details: DetailItem[]; lucky: DetailItem[]; hasData: boolean } {
  const planets = readPlanets();
  const onboarding = readOnboardingDetails();
  const ascendant = typeof window === "undefined" ? "" : localStorage.getItem("ascendant") || "";
  const moon = findPlanet(planets, "Moon");
  const sun = findPlanet(planets, "Sun");
  const luckySign = getPlanetSign(sun) !== "Not set" ? getPlanetSign(sun) : getPlanetSign(moon);

  const basics = [
    { label: "Birth Date", value: onboarding?.dob || "Not set" },
    { label: "Birth Time", value: onboarding?.time || "Not set" },
    { label: "Birth Place", value: onboarding?.place || onboarding?.birthPlace || "Not set" },
  ];

  const details = [
    { label: "Ascendant", value: ascendant || "Not set" },
    { label: "Moon Sign", value: getPlanetSign(moon) },
    { label: "Sun Sign", value: getPlanetSign(sun) },
    { label: "Nakshatra", value: getNakshatraName(moon) },
    { label: "Nakshatra Lord", value: getNakshatraLord(moon) },
    { label: "Yoni", value: getYoni(moon) },
    { label: "Dasha", value: moon?.dasha || moon?.mahadasha || getNakshatraLord(moon) },
    { label: "Panchanga", value: getPanchangaSummary(moon) },
  ];

  const lucky = [
    { label: "Lucky Day", value: LUCKY_DAYS[luckySign] || "Not set" },
    { label: "Lucky Color", value: LUCKY_COLORS[luckySign] || "Not set" },
    { label: "Lucky Gem", value: LUCKY_STONES[luckySign] || "Not set" },
  ];

  return {
    basics,
    details,
    lucky,
    hasData: planets.length > 0 || Boolean(ascendant || onboarding?.dob || onboarding?.time || onboarding?.place),
  };
}

function getCurrentPlan(currentPlanName?: string): string {
  if (!currentPlanName || currentPlanName === 'Free') return 'Free Plan';
  return currentPlanName.endsWith('Plan') ? currentPlanName : currentPlanName;
}

function isPaidPlan(planName?: string): boolean {
  return Boolean(planName && planName !== 'Free');
}
