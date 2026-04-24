export default function Header() {
    return (
        <header className="w-full border-b border-white/20 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-6">
                    {/* Title */}
                    <h1 className="text-lg font-semibold tracking-tight">
                        Stack my Overflow
                    </h1>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-4">

                    {/* AI Agent Indicator */}
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>llama-3.1-8b-instant</span>
                        <span className="text-zinc-500">· Cloud</span>
                    </div>

                     
                    {/* Ask Question Button */}
                    <button
                        className="bg-white text-black text-sm px-4 py-1.5 rounded-md font-medium hover:bg-zinc-200 transition"
                        aria-label="Ask a question"
                        //onClick={() => console.log("Ask Question Button")}
                    >
                        Ask a question
                    </button>

                    {/* Username */}
                    <span className="text-sm text-zinc-300">
                        Titus_AC_LABS
                    </span>

                    {/* Sign Out */}
                    <button
                        className="text-sm text-zinc-400 hover:text-white transition"
                        aria-label="Sign out"
                        //onClick={() => console.log("User signed out")}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    );
}