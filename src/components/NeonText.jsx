
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NeonText = React.forwardRef(({ 
  children, 
  className, 
  color = "purple",
  as: Component = "span",
  animate = false,
  ...props 
}, ref) => {
  const colorClasses = {
    purple: "text-purple-500 neon-text",
    blue: "text-blue-500 neon-text",
    cyan: "text-cyan-400 neon-cyan",
    pink: "text-pink-500 neon-pink"
  };

  const selectedColor = colorClasses[color] || colorClasses.purple;

  return (
    <Component
      ref={ref}
      className={cn(
        selectedColor,
        "font-bold",
        className
      )}
      {...props}
    >
      {animate ? (
        <motion.span
          initial={{ opacity: 0.8 }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {children}
        </motion.span>
      ) : (
        children
      )}
    </Component>
  );
});

NeonText.displayName = "NeonText";

export { NeonText };
