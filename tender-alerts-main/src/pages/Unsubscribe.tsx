import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("unsubscribe", {
          body: { token },
        });
        if (error) throw error;
        if (data?.ok) {
          setStatus("success");
          toast.success("Du er nå meldt av varsling.");
        } else {
          setStatus("error");
          toast.error("Kunne ikke melde av. Prøv igjen eller kontakt oss.");
        }
      } catch {
        setStatus("error");
        toast.error("Kunne ikke melde av. Prøv igjen eller kontakt oss.");
      }
    };
    run();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md text-center">
          {status === "loading" && (
            <p className="text-muted-foreground">Meld av varsling...</p>
          )}
          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">Meldt av</h1>
              <p className="text-muted-foreground mb-6">
                Du mottar ikke lenger e-postvarsler. Du kan når som helst slå dem på igjen under Innstillinger.
              </p>
              <Link to="/settings">
                <Button variant="hero">Gå til Innstillinger</Button>
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">Noe gikk galt</h1>
              <p className="text-muted-foreground mb-6">
                Vi kunne ikke melde deg av. Sjekk at lenken er korrekt, eller logg inn og endre innstillinger.
              </p>
              <Link to="/login">
                <Button variant="hero">Logg inn</Button>
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
