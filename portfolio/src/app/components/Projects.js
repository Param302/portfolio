export default function Projects() {
    return (
        <section id="projects" className="flex flex-col space-y-2">
            <h2 className="text-3xl font-semibold font-heading">Projects</h2>
            <div className="flex flex-col space-y-6">
                <article>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-2xl font-medium font-heading">Code Track</h3>
                        {/* github logo */}
                        <span className="self-end">(<a className="underline font-medium" href="https://code-track.vercel.app/">code-track.vercel.app</a>)</span>
                    </div>
                    <ul className="list-disc list-inside italic flex flex-row gap-4 text-sm pl-2 font-heading font-medium">
                        <li>Next.js</li>
                        <li>Tailwind</li>
                        <li>GraphQL</li>
                    </ul>
                    <p className="pl-2 font-medium">
                        A tool to track and showcase Github Contributions with one line of code.
                    </p>
                </article>
                <article>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-2xl font-medium font-heading">E-Pustakalya</h3>
                        {/* github logo */}
                    </div>
                    <ul className="list-disc list-inside italic flex flex-row gap-4 text-sm pl-2 font-heading font-medium">
                        <li>Flask</li>
                        <li>RESTful API</li>
                        <li>JavaScript</li>
                    </ul>
                    <p className="pl-2 font-medium">
                        An End to End Library Management System with RESTful APIs and minimal UI.
                    </p>
                </article>
                <article>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-2xl font-medium font-heading">Heart Disease Predictor</h3>
                        {/* github logo */}
                    </div>
                    <ul className="list-disc list-inside italic flex flex-row gap-4 text-sm pl-2 font-heading font-medium">
                        <li>ANN</li>
                        <li>Tensorflow</li>
                        <li>Tkinter</li>
                    </ul>
                    <p className="pl-2 font-medium">
                        A Desktop Application made using Artificial Neural Networks (98% acc).
                    </p>
                </article>
            </div>
        </section>
    )
};