import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Innlogget!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke logge inn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Logg inn</h1>
          <p className="text-muted-foreground mb-6">
            Logg inn for å se dine varsler og innstillinger
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Logger inn..." : "Logg inn"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Har du ikke konto?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Registrer deg
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
