import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Zap, Shield } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Automatiske varsler fra Doffin</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Aldri gå glipp av et{" "}
            <span className="text-gradient">offentlig anbud</span>{" "}
            igjen
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Få instant varsler når nye anbud som matcher dine søkeord publiseres på Doffin. 
            Spar tid, vinn flere kontrakter.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="hero" size="xl">
              Start gratis prøveperiode
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl">
              Se hvordan det fungerer
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Instant e-postvarsler</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>GDPR-kompatibel</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span>Oppdateres hver time</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
