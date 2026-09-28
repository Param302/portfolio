import { FileText, Inbox, ScrollText } from "lucide-react";

const navigation = [
  { label: "Resume", icon: FileText, active: true },
  { label: "Logs", icon: ScrollText },
  { label: "Inbox", icon: Inbox },
];

export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-[#eef3f7] text-prussian-blue" aria-label="Loading admin workspace">
      <div className="grid min-h-screen md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden h-screen border-r border-bright-snow/10 bg-ink-black p-4 text-bright-snow md:block">
          <div className="pt-1">
            <p className="font-heading text-lg font-bold">itsparam.in</p>
            <p className="text-xs text-bright-snow/45">Private workspace</p>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            {navigation.map(({ label, icon: Icon, active }) => (
              <div key={label} className={`inline-flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? "bg-sky-surge text-ink-black" : "text-bright-snow/55"}`}>
                <Icon className="h-5 w-5" />{label}
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-10 flex min-h-[65px] items-center justify-between border-b border-prussian-blue/10 bg-white/92 px-4 backdrop-blur sm:px-6">
            <div className="h-4 w-44 animate-pulse rounded-full bg-prussian-blue/10" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-prussian-blue/10" />
          </header>
          <div className="space-y-4 p-4 sm:p-6">
            <div>
              <div className="h-9 w-36 animate-pulse rounded-xl bg-prussian-blue/10" />
              <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded-full bg-prussian-blue/8" />
            </div>
            {["profile", "experience", "education", "projects"].map((item, index) => (
              <section key={item} className="rounded-[1.35rem] border border-prussian-blue/10 bg-white p-5">
                <div className={`h-5 animate-pulse rounded-full bg-prussian-blue/10 ${index % 2 ? "w-28" : "w-40"}`} />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="h-10 animate-pulse rounded-xl bg-[#eef3f7]" />
                  <div className="h-10 animate-pulse rounded-xl bg-[#eef3f7]" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
