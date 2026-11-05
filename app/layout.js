import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "AURUM – AI Personal Finance Copilot",
  description: "Next-generation personal wealth management with real-time financial health scoring, autonomous budgeting, and Gemini AI intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#07070D] text-slate-100 antialiased selection:bg-purple-500/30 selection:text-gold relative overflow-x-hidden">
        {/* Ambient Aurora background glowing blobs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7C5CFF]/15 rounded-full blur-[120px] animate-blob-pulse" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#22D3EE]/12 rounded-full blur-[130px] animate-blob-pulse [animation-delay:3s]" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#34D399]/10 rounded-full blur-[140px] animate-blob-pulse [animation-delay:6s]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#10121E",
              color: "#F3F4F6",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              fontSize: "14px",
              boxShadow: "0 10px 30px -5px rgba(0,0,0,0.5)",
            },
            success: {
              iconTheme: {
                primary: "#34D399",
                secondary: "#10121E",
              },
            },
            error: {
              iconTheme: {
                primary: "#FB7185",
                secondary: "#10121E",
              },
            },
          }}
        />

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

