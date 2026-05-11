import { Link } from 'react-router-dom';

export default function NavBar() {
    return (
        <header className="sticky top-0 z-50 w-full h-16 bg-white/95 backdrop-blur-md border-b border-[#e8eaed]">
            <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between gap-6">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-white font-semibold text-sm">S</span>
                    </div>
                    <span className="text-[17px] font-medium tracking-tight text-[#202124]">
                        SMOverflow
                    </span>
                </Link>

                {/* Center: Search */}
                <div className="hidden md:flex flex-1 max-w-md mx-6">
                    <div className="relative w-full">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search questions"
                            className="w-full h-10 pl-10 pr-4 rounded-full bg-[#f1f3f4] text-sm text-[#202124] placeholder:text-[#5f6368] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#dadce0] focus:shadow-[0_1px_6px_rgba(32,33,36,0.12)] transition"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">

                    <div className="hidden lg:flex items-center gap-2 text-xs text-[#5f6368] px-3 py-1.5 rounded-full bg-[#f1f3f4]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#188038]" />
                        <span className="font-medium">llama-3.1-8b</span>
                    </div>

                    <button
                        className="bg-[#1a73e8] text-white text-sm px-5 py-2 rounded-full font-medium hover:bg-[#1765cc] hover:shadow-md transition-all cursor-pointer"
                        aria-label="Ask a question"
                    >
                        Ask
                    </button>

                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/signin"
                            className="text-sm font-medium text-[#5f6368] hover:text-[#202124] transition"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/signup"
                            className="text-sm font-medium text-[#1a73e8] hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
