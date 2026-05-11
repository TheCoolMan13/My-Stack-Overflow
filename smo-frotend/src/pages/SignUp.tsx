import { Link } from 'react-router-dom';

function SignUp() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-[450px]">

                {/* Card */}
                <div className="bg-white border border-[#dadce0] rounded-lg px-10 py-10">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">S</span>
                        </div>
                        <span className="text-[17px] font-medium tracking-tight text-[#202124]">
                            SMOverflow
                        </span>
                    </div>

                    <h1 className="text-2xl font-normal text-[#202124] mb-2">
                        Create your account
                    </h1>
                    <p className="text-sm text-[#5f6368] mb-8">
                        Join the community and start asking questions
                    </p>

                    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>

                        {/* Username */}
                        <div className="relative">
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                placeholder=" "
                                className="peer w-full h-14 px-3 pt-4 rounded border border-[#dadce0] bg-white text-[15px] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:border-2 focus:px-[11px] transition"
                            />
                            <label
                                htmlFor="username"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#5f6368] bg-white px-1 pointer-events-none transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                            >
                                Username
                            </label>
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder=" "
                                className="peer w-full h-14 px-3 pt-4 rounded border border-[#dadce0] bg-white text-[15px] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:border-2 focus:px-[11px] transition"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#5f6368] bg-white px-1 pointer-events-none transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                            >
                                Email
                            </label>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder=" "
                                    className="peer w-full h-14 px-3 pt-4 rounded border border-[#dadce0] bg-white text-[15px] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:border-2 focus:px-[11px] transition"
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#5f6368] bg-white px-1 pointer-events-none transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder=" "
                                    className="peer w-full h-14 px-3 pt-4 rounded border border-[#dadce0] bg-white text-[15px] text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:border-2 focus:px-[11px] transition"
                                />
                                <label
                                    htmlFor="confirmPassword"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#5f6368] bg-white px-1 pointer-events-none transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
                                >
                                    Confirm
                                </label>
                            </div>
                        </div>

                        <p className="text-xs text-[#5f6368] -mt-1">
                            Use 8 or more characters with a mix of letters, numbers &amp; symbols
                        </p>

                        {/* Terms */}
                        <label className="flex items-start gap-2.5 text-sm text-[#5f6368] cursor-pointer select-none">
                            <input type="checkbox" className="mt-1 accent-[#1a73e8] w-4 h-4" />
                            <span className="leading-relaxed">
                                I agree to the{' '}
                                <a href="#" className="text-[#1a73e8] hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-[#1a73e8] hover:underline">Privacy Policy</a>
                            </span>
                        </label>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                            <Link
                                to="/signin"
                                className="text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-3 py-2 rounded transition"
                            >
                                Sign in instead
                            </Link>
                            <button
                                type="submit"
                                className="bg-[#1a73e8] text-white text-sm font-medium px-6 py-2 rounded hover:bg-[#1765cc] hover:shadow-md transition-all cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-8">
                        <div className="flex-1 h-px bg-[#e8eaed]" />
                        <span className="text-xs text-[#80868b]">OR</span>
                        <div className="flex-1 h-px bg-[#e8eaed]" />
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-[#dadce0] bg-white text-sm font-medium text-[#3c4043] py-2.5 rounded hover:bg-[#f8f9fa] hover:shadow-sm transition cursor-pointer"
                    >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.2-4.9 3.2-8.3z" />
                            <path fill="#34A853" d="M12 23c3 0 5.6-1 7.4-2.7l-3.7-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2v2.9C3.8 20.4 7.6 23 12 23z" />
                            <path fill="#FBBC05" d="M5.8 13.9c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.6H2c-.8 1.6-1.2 3.4-1.2 5.4s.5 3.8 1.2 5.4l3.8-3z" />
                            <path fill="#EA4335" d="M12 5c1.6 0 3.1.6 4.2 1.6l3.2-3.2C17.6 1.8 15 1 12 1 7.6 1 3.8 3.6 2 7.4l3.8 3C6.7 7 9.1 5 12 5z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-[#5f6368] mt-6 px-4">
                    <span>English (United States)</span>
                    <div className="flex items-center gap-5">
                        <a href="#" className="hover:text-[#202124] transition">Help</a>
                        <a href="#" className="hover:text-[#202124] transition">Privacy</a>
                        <a href="#" className="hover:text-[#202124] transition">Terms</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
