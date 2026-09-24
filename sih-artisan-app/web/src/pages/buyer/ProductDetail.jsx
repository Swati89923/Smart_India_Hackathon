import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, MapPin, MessageCircle, PackagePlus, ShieldCheck, Store, CalendarDays, Package } from "lucide-react";
import { Card, Button, Badge, Field, Modal, ProductImage, Spinner, Empty, useAsync, toast } from "../../components/ui";
import { useSession } from "../../session";
import { priceRange, craftLabel, inr } from "../../constants";
import { ProductCard } from "./Marketplace";
import * as api from "../../api";

const buyerLabel = (b) => (b.companyName ? `${b.name} (${b.companyName})` : b.name);

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: buyer } = useSession("buyer");
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { data, loading, error } = useAsync(async () => {
    const p = await api.getProduct(id);
    const more = await api.listProducts({ artisanId: p.artisanId });
    return [p, more.filter((x) => x.id !== p.id && (x.status || "published") === "published")];
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !data) return <div className="page"><Card><Empty icon={Package} title="Product not found" /></Card></div>;
  const [p, more] = data;

  const requireBuyer = (path) => {
    if (!buyer) {
      navigate(`/login?role=buyer&next=${encodeURIComponent(path)}`);
      return false;
    }
    return true;
  };

  const contact = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const enq = await api.createEnquiry({
        productId: p.id, artisanId: p.artisanId, buyerId: buyer.id, buyerName: buyerLabel(buyer), buyerType: buyer.buyerType,
        buyerPhone: buyer.phone, productTitle: p.title, quantity: 1, askingPrice: p.price,
        initialMessage: message || `Hello! I'm interested in your ${p.title}.`,
      });
      toast("Message sent to artisan", "blue");
      navigate(`/buyer/chats/${enq.id}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
      <Card className="pdp">
        <div className="pdp-media">
          <ProductImage src={p.imageUrl} alt={p.title} className="pdp-img" />
        </div>
        <div className="pdp-info">
          <h1>{p.title}</h1>
          <p className="hi muted">{p.titleHi}</p>
          <Link to={`/market/artisan/${p.artisanId}`} className="pdp-artisan">
            by <b>{p.artisanName}</b> {p.kycVerified && <BadgeCheck size={15} className="green" />} · <MapPin size={13} /> {p.artisanLocation}
          </Link>
          <b className="price-big blue">{priceRange(p)}</b>
          <p>{p.description}</p>
          {p.descriptionHi && <p className="hi muted small">{p.descriptionHi}</p>}
          <div className="chip-row">
            <Badge tone="blue">{craftLabel(p.craft)}</Badge>
            {p.category && <Badge tone="blue">{p.category}</Badge>}
            {p.material && <Badge tone="gray">{p.material}</Badge>}
          </div>
          <ul className="facts">
            <li><ShieldCheck size={15} className="green" /> Pehchan ID: {p.pehchanId}</li>
            <li><Store size={15} /> Direct from artisan — no middlemen</li>
          </ul>
          <div className="action-row">
            <Button variant="outline-blue" icon={MessageCircle} onClick={() => requireBuyer(`/market/product/${p.id}`) && setContactOpen(true)}>Contact Artisan</Button>
            <Button variant="blue" icon={PackagePlus} onClick={() => requireBuyer(`/market/product/${p.id}/bulk`) && navigate(`/market/product/${p.id}/bulk`)}>Request Bulk Order</Button>
          </div>
        </div>
      </Card>

      {more.length > 0 && (
        <section>
          <div className="section-head"><h2>More from {p.artisanName}</h2></div>
          <div className="grid-products">{more.slice(0, 4).map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title={`Message ${p.artisanName}`}>
        <form onSubmit={contact} className="stack">
          <Field label="Your message">
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Hello! I'm interested in your ${p.title}. Is it available in other colours?`} autoFocus />
          </Field>
          <Button type="submit" variant="blue" loading={sending} className="btn-block">Send Message</Button>
        </form>
      </Modal>
    </div>
  );
}

export function BulkEnquiry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: buyer } = useSession("buyer");
  const { data: p, loading } = useAsync(() => api.getProduct(id), [id]);
  const [form, setForm] = useState({ quantity: 100, budgetMin: "", budgetMax: "", requiredBy: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading || !p) return <Spinner />;
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault();
    const lo = Number(form.budgetMin) || null;
    const hi = Number(form.budgetMax) || lo;
    setBusy(true);
    try {
      const budget = lo ? ` Budget: ₹${lo}${hi && hi !== lo ? `–₹${hi}` : ""} per unit.` : "";
      const by = form.requiredBy ? ` Required by ${new Date(form.requiredBy).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.` : "";
      const enq = await api.createEnquiry({
        productId: p.id, artisanId: p.artisanId, buyerId: buyer.id, buyerName: buyerLabel(buyer), buyerType: buyer.buyerType,
        buyerPhone: buyer.phone, productTitle: p.title, quantity: Number(form.quantity), askingPrice: p.price,
        initialOfferPrice: lo, budgetMin: lo, budgetMax: hi, requiredBy: form.requiredBy || null,
        initialMessage: `${form.message || `We would like to order ${form.quantity} units of ${p.title}.`}${budget}${by}`,
      });
      toast("Enquiry sent! The artisan will respond soon.", "blue");
      navigate(`/buyer/chats/${enq.id}`);
    } catch (err) {
      toast(err.message, "red");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page narrow">
      <Link to={`/market/product/${p.id}`} className="back-link"><ArrowLeft size={15} /> Back to product</Link>
      <Card>
        <h1 className="card-title-lg">Request Bulk Order</h1>
        <div className="mini-product">
          <ProductImage src={p.imageUrl} className="thumb" alt="" />
          <div>
            <b>{p.title}</b>
            <small className="muted">{p.artisanName} · listed at {priceRange(p)}</small>
          </div>
        </div>
        <form onSubmit={submit} className="stack">
          <Field label="Quantity"><input type="number" min="1" value={form.quantity} onChange={set("quantity")} required /></Field>
          <div className="grid-2">
            <Field label="Budget (per unit) — from"><div className="input-prefix"><span>₹</span><input type="number" min="1" value={form.budgetMin} onChange={set("budgetMin")} placeholder="800" /></div></Field>
            <Field label="to"><div className="input-prefix"><span>₹</span><input type="number" min="1" value={form.budgetMax} onChange={set("budgetMax")} placeholder="900" /></div></Field>
          </div>
          <Field label={<><CalendarDays size={13} /> Required By</>}><input type="date" min={minDate} value={form.requiredBy} onChange={set("requiredBy")} /></Field>
          <Field label="Message"><textarea rows={3} value={form.message} onChange={set("message")} placeholder="Needed for corporate gifting. Please share availability and customization options." /></Field>
          {form.budgetMin && <p className="small muted">Estimated order value: <b>{inr(Number(form.budgetMin) * Number(form.quantity))}{form.budgetMax ? ` – ${inr(Number(form.budgetMax) * Number(form.quantity))}` : ""}</b></p>}
          <Button type="submit" variant="blue" loading={busy} className="btn-block">Send Enquiry</Button>
        </form>
      </Card>
    </div>
  );
}
