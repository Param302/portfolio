export default function Education() {
    return (
        <section id="education" className="flex flex-col md:space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium font-heading">Education</h2>
            <div>
                <article className="flex flex-col -space-y-1">
                    <h3 className="text-lg md:text-xl font-medium font-heading">Bachelor of Science in Data Science & Applications</h3>
                    <p className="text-sm md:text-lg font-medium">Indian Institute of Technology Madras</p>
                    <div className="flex flex-row space-x-2 font-medium text-sm md:text-md">
                        <p>2022 - Present</p>
                        <span>•</span>
                        <p>CGPA: 8.3</p>
                    </div>
                </article>
            </div>
        </section>
    )
};