import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
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

/* ---------------- Signup ---------------- */

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    goals: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const timerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showNotification = (message, type = "error") => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setNotification({ message, type });
    timerRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSubmit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      showNotification("All required fields must be filled.");
      return;
    }

    const nameRegex = /^[a-zA-Z ]{3,}$/;
    if (!nameRegex.test(name)) {
      showNotification(
        "Name must be at least 3 characters and contain only letters."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showNotification("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signup(form);

      showNotification(
        "Signup successful! Please contact the administrator for account verification. You will be redirected to the login page in 8 seconds." ||
          res?.message,
        "success"
      );

      setIsSubmitting(false);

      timerRef.current = setTimeout(() => {
        navigate("/", { replace: true });
      }, 8000);
    } catch (err) {
      let errorMessage = "Signup failed. Please try again.";

      if (err.response) {
        const { status, data } = err.response;
        const backendMsg = data?.message;

        if (
          backendMsg &&
          backendMsg !== "Unauthorized" &&
          backendMsg !== "Bad Request"
        ) {
          errorMessage = backendMsg;
        } else {
          if (status === 409) {
            errorMessage =
              "Email already exists. Please use a different email.";
          } else if (status === 400) {
            errorMessage = "Invalid signup data. Please check all fields.";
          } else if (status === 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
      }

      showNotification(errorMessage, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-3">
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
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 my-2"
      >
        <h1 className="text-xl font-bold text-center mb-0.5 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-center text-gray-500 text-xs mb-4">
          Start your journey with us
        </p>

        {/* Name */}
        <Input
          icon={<User className="w-4 h-4" />}
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          onEnter={handleSubmit}
          disabled={isSubmitting}
        />

        {/* Email */}
        <Input
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          onEnter={handleSubmit}
          disabled={isSubmitting}
        />

        {/* Password */}
        <div className="mb-2.5">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-9 pr-9 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) =>
                e.key === "Enter" && !isSubmitting && handleSubmit()
              }
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Goals */}
        <Input
          icon={<Target className="w-4 h-4" />}
          label="Goals (optional)"
          value={form.goals}
          onChange={(v) => setForm({ ...form, goals: v })}
          onEnter={handleSubmit}
          disabled={isSubmitting}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold text-xs disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-xs text-gray-600 mt-3">
          Already have an account?{" "}
          <a href="/" className="text-purple-600 font-semibold">
            Sign in
          </a>
        </p>

        <AuthFooter />
      </motion.div>
    </div>
  );
}

/* ---------------- Reusable Input ---------------- */

function Input({
  label,
  value,
  onChange,
  icon,
  onEnter,
  type = "text",
  disabled = false,
}) {
  return (
    <div className="mb-2.5">
      <label className="text-xs font-medium text-gray-700 block mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && onEnter()}
          className="w-full pl-9 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
