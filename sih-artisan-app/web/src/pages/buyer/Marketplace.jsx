import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Heart, BadgeCheck, MapPin, SlidersHorizontal, Package, ArrowRight, MoreHorizontal } from "lucide-react";
import { Card, ProductImage, Spinner, Empty, useAsync, Avatar } from "../../components/ui";
import { CRAFTS, priceRange, craftLabel } from "../../constants";
import * as api from "../../api";

const HERO = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=70";

// Wishlist is a per-viewer convenience → browser storage is fine here
const WISH_KEY = "shilpsaathi.wishlist";
const readWish = () => { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } };
export function useWishlist() {
  const [ids, setIds] = useState(readWish);
  const toggle = (id) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    setIds(next);
    try { localStorage.setItem(WISH_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  return { ids, toggle };
}

export function ProductCard({ p, wish }) {
  return (
    <Link to={`/market/product/${p.id}`} className="pcard">
      <div className="pcard-media">
        <ProductImage src={p.imageUrl} alt={p.title} className="pcard-img" />
        {wish && (
          <button className={`wish ${wish.ids.includes(p.id) ? "on" : ""}`} aria-label="Save to wishlist"
            onClick={(e) => { e.preventDefault(); wish.toggle(p.id); }}>
            <Heart size={16} />
          </button>
        )}
      </div>
      <div className="pcard-body">
        <b>{p.title}</b>
        <small>{p.kycVerified && <BadgeCheck size={13} className="green" />} {p.artisanName} · {p.artisanLocation?.split(",")[0]}</small>
        <span className="price">{priceRange(p)}</span>
      </div>
    </Link>
  );
}

export function MarketHome() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const wish = useWishlist();
  const { data: products, loading } = useAsync(() => api.listProducts(), []);

  const artisans = useMemo(() => {
    const m = new Map();
    (products || []).forEach((p) => !m.has(p.artisanId) && m.set(p.artisanId, p));
    return [...m.values()].slice(0, 6);
  }, [products]);

  return (
    <div className="market">
      <section className="market-hero">
        <ProductImage src={HERO} alt="" className="market-hero-img" />
        <div className="market-hero-text">
          <h1>Authentic Indian Crafts</h1>
          <p>From Local Hands to Global Homes · सीधे कारीगरों से</p>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/market/products?q=${encodeURIComponent(q)}`); }}>
            <Search size={18} />
            <input placeholder="Search for products, artisans or crafts…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-blue btn-sm">Search</button>
          </form>
        </div>
      </section>

      <section className="cat-row">
        {CRAFTS.map((c) => (
          <Link key={c.key} to={`/market/products?craft=${c.key}`} className="cat">
            <span>{c.emoji}</span>
            <small>{c.en}</small>
          </Link>
        ))}
        <Link to="/market/products" className="cat"><span><MoreHorizontal size={22} /></span><small>More</small></Link>
      </section>

      <section>
        <div className="section-head">
          <h2>Trending crafts</h2>
          <Link to="/market/products" className="link">View all <ArrowRight size={14} /></Link>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid-products">
            {(products || []).slice(0, 8).map((p) => <ProductCard key={p.id} p={p} wish={wish} />)}
          </div>
        )}
      </section>

      {artisans.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Meet the artisans</h2>
            <Link to="/market/artisans" className="link">All artisans <ArrowRight size={14} /></Link>
          </div>
          <div className="artisan-row">
            {artisans.map((p) => (
              <Link key={p.artisanId} to={`/market/artisan/${p.artisanId}`} className="artisan-chip">
                <Avatar name={p.artisanName} size={48} />
                <b>{p.artisanName} {p.kycVerified && <BadgeCheck size={14} className="green" />}</b>
                <small><MapPin size={12} /> {p.artisanLocation}</small>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const PRICE_BANDS = [
  { v: "", label: "Any price" },
  { v: "0-500", label: "Under ₹500" },
  { v: "500-1000", label: "₹500 – ₹1,000" },
  { v: "1000-2500", label: "₹1,000 – ₹2,500" },
  { v: "2500-100000", label: "Above ₹2,500" },
];

export function ProductList() {
  const [params, setParams] = useSearchParams();
  const wish = useWishlist();
  const craft = params.get("craft") || "all";
  const q = params.get("q") || "";
  const [state, setState] = useState("");
  const [band, setBand] = useState("");
  const [material, setMaterial] = useState("");
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState("popular");
  const { data: products, loading } = useAsync(() => api.listProducts({ craft, search: q }), [craft, q]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v && v !== "all") next.set(k, v);
    else next.delete(k);
    setParams(next);
  };

  const states = useMemo(() => [...new Set((products || []).map((p) => p.artisanState || p.artisanLocation?.split(",").pop().trim()).filter(Boolean))].sort(), [products]);
  const materials = useMemo(() => [...new Set((products || []).flatMap((p) => (p.material || "").split(",").map((m) => m.trim()).filter(Boolean)))].sort(), [products]);

  const shown = (products || [])
    .filter((p) => !state || (p.artisanState || p.artisanLocation || "").includes(state))
    .filter((p) => {
      if (!band) return true;
      const [lo, hi] = band.split("-").map(Number);
      return p.price >= lo && p.price < hi;
    })
    .filter((p) => !material || (p.material || "").toLowerCase().includes(material.toLowerCase()))
    .filter((p) => !verified || p.kycVerified)
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "new" ? new Date(b.createdAt) - new Date(a.createdAt) : (b.views || 0) - (a.views || 0)));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{q ? `Results for “${q}”` : craft !== "all" ? craftLabel(craft) : "All Products"}</h1>
          <p className="muted">{shown.length} handcrafted products from verified artisans</p>
        </div>
      </div>
      <div className="filter-bar">
        <SlidersHorizontal size={16} />
        <select value={craft} onChange={(e) => setParam("craft", e.target.value)} aria-label="Category">
          <option value="all">Category</option>
          {CRAFTS.map((c) => <option key={c.key} value={c.key}>{c.en}</option>)}
        </select>
        <select value={state} onChange={(e) => setState(e.target.value)} aria-label="State">
          <option value="">State</option>
          {states.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={band} onChange={(e) => setBand(e.target.value)} aria-label="Price">
          {PRICE_BANDS.map((b) => <option key={b.v} value={b.v}>{b.v ? b.label : "Price"}</option>)}
        </select>
        <select value={material} onChange={(e) => setMaterial(e.target.value)} aria-label="Material">
          <option value="">Material</option>
          {materials.map((m) => <option key={m}>{m}</option>)}
        </select>
        <label className="check"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> Verified only</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="push-right">
          <option value="popular">Most viewed</option>
          <option value="new">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
        {q && <button className="chip active" onClick={() => setParam("q", "")}>“{q}” ✕</button>}
      </div>
      {loading ? <Spinner /> : shown.length === 0 ? (
        <Card><Empty icon={Package} title="No products match these filters">Try removing a filter.</Empty></Card>
      ) : (
        <div className="grid-products">{shown.map((p) => <ProductCard key={p.id} p={p} wish={wish} />)}</div>
      )}
    </div>
  );
}

export function ArtisanDirectory() {
  const { data: products, loading } = useAsync(() => api.listProducts(), []);
  if (loading) return <Spinner />;
  const m = new Map();
  (products || []).forEach((p) => {
    const a = m.get(p.artisanId) || { ...p, count: 0 };
    a.count++;
    m.set(p.artisanId, a);
  });
  return (
    <div className="page">
      <div className="page-head"><h1>Artisans <small>कारीगर</small></h1></div>
      <div className="grid-artisans">
        {[...m.values()].map((a) => (
          <Link key={a.artisanId} to={`/market/artisan/${a.artisanId}`} className="card artisan-card">
            <Avatar name={a.artisanName} size={56} />
            <b>{a.artisanName} {a.kycVerified && <BadgeCheck size={14} className="green" />}</b>
            <small className="muted"><MapPin size={12} /> {a.artisanLocation}</small>
            <small>{craftLabel(a.craft)} · {a.count} products</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
