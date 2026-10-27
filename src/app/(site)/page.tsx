import About from "@/components/home/About";
import BestSellers from "@/components/home/BestSellers";
import Hero from "@/components/home/Hero";

const Home = () => {
    return (
        <main>
            <Hero />
            <BestSellers />
            <About />
        </main>
    );
}

export default Home;
