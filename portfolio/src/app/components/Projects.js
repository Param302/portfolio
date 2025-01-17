export default function Projects() {
    return (
        <section id="projects" className="flex flex-col space-y-1 md:space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium font-heading">Projects</h2>
            <div className="flex flex-col space-y-4">
                <article>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-md md:text-lg md:text-xl font-medium font-heading">Code Track</h3>
                        <a href="https://github.com/Param302/CodeTrack/" target="_blank" rel="noopener noreferrer"><img src="github.svg" alt="Github" className="h-6 w-6"/></a>
                        <span className="md:self-end text-xs md:text-lg">(<a className="underline font-medium" href="https://code-track.vercel.app/" target="_blank" rel="noopener noreferrer">code-track.vercel.app</a>)</span>
                    </div>
                    <ul className="list-disc list-inside italic flex flex-row gap-4 text-sm pl-2 font-heading font-medium">
                        <li>Next.js</li>
                        <li>Tailwind</li>
                        <li>GraphQL</li>
                    </ul>
                    <p className="pl-2 font-medium text-sm md:text-md">
                        A tool to track and showcase Github Contributions with one line of code.
                    </p>
                </article>
                <article>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-md md:text-lg md:text-xl font-medium font-heading">E-Pustakalya</h3>
                        <a href="https://github.com/Param302/Library-Management-System/" target="_blank" rel="noopener noreferrer"><img src="github.svg" alt="Github" className="h-6 w-6"/></a>
                    </div>
                    <ul className="list-disc list-inside italic flex flex-row gap-4 text-sm pl-2 font-heading font-medium">
                        <li>Flask</li>
                        <li>RESTful API</li>
                        <li>JavaScript</li>
                    </ul>
                    <p className="pl-2 font-medium text-sm md:text-md">
                        An End to End Library Management System with RESTful APIs and minimal UI.
                    </p>
                </article>
                <article>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-lg md:text-xl font-medium font-heading">Heart Disease Predictor</h3>
                        <a href="https://github.com/Param302/Heart-Disease-predictor/" target="_blank" rel="noopener noreferrer"><img src="github.svg" alt="Github" className="h-6 w-6"/></a>
                    </div>
                    <ul className="list-disc list-inside italic flex flex-row gap-4 text-sm pl-2 font-heading font-medium">
                        <li>ANN</li>
                        <li>Tensorflow</li>
                        <li>Tkinter</li>
                    </ul>
                    <p className="pl-2 font-medium text-sm md:text-md">
                        A Desktop Application made using Artificial Neural Networks (98% acc).
                    </p>
                </article>
            </div>
        </section>
    )
};