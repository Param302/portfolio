export const metadata = {
  title: { absolute: "Admin | itsparam.in" },
  description: "Private site management.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({ children }) {
  return children;
}
