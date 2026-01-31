import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">AnbudsVarsler</span>
            </Link>
            <p className="text-background/70 text-sm max-w-sm">
              Automatiske varsler når nye offentlige anbud publiseres på Doffin. 
              Spar tid og vinn flere kontrakter.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-background transition-colors">Funksjoner</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Priser</Link></li>
              <li><Link to="/dashboard" className="hover:text-background transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Juridisk</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-background transition-colors">Personvern</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Vilkår</Link></li>
              <li><Link to="/" className="hover:text-background transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © 2025 AnbudsVarsler. Alle rettigheter reservert.
          </p>
          <p className="text-sm text-background/50">
            Bygget med ❤️ i Norge
          </p>
        </div>
      </div>
    </footer>
  );
};
