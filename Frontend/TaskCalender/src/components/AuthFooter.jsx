import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, Linkedin, Github, Twitter, X, Shield, Lock, Eye, FileText } from "lucide-react";
import { useState } from "react";

 

export default function AuthFooter() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 pt-3 border-t border-gray-100 text-center space-y-1.5"
      >
        {/* Made with love section */}
        <motion.div 
          className="flex items-center justify-center gap-1 text-[10px] text-gray-600"
          whileHover={{ scale: 1.02 }}
        >
          <span>Made with</span>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
          </motion.div>
          <span>by <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Adarsh Jha</span></span>
        </motion.div>

        {/* Social media and contact */}
        <motion.div 
          className="flex items-center justify-center gap-1.5"
        >
          {[
            { icon: Mail, href: "mailto:adarsh25nov@example.com", title: "Email" },
            { icon: Linkedin, href: "https://www.linkedin.com/in/adarsh-kumar-13a17b2a7/", title: "LinkedIn" },
            { icon: Github, href: "https://github.com/jhadarsh", title: "GitHub" },
            { icon: Twitter, href: "https://twitter.com", title: "Twitter" }
          ].map(({ icon: Icon, href, title }) => (
            <motion.a
              key={title}
              href={href}
              target={href.startsWith('http') ? "_blank" : undefined}
              rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
              whileHover={{ scale: 1.15, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title={title}
            >
              <Icon className="w-2.5 h-2.5" />
            </motion.a>
          ))}
        </motion.div>

        {/* Terms and Privacy */}
    <div className="flex flex-col items-center justify-center gap-0.5 text-[9px] text-gray-500">
  
  

  {/* Row 2: Contact Number */}
  <motion.div
    className="flex items-center gap-0.5 text-gray-600"
    whileHover={{ scale: 1.05 }}
  >
    <span>📞</span>
    <span className="font-medium">8700370172</span>
  </motion.div>

</div>


        {/* Copyright */}
        <p className="text-[8px] text-gray-400">
          © 2025 All rights reserved
        </p>
      </motion.footer>

    
    </>
  );
}