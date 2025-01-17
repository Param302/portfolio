import About from '@/app/components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import CoCurricular from './components/CoCurricular';


export default function Home() {
    return (
        <main className="w-2/5 flex flex-col space-y-8">
            <About/>
            {/* <Experience/> */}
            <Projects/>
            <Education/>
            <CoCurricular/>
        </main>
    );
}
