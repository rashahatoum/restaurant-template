import About from "@/components/home/About";
import BestSellers from "@/components/home/BestSellers";
import Hero from "@/components/home/Hero";
import Offers from "@/components/home/Offers";

const Home = () => {
    return (
        <main>
            <Hero />
            <BestSellers />
            <Offers />
            <About />
        </main>
    );
}

export default Home;
