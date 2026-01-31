import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotificationSettings } from "@/components/NotificationSettings";
import { KeywordManager } from "@/components/KeywordManager";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Innstillinger
              </h1>
            </div>
            <p className="text-muted-foreground">
              Administrer dine søkeord og varslingsinnstillinger
            </p>
          </motion.div>

          {/* Settings grid */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
            <NotificationSettings />
            <KeywordManager />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
