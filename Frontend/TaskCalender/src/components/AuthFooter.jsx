import { motion } from "framer-motion";
import { Heart, Mail, Linkedin, Github, Twitter } from "lucide-react";

export default function AuthFooter() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-8 text-center space-y-4"
    >
      {/* Made with love section */}
      <motion.div 
        className="flex items-center justify-center gap-2 text-sm text-gray-600"
        whileHover={{ scale: 1.05 }}
      >
        <span>Made with</span>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        </motion.div>
        <span>by <span className="font-semibold text-gray-800">Adarsh Jha</span></span>
      </motion.div>

      {/* Social media and contact */}
      <div className="flex items-center justify-center gap-4">
        <motion.a
          href="mailto:adarsh@example.com"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Email"
        >
          <Mail className="w-4 h-4" />
        </motion.a>
        
        <motion.a
          href="https://linkedin.com/in/adarsh-jha"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          title="LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </motion.a>
        
        <motion.a
          href="https://github.com/adarsh-jha"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors"
          title="GitHub"
        >
          <Github className="w-4 h-4" />
        </motion.a>
        
        <motion.a
          href="https://twitter.com/adarsh_jha"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors"
          title="Twitter"
        >
          <Twitter className="w-4 h-4" />
        </motion.a>
      </div>

      {/* Contact number */}
      <motion.p 
        className="text-xs text-gray-500"
        whileHover={{ scale: 1.05 }}
      >
        📞 +91 98765-43210
      </motion.p>

      {/* Terms and Privacy */}
      <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
        <motion.a
          href="/terms"
          whileHover={{ scale: 1.1, color: "#4B5563" }}
          className="hover:underline"
        >
          Terms & Conditions
        </motion.a>
        <span>•</span>
        <motion.a
          href="/privacy"
          whileHover={{ scale: 1.1, color: "#4B5563" }}
          className="hover:underline"
        >
          Privacy Policy
        </motion.a>
      </div>
    </motion.footer>
  );
}