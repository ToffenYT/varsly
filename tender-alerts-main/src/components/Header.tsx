import { Bell, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">AnbudsVarsler</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Hjem
            </Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Innstillinger
            </Link>
          </nav>

          {/* Desktop CTA / User */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4" />
                  Logg ut
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Logg inn</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">Kom i gang</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                Hjem
              </Link>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                Dashboard
              </Link>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                Innstillinger
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground py-2">{user.email}</span>
                    <Button variant="ghost" className="justify-start" onClick={() => signOut()}>
                      <LogOut className="w-4 h-4" />
                      Logg ut
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className="justify-start w-full">Logg inn</Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="hero" className="w-full">Kom i gang</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
