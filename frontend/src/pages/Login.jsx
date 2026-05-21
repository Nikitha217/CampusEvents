import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back to Eventora!" });
      // Redirect based on role
      const user = JSON.parse(localStorage.getItem("eventora_user") || "{}");
      navigate(`/${user.role}/dashboard`);
    } catch {
      toast({ title: "Invalid credentials", description: "Please check your email and password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src={logo} alt="Eventora" className="h-10 w-10" />
            <span className="font-display font-bold text-xl text-primary">Eventora</span>
          </Link>

          <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Accounts (password: password)</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Student: student@eventora.com</p>
              <p>Coordinator: coordinator@eventora.com</p>
              <p>Admin: admin@eventora.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="text-center max-w-md">
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Manage Events Like Never Before
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Streamline campus event management with powerful tools for every role.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
