import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Konto opprettet! Du er nå logget inn.");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        toast.error(
          "Kunne ikke nå Supabase. Legg til localhost i Supabase: Authentication → URL Configuration → Redirect URLs. Se SUPABASE-ENKEL-GUIDE.md."
        );
      } else {
        toast.error(msg || "Kunne ikke opprette konto");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Registrer deg</h1>
          <p className="text-muted-foreground mb-6">
            Opprett konto for å motta anbudsvarsler
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
                placeholder="Minst 6 tegn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Oppretter..." : "Kom i gang"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Har du allerede konto?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Logg inn
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
