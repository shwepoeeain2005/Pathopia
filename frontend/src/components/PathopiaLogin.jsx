import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import bgImage from '../assets/signin-bg2.jpg';

const PathopiaLogin = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">

            {/* 1. Zoom In/Out Background Image Animation */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    animation: 'zoomInOut 10s infinite alternate ease-in-out'
                }}
            />

            {/* Background Custom CSS Animation */}
            <style>{`
        @keyframes zoomInOut {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
      `}</style>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-0" />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* 2. ဘယ်ဘက် - Pathopia Welcome Section */}
                <div className="flex-1 text-white space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        <span>Welcome to Pathopia</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        Shape Your <br />
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Career Journey
            </span>
                    </h1>

                    <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed">
                        Step into the simulation world of tomorrow. Learn skills, build your dream career, and master your future step-by-step.
                    </p>
                </div>

                {/* 3. ညာဘက် - Transparent Glassmorphism Auth Card */}
                <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-white">

                    {/* Tab Switcher */}
                    <div className="flex border-b border-white/20 mb-6 relative">
                        <button
                            type="button"
                            onClick={() => setIsSignIn(true)}
                            className={`flex-1 pb-3 text-sm font-bold transition-all ${isSignIn ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignIn(false)}
                            className={`flex-1 pb-3 text-sm font-bold transition-all ${!isSignIn ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {!isSignIn && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:bg-black/30 transition-all"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:bg-black/30 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:bg-black/30 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                            >
                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* 4. Sign Up တွင် Confirm Password ဖြည့်သွင်းခြင်း */}
                        {!isSignIn && (
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 focus:bg-black/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                        >
                            {isSignIn ? 'Enter Pathopia' : 'Create Account'}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 py-1">
                            <div className="h-px flex-1 bg-white/20" />
                            <span className="text-xs font-bold text-white/50 uppercase">or</span>
                            <div className="h-px flex-1 bg-white/20" />
                        </div>

                        <button
                            type="button"
                            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        >
                            <img
                                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                                alt="Google"
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span className="text-sm">Continue with Google</span>
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default PathopiaLogin;