import { Analytics } from "@vercel/analytics/react"
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
    description: "A Developer, python student and an ML enthusiast.",
    keywords: [
        'Parampreet Singh', 'Param', 'Singh', 'Developer Portfolio', 'Machine Learning', 'Python Developer', 'Python sessions', 'Python playlist', 'Machine Learning sessions', 'Machine Learning playlist', 'AI', 'ML',
        'Next.js Projects', 'Artificial Intelligence', 'Data Science', 'IIT Madras',
        'Heart Disease Predictor', 'E-Pustakalya', 'Code Track', 'GUI Development',
        'Deep Learning', 'Flask Projects', 'TensorFlow', 'Tkinter Applications'
    ],
    authors: [{ name: "Parampreet Singh", url: "https://parampreetsingh.me" }],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
            <meta name="google-site-verification" content="WO5xWIFDFFe6h7lIEMnhEEMK7rDztpeIoiTKkHe7OLs" />
            <meta name="msvalidate.01" content="D3DA4D66F5C210EDBD5F78589E4A7DD1" />
            </head>
            <body
                className={`${headingFont.className} ${descriptionFont.className} antialiased flex flex-col items-center py-12 md:py-16 lg:py-24`}
            >
                {children}
                <Analytics/>
            </body>
        </html>
    );
}
