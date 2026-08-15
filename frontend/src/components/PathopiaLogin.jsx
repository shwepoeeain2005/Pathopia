import React, { useState } from 'react';
import { Mail, Lock, User, EyeOff, ArrowRight } from 'lucide-react';
import bgImage from '../assets/login-bg.jpg'; // <-- assets ထဲက ပုံကို import လုပ်ပါ

const PathopiaLogin = () => {
    const [isSignIn, setIsSignIn] = useState(true);

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f0b3c]"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0" />

            {/* Header / Logo */}
            <div className="absolute top-8 left-12 z-10 flex items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">🚀 Pathopia</span>
            </div>

            {/* Authentication Container */}
            <div className="relative z-10 w-full max-w-7xl px-12 flex justify-end">
                <div className="w-full max-w-112.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white">

                    {/* Tab Switcher */}
                    <div className="flex border-b border-white/10 mb-8 relative">
                        <button
                            type="button"
                            onClick={() => setIsSignIn(true)}
                            className={`flex-1 pb-4 text-sm font-semibold transition-colors ${isSignIn ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/40'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignIn(false)}
                            className={`flex-1 pb-4 text-sm font-semibold transition-colors ${!isSignIn ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/40'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="space-y-4">
                        {!isSignIn && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                            />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                                <EyeOff className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                        >
                            {isSignIn ? 'Enter Pathopia' : 'Create Account'}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-xs font-bold text-white/40 uppercase">or</span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <button
                            type="button"
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-all"
                        >
                            <img
                                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                                alt="Google"
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span>Continue with Google</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PathopiaLogin;