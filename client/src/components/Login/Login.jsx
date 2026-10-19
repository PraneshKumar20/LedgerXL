import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import axios from "../../api/axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { getEmailSuggestion } from "../../utils/validationUtils";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Intelligently check for common typos like missing .com
    const emailSuggestion = useMemo(() => {
        return getEmailSuggestion(email);
    }, [email]);

    const handleApplySuggestion = () => {
        if (emailSuggestion) {
            setEmail(emailSuggestion);
            setError("");
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");

        const cleanEmail = email.trim();
        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("/auth/login", { 
                email: cleanEmail.toLowerCase(), 
                password 
            });

            if (response.data?.token) {
                localStorage.setItem("token", response.data.token);
            }
            const userData = response.data?.user || {
                name: cleanEmail.split('@')[0],
                email: cleanEmail.toLowerCase(),
                hasCompletedOnboarding: true
            };
            localStorage.setItem("user", JSON.stringify(userData));
            if (userData.hasCompletedOnboarding === false) {
                navigate("/guide");
            } else {
                navigate("/expenses");
            }
        } catch (err) {
            if (!err.response) {
                setError("Unable to connect to the server. Please check your internet connection.");
            } else {
                setError(err.response?.data?.message || "Invalid email or password. Please verify your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        try {
            localStorage.removeItem("token");
            localStorage.setItem("user", JSON.stringify({
                name: "Demo Explorer",
                email: "guest@ledgerflow.app",
                isGuest: true
            }));
        } catch {
            // Ignore localStorage errors
        }
        navigate("/expenses");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
            <Card className="w-full max-w-md bg-surface-2 border border-border-default rounded-modal shadow-elevation-modal">
                <CardHeader className="space-y-2 text-center pb-4">
                    <img src="/ledgerxl-logo.png" alt="LedgerXL Logo" className="h-14 w-14 object-contain mx-auto mb-1 drop-shadow-sm rounded-xl" />
                    <CardTitle className="text-xl font-bold tracking-tight text-text-primary">Sign in to Ledger<span className="text-brand">XL</span></CardTitle>
                    <CardDescription className="text-text-secondary text-xs">
                        Access your wealth analytics, category envelopes, and financial command
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submitHandler} noValidate>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-2.5 p-3 text-xs font-medium text-negative bg-negative/10 rounded-control border border-negative/20 leading-relaxed">
                                <AlertCircle className="h-4 w-4 text-negative shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs text-text-secondary font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="alex@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError("");
                                }}
                                required
                                autoComplete="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck="false"
                                className="bg-surface-3 border-border-default text-text-primary text-base sm:text-xs placeholder:text-text-muted rounded-control focus-ring"
                            />

                            {/* Intelligent Typo Suggestion Chip */}
                            {emailSuggestion && emailSuggestion !== email.trim().toLowerCase() && (
                                <div className="flex items-center justify-between gap-2 p-2 bg-brand/10 border border-brand/20 rounded-control text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Sparkles className="h-3.5 w-3.5 text-brand shrink-0" />
                                        <span className="text-text-secondary truncate text-[11px]">
                                            Did you mean <strong className="text-brand font-semibold">{emailSuggestion}</strong>?
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplySuggestion}
                                        className="text-[11px] font-semibold text-brand hover:underline px-2 py-0.5 rounded bg-surface-2 border border-brand/20 hover:bg-surface-hover cursor-pointer shrink-0 transition-colors"
                                    >
                                        Use this
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs text-text-secondary font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    required
                                    autoComplete="current-password"
                                    className="bg-surface-3 border-border-default text-text-primary text-base sm:text-xs placeholder:text-text-muted rounded-control focus-ring pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded-r-control cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium text-xs rounded-control transition-colors shadow-elevation-sm cursor-pointer disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Signing In...</span>
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="relative w-full py-1">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border-default"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-surface-2 px-2 text-text-muted font-mono-nums">Or explore instantly</span>
                            </div>
                        </div>

                        <Button 
                            type="button" 
                            onClick={handleGuestLogin}
                            variant="outline" 
                            className="w-full border-border-default bg-surface-3 hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium rounded-control transition-colors cursor-pointer"
                        >
                            Continue as Demo Guest
                        </Button>

                        <div className="text-center text-xs text-text-secondary pt-2">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="text-brand hover:text-brand-hover font-medium underline underline-offset-4 transition-colors cursor-pointer"
                            >
                                Sign up
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;