import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "../../api/axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("/auth/login", { email, password });
            if (response.data?.token) {
                localStorage.setItem("token", response.data.token);
            }
            const userData = response.data?.user || {
                name: email.split('@')[0],
                email: email,
                hasCompletedOnboarding: true
            };
            localStorage.setItem("user", JSON.stringify(userData));
            if (userData.hasCompletedOnboarding === false) {
                navigate("/guide");
            } else {
                navigate("/expenses");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please check your credentials.");
        }
    };

    const handleGuestLogin = () => {
        localStorage.removeItem("token");
        localStorage.setItem("user", JSON.stringify({
            name: "Demo Explorer",
            email: "guest@ledgerflow.app",
            isGuest: true
        }));
        navigate("/expenses");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md bg-surface-2 border border-border-default rounded-modal shadow-elevation-modal">
                <CardHeader className="space-y-2 text-center pb-4">
                    <img src="/ledgerxl-logo.png" alt="LedgerXL Logo" className="h-14 w-14 object-contain mx-auto mb-1 drop-shadow-sm rounded-xl" />
                    <CardTitle className="text-xl font-bold tracking-tight text-text-primary">Sign in to Ledger<span className="text-brand">XL</span></CardTitle>
                    <CardDescription className="text-text-secondary text-xs">
                        Access your wealth analytics, category envelopes, and financial command
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submitHandler}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-medium text-negative bg-negative/10 rounded-control border border-negative/20">
                                {error}
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs text-text-secondary font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-surface-3 border-border-default text-text-primary text-xs placeholder:text-text-muted rounded-control focus-ring"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs text-text-secondary font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-surface-3 border-border-default text-text-primary text-xs placeholder:text-text-muted rounded-control focus-ring pr-9"
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
                        <Button type="submit" className="w-full bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium text-xs rounded-control transition-colors shadow-elevation-sm">
                            Sign In
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
                            className="w-full border-border-default bg-surface-3 hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium rounded-control transition-colors"
                        >
                            Continue as Demo Guest
                        </Button>

                        <div className="text-center text-xs text-text-secondary pt-2">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="text-brand hover:text-brand-hover font-medium underline underline-offset-4 transition-colors"
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