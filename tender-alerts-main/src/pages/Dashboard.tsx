import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TenderCard } from "@/components/TenderCard";
import { motion } from "framer-motion";
import { Bell, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { startOfDay } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ["user_keywords", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_keywords")
        .select("id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const todayStart = startOfDay(new Date()).toISOString();
  const newToday = alerts.filter((a) => a.created_at >= todayStart).length;
  const total = alerts.length;
  const keywordCount = keywords.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Mine varsler
                </h1>
                <p className="text-muted-foreground">
                  {isLoading
                    ? "Laster..."
                    : `${total} anbud funnet basert på dine søkeord`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4" />
                  Oppdater
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground">Totalt</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{newToday}</p>
                  <p className="text-xs text-muted-foreground">Nye i dag</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{keywordCount}</p>
                  <p className="text-xs text-muted-foreground">Søkeord</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground">Frister snart</p>
                </div>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <p className="text-muted-foreground">Laster varsler...</p>
          ) : alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              Ingen varsler ennå. Legg til søkeord under Innstillinger, så får du varsler når nye anbud matcher.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert, index) => {
                const isNewToday = alert.created_at >= todayStart;
                return (
                  <TenderCard
                    key={alert.id}
                    title={alert.tender_title}
                    organization={alert.tender_organization}
                    location={alert.tender_location}
                    deadline={alert.tender_deadline}
                    matchedKeyword={alert.matched_keyword}
                    category={alert.tender_category}
                    tenderUrl={alert.tender_url}
                    isNew={isNewToday}
                    delay={0.2 + index * 0.05}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
