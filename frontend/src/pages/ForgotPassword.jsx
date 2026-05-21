import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import logo from "../assets/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <img src={logo} alt="Eventora" className="h-10 w-10" />
          <span className="font-display font-bold text-xl text-primary">Eventora</span>
        </Link>

        <h1 className="font-display text-3xl font-bold mb-2">Forgot Password</h1>
        <p className="text-muted-foreground mb-8">
          {sent ? "We've sent a reset link to your email." : "Enter your email to receive a reset link."}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Didn't receive? Check spam or try again.</p>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
