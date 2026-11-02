
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GlassCard = React.forwardRef(({ 
  children, 
  className, 
  hoverEffect = true,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "glass-effect rounded-xl border border-white/10 p-6 shadow-xl",
        hoverEffect && "transition-all duration-300 hover:border-purple-500/30 hover:shadow-purple-500/20",
        className
      )}
      whileHover={hoverEffect ? { y: -5 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
});

GlassCard.displayName = "GlassCard";

export { GlassCard };
