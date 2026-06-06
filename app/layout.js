import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./SessionProvider/provider";
import { UserProvider } from "../context/UserContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: {
    default: "Habit Tracker | Build healthy daily habits",
    template: "%s | Habit Tracker",
  },
  description: "Habit Tracker helps you build daily habits, track progress, and stay consistent with a clean, secure dashboard.",
  openGraph: {
    title: "Habit Tracker | Build healthy daily habits",
    description: "Habit Tracker helps you build daily habits, track progress, and stay consistent with a clean, secure dashboard.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habit Tracker | Build healthy daily habits",
    description: "Habit Tracker helps you build daily habits, track progress, and stay consistent with a clean, secure dashboard.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <UserProvider>{children}</UserProvider>
        </Providers>
      </body>
    </html>
  );
}