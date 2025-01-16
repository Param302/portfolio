import About from '@/app/components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';


export default function Home() {
    return (
        <main className="w-2/5 flex flex-col space-y-12">
            <About/>
            {/* <Experience/> */}
            <Projects/>
        </main>
    );
}
