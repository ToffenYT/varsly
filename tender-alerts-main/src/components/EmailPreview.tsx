import { motion } from "framer-motion";
import { Mail, ExternalLink } from "lucide-react";

interface EmailPreviewProps {
  keyword: string;
  tenderTitle: string;
  organization: string;
  deadline: string;
}

export const EmailPreview = ({
  keyword,
  tenderTitle,
  organization,
  deadline,
}: EmailPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      {/* Email client chrome */}
      <div className="bg-secondary rounded-t-xl p-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>varsler@anbudsvarsler.no</span>
          </div>
        </div>
      </div>

      {/* Email content */}
      <div className="bg-card border border-border border-t-0 rounded-b-xl shadow-elevated overflow-hidden">
        {/* Email header */}
        <div className="p-6 border-b border-border">
          <div className="text-xs text-muted-foreground mb-2">Til: deg@firma.no</div>
          <h3 className="font-semibold text-foreground">
            🔔 Nytt anbud funnet for søkeordet: "{keyword}"
          </h3>
        </div>

        {/* Email body */}
        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            Hei! Vi har funnet et nytt anbud som matcher dine søkekriterier:
          </p>

          {/* Tender card in email */}
          <div className="bg-secondary/50 rounded-lg p-5 mb-6 border border-border">
            <h4 className="font-semibold text-foreground mb-3 leading-snug">
              {tenderTitle}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utlyser:</span>
                <span className="text-foreground font-medium">{organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frist:</span>
                <span className="text-destructive font-medium">{deadline}</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="#"
            className="block w-full gradient-hero text-primary-foreground text-center py-4 rounded-lg font-medium shadow-soft hover:shadow-card transition-all"
          >
            Se detaljer og dokumenter
            <ExternalLink className="w-4 h-4 inline ml-2" />
          </a>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Du mottar dette varselet fordi du abonnerer på søkeordet "{keyword}".
              <br />
              <a href="#" className="text-primary hover:underline">Meld av varsling</a>
              {" · "}
              <a href="#" className="text-primary hover:underline">Administrer innstillinger</a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
