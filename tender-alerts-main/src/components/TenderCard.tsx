import { motion } from "framer-motion";
import { Calendar, Building2, MapPin, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TenderCardProps {
  title: string;
  organization: string;
  location?: string | null;
  deadline?: string | null;
  matchedKeyword: string;
  category?: string | null;
  tenderUrl?: string | null;
  isNew?: boolean;
  delay?: number;
}

export const TenderCard = ({
  title,
  organization,
  location = "",
  deadline,
  matchedKeyword,
  category = "",
  tenderUrl,
  isNew = false,
  delay = 0,
}: TenderCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group bg-card rounded-xl border border-border p-6 shadow-soft hover:shadow-card transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isNew && (
              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                Nytt
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{organization}</span>
        </div>
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
        {deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Frist: {deadline}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Tag className="w-3 h-3 text-primary" />
          <span className="text-xs text-primary font-medium">
            Matchet: "{matchedKeyword}"
          </span>
        </div>
        {tenderUrl ? (
          <a href={tenderUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
              Se detaljer
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        ) : (
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            Se detaljer
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
