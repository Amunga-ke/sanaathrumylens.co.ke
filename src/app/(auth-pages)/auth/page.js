"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast"; // Added toast import
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading, loginWithEmail, signupWithEmail, loginWithGoogle, error, resetPassword } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    // Get redirect URL from query params
    const redirectPath = searchParams.get('redirect') || '/';

    // Redirect if user is already logged in
    useEffect(() => {
        if (user && !loading) {
            // Add small delay to ensure auth state is fully updated
            setTimeout(() => {
                router.push(redirectPath);
            }, 500);
        }
    }, [user, loading, router, redirectPath]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        // Clear errors when user types
        if (formError) setFormError("");
        if (error) setFormError(error);
    };

    // Validate form
    const validateForm = () => {
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        if (!formData.password) {
            toast.error("Password is required");
            return false;
        }

        if (!isLogin) {
            if (formData.password.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return false;
            }

            if (!formData.displayName.trim()) {
                toast.error("Name is required");
                return false;
            }
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormError("");

        try {
            let result;

            if (isLogin) {
                result = await loginWithEmail(formData.email, formData.password);
            } else {
                result = await signupWithEmail(formData.email, formData.password, formData.displayName);
            }

            if (result.success) {
                toast.success(isLogin ? "Login successful! Redirecting..." : "Account created successfully! Redirecting...");

                // Store remember me preference in localStorage
                if (formData.rememberMe) {
                    localStorage.setItem("rememberEmail", formData.email);
                } else {
                    localStorage.removeItem("rememberEmail");
                }

                // Redirect after success
                setTimeout(() => {
                    router.push(redirectPath);
                }, 1500);
            } else {
                toast.error(result.error || "Authentication failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred. Please try again.");
            console.error("Auth error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Google login
    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setFormError("");

        try {
            const result = await loginWithGoogle();
            if (result.success) {
                toast.success("Google login successful! Redirecting...");
                setTimeout(() => router.push(redirectPath), 1500);
            } else {
                toast.error("Google login failed. Please try again.");
            }
        } catch (err) {
            toast.error("An error occurred with Google login.");
            console.error("Google login error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle password reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!resetEmail.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(resetEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        try {
            await resetPassword(resetEmail);
            toast.success("Password reset email sent! Check your inbox.");
            setResetEmail("");
            setTimeout(() => setShowResetPassword(false), 3000);
        } catch (err) {
            toast.error("Failed to send reset email. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberEmail");
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
    }, []);

    // Handle back to article button
    const handleBackToArticle = () => {
        if (redirectPath !== '/') {
            router.push(redirectPath);
        } else {
            router.push('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (

        <div className="min-h-screen  items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 flex flex-col">



            {/* Main Content */}
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 relative">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                                sizes="40px"
                                priority           // Ensures logo loads immediately for LCP
                                loading="eager"    // Explicit eager load
                            />
                        </div>

                        <span className="font-bold text-gray-900 text-lg">Sanaathrumylens</span>
                    </Link>

                    {redirectPath !== "/" && (
                        <button
                            onClick={handleBackToArticle}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Article
                        </button>
                    )}
                </div>
            </header>


            {/* Reset Password Modal */}
            {showResetPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                            <button
                                onClick={() => {
                                    setShowResetPassword(false);
                                    setResetEmail("");
                                    setFormError("");
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Enter your email and we&apos;ll send a link to reset your password.
                        </p>

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                                required
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowResetPassword(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Auth Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-gray-600">
                        {isLogin
                            ? "Sign in to continue to Sanaathrumylens"
                            : "Join our community and start sharing"}
                    </p>
                    {redirectPath !== "/" && (
                        <p className="text-xs text-gray-400 mt-1">
                            You&apos;ll be redirected back to the article after login
                        </p>
                    )}
                </div>

                {/* Error/Success Messages */}
                {formError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                        <p className="text-red-700 text-sm">{formError}</p>
                    </div>
                )}
                {formSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={20} />
                        <p className="text-green-700 text-sm">{formSuccess}</p>
                    </div>
                )}

                {/* Social Login */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="font-medium">Continue with Google</span>
                    </button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                            disabled={isSubmitting}
                        />
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                            disabled={isSubmitting}
                            autoComplete="email"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                            disabled={isSubmitting}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm Password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition disabled:opacity-50"
                    >
                        {isSubmitting
                            ? isLogin
                                ? "Signing In..."
                                : "Creating Account..."
                            : isLogin
                                ? "Sign In"
                                : "Create Account"}
                    </button>
                </form>

                {/* Switch Login/Signup */}
                <p className="mt-4 text-center text-gray-600 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setFormError("");
                            setFormSuccess("");
                            setFormData({ email: formData.email, password: "", confirmPassword: "", displayName: "", rememberMe: formData.rememberMe });
                        }}
                        className="text-black font-medium hover:underline"
                        disabled={isSubmitting}
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>




        </div>
    );
}