import Image from "next/image";
import { Braces, MapPin, UsersRound } from "lucide-react";

import TeachingImpact from "@/app/components/TeachingImpact";

function Gallery({ title, images }) {
  return (
    <div className="mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2" aria-label={`${title} event photos`} role="list" tabIndex={0}>
      {images.map((src, index) => <div key={src} role="listitem" className="relative aspect-square min-w-[42%] snap-start overflow-hidden rounded-2xl bg-prussian-blue/10 sm:min-w-[31%]"><Image src={src} alt={`${title} event ${index + 1} of ${images.length}`} fill sizes="(min-width: 1024px) 15vw, 42vw" className="object-cover transition duration-500 hover:scale-105" /></div>)}
    </div>
  );
}

export default function CommunitySection({ codexImages, pyDelhiImages, subscriberLabel }) {
  return (
    <section id="community" className="section-anchor bg-papaya-whip px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center"><p className="font-heading text-sm uppercase tracking-[0.3em] text-prussian-blue/60">Community builder & educator</p><h2 className="mt-4 font-accent text-5xl font-bold italic tracking-tight text-prussian-blue sm:text-6xl lg:text-7xl">Building with people</h2><p className="mx-auto mt-5 max-w-2xl font-description leading-8 text-prussian-blue/75">Organizing, teaching, and creating spaces where people can learn, build, and ship together.</p></div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] bg-prussian-blue p-6 text-bright-snow shadow-soft sm:p-8"><div className="flex items-center gap-3"><span className="rounded-2xl bg-sky-surge p-3 text-ink-black"><Braces className="h-6 w-6" /></span><div><h3 className="font-heading text-2xl font-bold">Codex Ambassador</h3><p className="font-description text-sm opacity-70"><MapPin className="mr-1 inline h-4 w-4" />New Delhi</p></div></div><p className="mt-5 font-description leading-7 text-bright-snow/80">Official regional ambassador. Hosted community events and two hackathons, including one that brought together approximately 150 participants.</p><Gallery title="Codex New Delhi" images={codexImages} /></article>
          <article className="rounded-[2rem] bg-bright-snow p-6 text-prussian-blue shadow-soft sm:p-8"><div className="flex items-center gap-3"><span className="rounded-2xl bg-papaya-whip p-3"><UsersRound className="h-6 w-6" /></span><div><h3 className="font-heading text-2xl font-bold">PyDelhi</h3><p className="font-description text-sm opacity-65">Organizing team</p></div></div><p className="mt-5 font-description leading-7 text-prussian-blue/75">Helping organize Delhi&apos;s official Python community chapter and volunteering across meetups that connect local learners, maintainers, and builders.</p><Gallery title="PyDelhi" images={pyDelhiImages} /></article>
        </div>
        <TeachingImpact subscriberLabel={subscriberLabel} />
      </div>
    </section>
  );
}
