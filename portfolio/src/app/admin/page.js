import AdminDashboard from "@/app/admin/AdminDashboard";
import AdminLogin from "@/app/admin/AdminLogin";
import { getAdminSession } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!isDatabaseConfigured()) return <main className="flex min-h-screen items-center justify-center bg-ink-black px-4 text-bright-snow"><div className="max-w-xl rounded-[2rem] border border-bright-snow/10 bg-prussian-blue p-8"><h1 className="font-heading text-3xl font-bold">Admin setup required</h1><p className="mt-4 font-description leading-7 text-bright-snow/70">Add DATABASE_URL, run the database migration, and create the owner login with the included setup command. The public site continues using repository content until then.</p></div></main>;
  const session = await getAdminSession();
  return session ? <AdminDashboard /> : <AdminLogin />;
}
