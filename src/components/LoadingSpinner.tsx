import { motion } from "framer-motion";

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full" />
      </motion.div>
    </div>
  );
};
