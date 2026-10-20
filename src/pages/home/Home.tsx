import './Home.css';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';


export default function Home() {
  return (
    <main className="home">
        <Navbar />
        <h1 className="home__title">Laika</h1>
        <p className="home__tagline">Fetch your focus. Float through your week.</p>
        <Button size="lg" className="home__button" href="/signup">Get Started</Button>
    </main>
  );
}