import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { LocaleProvider } from "@/contexts/LocaleContext";

export const metadata = {
  title: "GOY eSIM - Global Connectivity Solution",
  description: "Experience seamless global connectivity with instant eSIM activation",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-b from-slate-50 via-white to-slate-50`}>
        <LocaleProvider>
          <AuthProvider>
            <CheckoutProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </CheckoutProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
