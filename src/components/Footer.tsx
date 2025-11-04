import { motion } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-16 pb-8 text-center space-y-4"
    >
      {/* Display Mode Button */}
      <div className="flex justify-center mb-6">
        <Link to="/display">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Display Mode
          </Button>
        </Link>
      </div>

      {/* Main Footer Text */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Made with</span>
        <Heart className="h-4 w-4 text-destructive fill-destructive" />
        <span>for the growth of the youth</span>
      </div>
      
      {/* Copyright */}
      <p className="text-sm text-muted-foreground">
        © {currentYear} Arnon Koomson. All rights reserved.
      </p>
    </motion.footer>
  );
};
