import Email from '@/app/components/Email';
import SocialHandles from './components/SocialHandles';
import About from '@/app/components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import CoCurricular from './components/CoCurricular';


export default function Home() {
    return (
        <main className="w-4/5 lg:w-3/5 2xl:w-2/5 flex flex-col space-y-8 relative">
            <Email/>
            <SocialHandles/>
            <About/>
            {/* <Experience/> */}
            <Projects/>
            <Education/>
            <CoCurricular/>
        </main>
    );
}
