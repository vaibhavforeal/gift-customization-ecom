import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="font-headline-md footer-brand">Kasturi</div>
      <div className="footer-links">
        <a href="#" className="footer-link">Sourcing</a>
        <a href="#" className="footer-link">Sustainability</a>
        <a href="#" className="footer-link">Artisan Stories</a>
        <a href="#" className="footer-link">Contact</a>
      </div>
      <div className="footer-copy">
        © 2026 Kasturi. Handcrafted with love in India.
      </div>
    </footer>
  );
}
