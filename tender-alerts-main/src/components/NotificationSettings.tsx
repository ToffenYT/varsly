import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export const NotificationSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [frequency, setFrequency] = useState<"instant" | "daily_digest">("instant");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setEmailEnabled(profile.email_notifications);
      setFrequency(profile.notification_frequency);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (updates: {
      email_notifications: boolean;
      notification_frequency: "instant" | "daily_digest";
    }) => {
      if (!user?.id) throw new Error("Ikke innlogget");
      const { error } = await supabase
        .from("profiles")
        .update({
          email_notifications: updates.email_notifications,
          notification_frequency: updates.notification_frequency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Innstillingene dine er lagret!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSave = () => {
    saveMutation.mutate({ email_notifications: emailEnabled, notification_frequency: frequency });
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-6 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Varslingsinnstillinger</h3>
          <p className="text-sm text-muted-foreground">Bestem hvordan du vil motta varsler</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laster innstillinger...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-toggle" className="text-foreground font-medium">
                  E-postvarsler
                </Label>
                <p className="text-sm text-muted-foreground">
                  Motta varsler på e-post
                </p>
              </div>
            </div>
            <Switch
              id="email-toggle"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          {emailEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="py-3 border-b border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-foreground font-medium">
                    Varslingsfrekvens
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hvor ofte vil du motta varsler?
                  </p>
                </div>
              </div>

              <RadioGroup
                value={frequency}
                onValueChange={(v) => setFrequency(v as "instant" | "daily_digest")}
                className="ml-8"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="instant" id="instant" className="mt-1" />
                  <div>
                    <Label htmlFor="instant" className="font-medium cursor-pointer">
                      Instant
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Få varsler umiddelbart når nye anbud matcher
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="daily_digest" id="daily" className="mt-1" />
                  <div>
                    <Label htmlFor="daily" className="font-medium cursor-pointer">
                      Daglig oppsummering
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Én e-post per dag med alle treff (kl. 08:00)
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </motion.div>
          )}

          <Button
            onClick={handleSave}
            variant="hero"
            className="w-full"
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4" />
            Lagre innstillinger
          </Button>
        </div>
      )}
    </motion.div>
  );
};
