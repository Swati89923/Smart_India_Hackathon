import { Link } from "react-router-dom";
import {
  Camera, Sparkles, Mic, FileText, IndianRupee, Store, Handshake, ArrowRight, HeartHandshake,
  Landmark, Leaf, Globe2, Users, ShieldCheck, BarChart3,
} from "lucide-react";
import { Logo, Button, ProductImage, OfflinePill, useAsync } from "../components/ui";
import * as api from "../api";
import { priceRange } from "../constants";

const HERO = "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1400&auto=format&fit=crop&q=80";

const STEPS = [
  { icon: Camera, en: "Capture", hi: "फ़ोटो लें", text: "Snap a photo of your product" },
  { icon: Sparkles, en: "Enhance", hi: "सुधारें", text: "AI fixes lighting & framing" },
  { icon: Mic, en: "Speak", hi: "बोलें", text: "Describe it in your language" },
  { icon: FileText, en: "Catalogue", hi: "विवरण", text: "Bilingual listing auto-written" },
  { icon: IndianRupee, en: "Price", hi: "मूल्य", text: "Fair price, transparent formula" },
  { icon: Store, en: "Publish", hi: "प्रकाशित", text: "Live on your storefront" },
  { icon: Handshake, en: "Connect", hi: "जुड़ें", text: "Negotiate with verified buyers" },
];

const PERSONAS = [
  { role: "artisan", title: "Artisan", hi: "कारीगर", quote: "I create, AI helps me share with the world.", icon: HeartHandshake, cta: "Start selling", to: "/login?role=artisan&mode=register", tone: "orange" },
  { role: "buyer", title: "Buyer", hi: "खरीदार", quote: "Discover authentic crafts. Support real artisans.", icon: Globe2, cta: "Browse marketplace", to: "/market", tone: "blue" },
  { role: "admin", title: "Admin", hi: "प्रशासक", quote: "Monitor growth. Enable impact.", icon: BarChart3, cta: "Admin login", to: "/login?role=admin", tone: "green" },
];

export default function Landing() {
  const { data: products } = useAsync(() => api.listProducts(), []);

  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav className="hide-sm">
          <a href="#how">How it works</a>
          <Link to="/market">Marketplace</Link>
          <a href="#about">About</a>
        </nav>
        <div className="topbar-right">
          <OfflinePill />
          <Button as="link" to="/login" variant="primary" size="sm">Login</Button>
          <Button as="link" to="/login?mode=register" variant="outline" size="sm" className="hide-sm">Register</Button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Smart India Hackathon 2026 · SIH26090</span>
          <h1>Traditional Crafts,<br /><em>Global Opportunities</em></h1>
          <p className="hero-hi">परंपरा से दुनिया तक — आसानी से</p>
          <p>
            An AI-powered digital business manager for India&apos;s artisans. Just click a photo and speak in your language —
            ShilpSaathi writes the catalogue, suggests a fair price and connects you directly with verified buyers.
          </p>
          <div className="hero-cta">
            <Button as="link" to="/login?role=artisan" size="lg" icon={ArrowRight}>Login</Button>
            <Button as="link" to="/login?role=artisan&mode=register" size="lg" variant="outline">Register as Artisan</Button>
          </div>
          <div className="hero-trust">
            <span><ShieldCheck size={16} /> Pehchan ID verified</span>
            <span><Landmark size={16} /> PM Vishwakarma aligned</span>
            <span><Globe2 size={16} /> ONDC ready</span>
          </div>
        </div>
        <div className="hero-art">
          <ProductImage src={HERO} alt="Artisan shaping clay on a potter's wheel" className="hero-img" />
          <div className="hero-float hero-float-a"><Sparkles size={16} /> AI Enhanced photo</div>
          <div className="hero-float hero-float-b"><Mic size={16} /> “यह हाथ से बना फूलदान है…”</div>
          <div className="hero-float hero-float-c"><IndianRupee size={16} /> Suggested ₹700 – ₹950</div>
        </div>
      </section>

      <section className="personas">
        {PERSONAS.map((p) => (
          <Link key={p.role} to={p.to} className={`persona persona-${p.tone}`}>
            <span className="persona-icon"><p.icon size={22} /></span>
            <h3>{p.title} <small>{p.hi}</small></h3>
            <p>“{p.quote}”</p>
            <span className="persona-cta">{p.cta} <ArrowRight size={15} /></span>
          </Link>
        ))}
      </section>

      <section id="how" className="how">
        <h2>From workshop to world in 7 simple steps</h2>
        <p className="muted">Just Click. Just Speak. AI Handles the Rest.</p>
        <ol className="steps-row">
          {STEPS.map((s, i) => (
            <li key={s.en}>
              <span className="step-num">{i + 1}</span>
              <s.icon size={22} />
              <b>{s.en}</b>
              <small className="hi">{s.hi}</small>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {products?.length > 0 && (
        <section className="featured">
          <div className="section-head">
            <h2>Fresh from artisan workshops</h2>
            <Link to="/market/products" className="link">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid-products">
            {products.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/market/product/${p.id}`} className="pcard">
                <ProductImage src={p.imageUrl} alt={p.title} className="pcard-img" />
                <div className="pcard-body">
                  <b>{p.title}</b>
                  <small>{p.artisanName} · {p.artisanLocation}</small>
                  <span className="price">{priceRange(p)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="about" className="pillars">
        <div><HeartHandshake size={22} /><b>Empower Artisans</b><span>Artisans keep full control of price & deals</span></div>
        <div><Landmark size={22} /><b>Preserve Culture</b><span>Every listing tells the craft&apos;s story</span></div>
        <div><Leaf size={22} /><b>Sustainable Livelihoods</b><span>Fair, explainable pricing — no under-selling</span></div>
        <div><Users size={22} /><b>Inclusive Digital India</b><span>Voice-first, 12 Indian languages</span></div>
      </section>

      <footer className="site-footer">
        <span>ShilpSaathi · Team CODESPHERE · SIH 2026</span>
        <span>“Small Hands. Big Heritage. A Larger Tomorrow.”</span>
      </footer>
    </div>
  );
}
