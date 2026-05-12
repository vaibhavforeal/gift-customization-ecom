import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import Footer from '../../components/Footer';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-bg">
            <img
              alt="Artisanal Gift Hamper"
              className="hero-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSmqDIcBPj0esdTUD_aFAIZidGfKP0ghJ1f6aThZthzC3ip5RI1cnipV93IrBmTapSxZ-i5zzhMup5IkoyHmPbjIH08PvPMmI_UgvN_S6tWYR2_eZU3e1GAfYjYAWBDJhgM0MRcChQh70GcdHRriybyxrUfPPLqdsqIbE1ccP6U4atWrEwu5bW6jCbJtbFPOLOC9HeKekd-BwKc_2PCTxqpLGdyk8k8o3uUziTruELx411_vQy6OEmosQWCxpzPI7z9D-5xOojDjgG"
            />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <h1 className="font-display-lg-mobile hero-title">
              Handcrafted gifts for life's biggest moments.
            </h1>
            <p className="font-body-lg hero-subtitle">
              Curated hampers for pre-wedding, house-warming, and festivals.
            </p>
            <button
              onClick={() => navigate('/build')}
              className="hero-cta"
            >
              Build your hamper
            </button>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
