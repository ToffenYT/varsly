import { motion } from "framer-motion";
import { EmailPreview } from "./EmailPreview";

export const EmailShowcase = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Profesjonelle e-postvarsler
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Våre varsler er designet for å gi deg all informasjon du trenger på et øyeblikk. 
              Klikk deg rett inn til anbudet på Doffin.
            </p>
            <ul className="space-y-3">
              {[
                "Tydelig overskrift med matchet søkeord",
                "Komplett informasjon om utlyser og frist",
                "Direkte lenke til anbudsdokumentene",
                "Enkel avmelding i bunnen av hver e-post",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <EmailPreview
              keyword="Asfalt"
              tenderTitle="Asfaltering av kommunale veier i Trondheim kommune 2025-2027"
              organization="Trondheim kommune"
              deadline="15. mars 2025"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
