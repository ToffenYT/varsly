import { motion } from "framer-motion";
import { Bell, Clock, Mail, Filter, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Instant varsler",
    description: "Få beskjed umiddelbart når et nytt anbud matcher dine søkeord.",
  },
  {
    icon: Filter,
    title: "Smarte filtre",
    description: "Definer egne søkeord, kategorier og geografiske områder.",
  },
  {
    icon: Mail,
    title: "Daglig oppsummering",
    description: "Velg mellom instant varsler eller én daglig e-post med alle treff.",
  },
  {
    icon: Clock,
    title: "Aldri gå glipp av frister",
    description: "Tydelige fristvisninger og påminnelser før anbudsfristen går ut.",
  },
  {
    icon: Shield,
    title: "GDPR-kompatibel",
    description: "Dine data er trygge. Enkel avmelding når som helst.",
  },
  {
    icon: Zap,
    title: "Oppdateres kontinuerlig",
    description: "Doffin sjekkes hver time for nye anbud.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Alt du trenger for å vinne anbud
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Kraftige verktøy som hjelper deg å finne de riktige anbudene og levere til rett tid.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border shadow-soft hover:shadow-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
