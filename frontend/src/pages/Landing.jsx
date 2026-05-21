import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, Users, Award, ArrowRight, Sparkles, Shield, BarChart3 } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";

const features = [
  { icon: Calendar, title: "Easy Event Discovery", description: "Browse and register for campus events in seconds." },
  { icon: Users, title: "Role-Based Access", description: "Tailored dashboards for students, coordinators, and admins." },
  { icon: Award, title: "Digital Certificates", description: "Auto-generated certificates for event participation." },
  { icon: Shield, title: "Event Approvals", description: "Streamlined approval workflows for event coordinators." },
  { icon: BarChart3, title: "Analytics & Reports", description: "Insightful data to track engagement and performance." },
  { icon: Sparkles, title: "Real-time Notifications", description: "Stay updated with instant event alerts and reminders." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCampus} alt="Campus events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative container py-24 md:py-36 lg:py-44">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Campus Event Management
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Manage Campus Events
              <br />
              <span className="text-accent">Effortlessly</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
              Discover, register, and manage campus events all in one place. Built for students, coordinators, and administrators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="gradient-accent text-accent-foreground font-semibold text-base px-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Events", value: "120+" },
            { label: "Students", value: "5,000+" },
            { label: "Departments", value: "25" },
            { label: "Certificates", value: "10K+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-5 shadow-card text-center border border-border">
              <p className="font-display font-bold text-2xl text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Campus Events
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive platform designed to simplify event management for your entire campus.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Campus Events?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students and coordinators already using Eventora.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="gradient-accent text-accent-foreground font-semibold text-base px-10 shadow-lg"
          >
            Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
