import { Merriweather, Fira_Code } from "next/font/google";
import "@/app/styles/globals.css";


const headingFont = Merriweather({
    variable: "--font-merriweather",
    subsets: ["latin"],
    weight: ["300", "400", "700", "900"],
});

const descriptionFont = Fira_Code({
    variable: "--font-fira-code",
    subsets: ["latin"],
});

export const metadata = {
    title: "Parampreet Singh Portfolio",
    description: "A minimal portfolio of Parampreet Singh",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${headingFont.className} ${descriptionFont.className} antialiased flex flex-col items-center py-24`}
            >
                {children}
            </body>
        </html>
    );
}
