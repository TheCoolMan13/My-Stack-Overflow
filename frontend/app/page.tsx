import Header from "@/components/Header";

export default function MainPage() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-900 text-white font-sans">

            <Header />

            <main className="flex flex-1 items-center justify-center">
                <div>
                    <span>Hello World</span>
                </div>
            </main>

        </div>
    );
}