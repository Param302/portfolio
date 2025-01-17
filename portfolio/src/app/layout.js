import Head from 'next/head';
import { Roboto, Fira_Code } from "next/font/google";
import "@/app/styles/globals.css";

const headingFont = Roboto({
    display: "swap",
    variable: "--font-roboto",
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
    // icon: {
    //     icon: "/favicon.ico",
    // }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            {/* <Head>
                <link rel="shortcut icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
            </Head> */}
            <body
                className={`${headingFont.className} ${descriptionFont.className} antialiased flex flex-col items-center py-12 md:py-16 lg:py-24`}
            >
                {children}
            </body>
        </html>
    );
}
