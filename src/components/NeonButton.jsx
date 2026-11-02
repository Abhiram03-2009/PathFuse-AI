
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NeonButton = React.forwardRef(({ 
  children, 
  className, 
  glowColor = "rgba(131, 58, 180, 0.5)",
  hoverScale = 1.05,
  ...props 
}, ref) => {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      className="relative"
    >
      <div 
        className="absolute inset-0 rounded-md opacity-75 blur-md"
        style={{ 
          background: glowColor,
          filter: "blur(8px)"
        }}
      />
      <Button
        ref={ref}
        className={cn(
          "relative z-10 border border-purple-500/50 bg-background/80 text-white shadow-lg backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
});

NeonButton.displayName = "NeonButton";

export { NeonButton };
