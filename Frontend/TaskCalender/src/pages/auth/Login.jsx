import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthFooter from "../../components/AuthFooter";

/* ---------------- Notification ---------------- */

const Notification = ({ message, type, onClose }) => {
  const icons = {
    error: <AlertCircle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
  };

  const colors = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`flex gap-2 p-2.5 rounded-lg border shadow-lg ${colors[type]}`}
    >
      {icons[type]}
      <p className="text-xs font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-base leading-none">
        ×
      </button>
    </motion.div>
  );
};

/* ---------------- Login ---------------- */

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const timerRef = useRef(null);

  const showNotification = (message, type = "error") => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setNotification({ message, type });
    timerRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  useEffect(() => {
    if (user) {
      navigate("/user/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    // Validation
    if (!email || !password) {
      showNotification("Please enter both email and password.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });

      // Show success notification
      showNotification("Login successful! Redirecting...", "success");

      // Navigate immediately without delay - React Router will handle the transition
      // The user state is already set in AuthContext, so UI will update automatically
      setIsSubmitting(false);
    } catch (err) {
      // console.error("Login error:", err);

      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        const { status, data } = err.response;
        const backendMsg = data?.message;

        // ❗ Ignore generic backend messages
        if (backendMsg && backendMsg !== "Unauthorized") {
          errorMessage = backendMsg;
        } else {
          if (status === 401) {
            errorMessage = "Invalid email or password.";
          } else if (status === 403) {
            errorMessage =
              "Your account is not verified yet. Please contact the administrator.";
          } else if (status === 404) {
            errorMessage = "Account not found. Please check your email.";
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      showNotification(errorMessage, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3">
      {/* Notification */}
      <div className="fixed top-3 right-3 z-50 w-full max-w-xs px-3">
        <AnimatePresence>
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <motion.h1
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Sign in to continue your journey
            </p>
          </motion.div>

          {/* Form */}
          <div className="space-y-3">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isSubmitting && handleSubmit()
                  }
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isSubmitting && handleSubmit()
                  }
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold text-xs shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto"
                />
              ) : (
                "Sign In"
              )}
            </motion.button>
          </div>

          {/* Signup Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-gray-600 mt-3"
          >
            New user?{" "}
            <a
              href="/signup"
              className="text-blue-600 font-semibold hover:text-purple-600 transition-colors"
            >
              Create an account
            </a>
          </motion.p>

          {/* Footer */}
          <AuthFooter />
        </motion.div>
      </motion.div>
    </div>
  );
}
