import { Roboto_Slab, Fira_Code } from "next/font/google";
import "@/app/styles/globals.css";

const headingFont = Roboto_Slab({
    display: "swap",
    variable: "--font-roboto-slab",
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
    adjustFontFallback: false,
    preload: false
});

const descriptionFont = Fira_Code({
    display: "swap",
    variable: "--font-tomorrow",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    adjustFontFallback: false,
    preload: false
});

export const metadata = {
    title: "Parampreet Singh Portfolio",
    description: "A minimal portfolio of Parampreet Singh",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${headingFont.className} ${descriptionFont.className} antialiased flex flex-col items-center py-12 md:py-16 lg:py-24`}
            >
                {children}
            </body>
        </html>
    );
}
