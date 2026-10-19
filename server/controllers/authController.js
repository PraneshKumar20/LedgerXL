const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId, email) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured in environment variables");
    }
    return jwt.sign(
        { id: userId, email },
        secret,
        { expiresIn: "7d" }
    );
};

// Strict email regex requiring user@domain.tld (tld >= 2 letters)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Signup
const Signup = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid request payload format" });
        }

        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters long" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({ 
                message: "Please enter a valid email address with a domain extension (e.g. name@example.com)" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword,
            hasCompletedOnboarding: false
        });

        const token = generateToken(user._id.toString(), user.email);

        res.status(201).json({
            message: "Signup Successful",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                hasCompletedOnboarding: false
            }
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Login
const Login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid email or password format" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        // Backward-compatibility & self-healing for accounts registered with a typo (e.g. missing .com)
        if (!user) {
            // Scenario A: User logs in with "friend@gmail.com", but previously signed up with "friend@gmail"
            if (normalizedEmail.includes(".")) {
                const withoutTld = normalizedEmail.substring(0, normalizedEmail.lastIndexOf("."));
                const legacyUser = await User.findOne({ email: withoutTld });
                if (legacyUser) {
                    const isMatch = await bcrypt.compare(password, legacyUser.password);
                    if (isMatch) {
                        // Automatically heal typo in database so future logins work seamlessly
                        try {
                            legacyUser.email = normalizedEmail;
                            await legacyUser.save();
                        } catch {
                            // Ignore unique index conflict if another user exists
                        }
                        user = legacyUser;
                    }
                }
            }
            // Scenario B: User logs in with "friend@gmail" (missing .com), but their account exists as "friend@gmail.com"
            else {
                const withTld = `${normalizedEmail}.com`;
                const targetUser = await User.findOne({ email: withTld });
                if (targetUser) {
                    const isMatch = await bcrypt.compare(password, targetUser.password);
                    if (isMatch) {
                        user = targetUser;
                    }
                }
            }
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id.toString(), user.email);

        // Treat legacy users (where hasCompletedOnboarding is undefined) as onboarded (true)
        const hasCompletedOnboarding = user.hasCompletedOnboarding !== false;

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                hasCompletedOnboarding
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Complete Onboarding
const completeOnboarding = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Access denied. Unauthorized." });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { hasCompletedOnboarding: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Onboarding completed successfully",
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                hasCompletedOnboarding: true
            }
        });
    } catch (error) {
        console.error("Complete onboarding error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { Signup, Login, completeOnboarding };