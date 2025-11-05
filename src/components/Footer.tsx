import { motion } from "framer-motion";
import { ExternalLink, Mail, Linkedin, Github, ArrowUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

// Twitter/X Logo Component
const TwitterXIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.22-6.817-5.974 6.817H2.42l7.723-8.835L1.254 2.25h6.977l4.716 6.231 5.277-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer = ({ qrCodeRef }: { qrCodeRef?: any }) => {
  const currentYear = new Date().getFullYear();

  const handleQRCodeClick = () => {
    // Trigger the QR code dialog through ref
    if (qrCodeRef?.current) {
      qrCodeRef.current.click();
    }
  };

  const socialLinks = [
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/koomsonak", color: "hover:text-blue-600 dark:hover:text-blue-400", glowColor: "hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-400/50", glow: true },
    { icon: Github, label: "GitHub", href: "https://github.com/koomson-ak", color: "hover:text-gray-800 dark:hover:text-gray-300", glowColor: "hover:shadow-lg hover:shadow-gray-700/50 dark:hover:shadow-gray-300/50", glow: true },
    { icon: TwitterXIcon, label: "X", href: "https://x.com/trpArnon", color: "hover:text-black dark:hover:text-white", glowColor: "hover:shadow-lg hover:shadow-black/50 dark:hover:shadow-white/50", glow: true },
    { icon: Mail, label: "Email", href: "mailto:trp.arnon@gmail.com", color: "hover:text-red-500 dark:hover:text-red-400", glowColor: "hover:shadow-lg hover:shadow-red-500/50 dark:hover:shadow-red-400/50", glow: true },
    { icon: Phone, label: "Phone", href: "tel:+233599704950", color: "hover:text-green-600 dark:hover:text-green-400", glowColor: "hover:shadow-lg hover:shadow-green-500/50 dark:hover:shadow-green-400/50", glow: true },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-20 bg-gradient-to-t from-muted/50 to-transparent py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <img src="/church-128x128.png" alt="YouthConnect Logo" className="h-5 w-5" />
              YouthConnect
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering the youth and strengthening the Church through meaningful connections and shared values.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="font-semibold text-sm">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/display" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  Display Mode
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Attendance Tracking
                </a>
              </li>
              <li>
                <button
                  onClick={handleQRCodeClick}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  QR Code Integration
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Connect Section */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="font-semibold text-sm">Connect With The Creator</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg bg-muted transition-all ${social.color} ${
                      social.glow ? `hover:shadow-lg ${social.glowColor}` : ""
                    }`}
                    title={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Separator */}
        <Separator className="my-8" />

        {/* Bottom Section */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            <p>© {currentYear} Arnon Kobina Koomson. All rights reserved.</p>
            <p className="mt-1">Built with passion for youth empowerment and Church growth</p>
          </div>

          {/* Scroll to Top Button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3 }}
            whileTap={{ y: 0 }}
            className="p-2 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
            title="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </motion.footer>
  );
};
