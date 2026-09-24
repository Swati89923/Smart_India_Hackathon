import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Package, Inbox, Languages, Search, Check, Ban, Eye, EyeOff, Download, Plus, X, Megaphone,
  Tags, FileBarChart, LifeBuoy, IndianRupee, Handshake, ArrowRight,
} from "lucide-react";
import { Card, Stat, Badge, Button, Field, ProductImage, Spinner, Empty, useAsync, toast } from "../../components/ui";
import { LineChart, Donut, BarList } from "../../components/Charts";
import { craftLabel, inr, timeAgo } from "../../constants";
import * as api from "../../api";

const ARTISAN_STATUS = { active: ["Active", "green"], pending: ["Pending", "orange"], suspended: ["Suspended", "red"] };
const PRODUCT_STATUS = { published: ["Active", "green"], pending: ["Pending", "orange"], hidden: ["Hidden", "gray"] };

const craftData = (rows) => rows.map((r) => ({ name: craftLabel(r.name), value: r.value }));

export function AdminOverview() {
  const { data, loading } = useAsync(() => Promise.all([api.adminOverview(), api.adminArtisans()]), []);
  if (loading || !data) return <Spinner />;
  const [o, artisans] = data;
  const t = o.totals;
  const pending = artisans.filter((a) => a.status === "pending");

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Platform Overview</h1>
          <p className="muted">Live numbers from the ShilpSaathi marketplace</p>
        </div>
      </div>
      <div className="stats-row">
        <Stat value={t.artisans.toLocaleString("en-IN")} label="Registered Artisans" tone="blue" icon={Users} />
        <Stat value={t.activeProducts.toLocaleString("en-IN")} label="Active Products" tone="green" icon={Package} />
        <Stat value={t.enquiries.toLocaleString("en-IN")} label={`B2B Enquiries · ${t.dealsClosed} closed`} tone="orange" icon={Inbox} />
        <Stat value={t.languages} label="Languages" tone="purple" icon={Languages} />
      </div>
      <div className="grid-2-1 gap-lg">
        <Card>
          <h3 className="card-title">Platform Growth</h3>
          <LineChart data={o.growth} series={[{ key: "artisans", label: "Artisans", color: "#2F6FD6" }, { key: "products", label: "Products", color: "#2F9E5B" }]} />
        </Card>
        <Card>
          <h3 className="card-title">Artisans by State</h3>
          <BarList data={o.artisansByState} />
        </Card>
      </div>
      <div className="grid-2 gap-lg">
        <Card>
          <div className="card-head">
            <h3 className="card-title">Awaiting verification</h3>
            <Link className="link small" to="/admin/artisans">Manage <ArrowRight size={13} /></Link>
          </div>
          {pending.length === 0 ? <Empty icon={Check} title="All artisans verified" /> : (
            <ul className="list">
              {pending.map((a) => (
                <li key={a.id} className="list-row">
                  <div className="grow"><b>{a.name}</b><small>{craftLabel(a.craft)} · {a.location} · joined {timeAgo(a.createdAt)}</small></div>
                  <Badge tone="orange">Pending</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="card-title">Marketplace impact</h3>
          <div className="impact">
            <div><IndianRupee size={18} /><b>{inr(t.gmv)}</b><span>Deal value closed</span></div>
            <div><Handshake size={18} /><b>{t.dealsClosed}</b><span>Direct deals, zero middlemen</span></div>
            <div><Users size={18} /><b>{t.buyers}</b><span>Registered buyers</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function downloadCsv(name, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AdminArtisans() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, setData } = useAsync(() => api.adminArtisans(), []);
  if (loading || !data) return <Spinner />;
  const rows = data.filter((a) => (!status || a.status === status) && [a.name, a.location, a.craft].some((f) => (f || "").toLowerCase().includes(q.toLowerCase())));

  const setArtisanStatus = async (a, s) => {
    const u = await api.adminUpdateArtisan(a.id, s);
    setData((list) => list.map((x) => (x.id === a.id ? { ...x, ...u, status: s } : x)));
    toast(`${a.name} is now ${s}`, s === "active" ? "green" : "gray");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Manage Artisans</h1><p className="muted">{data.length} registered · {data.filter((a) => a.status === "pending").length} pending verification</p></div>
        <Button variant="outline" icon={Download} onClick={() => downloadCsv("artisans.csv", data.map(({ id, name, phone, craft, location, state, pehchanId, status, productCount }) => ({ id, name, phone, craft, location, state, pehchanId, status, productCount })))}>Export CSV</Button>
      </div>
      <Card>
        <div className="table-tools">
          <div className="input-icon search-box"><Search size={16} /><input placeholder="Search name, location, craft…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
            <option value="">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Location</th><th>Craft</th><th>Pehchan ID</th><th>Products</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((a) => {
                const [label, tone] = ARTISAN_STATUS[a.status] || ARTISAN_STATUS.pending;
                return (
                  <tr key={a.id}>
                    <td><b>{a.name}</b><small className="muted block">{a.phone}</small></td>
                    <td>{a.location || "—"}</td>
                    <td>{craftLabel(a.craft)}</td>
                    <td className="mono">{a.pehchanId || "—"}</td>
                    <td>{a.productCount}</td>
                    <td><Badge tone={tone}>{label}</Badge></td>
                    <td className="right nowrap">
                      {a.status !== "active" && <Button size="sm" variant="outline" icon={Check} onClick={() => setArtisanStatus(a, "active")}>Approve</Button>}
                      {a.status === "active" && <Button size="sm" variant="outline-red" icon={Ban} onClick={() => setArtisanStatus(a, "suspended")}>Suspend</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <Empty icon={Users} title="No artisans match" />}
        </div>
      </Card>
    </div>
  );
}

export function AdminProducts() {
  const [q, setQ] = useState("");
  const { data, loading, setData } = useAsync(() => api.adminProducts(), []);
  if (loading || !data) return <Spinner />;
  const rows = data.filter((p) => [p.title, p.artisanName, p.craft].some((f) => (f || "").toLowerCase().includes(q.toLowerCase())));
  const setStatus = async (p, s) => {
    await api.adminUpdateProduct(p.id, s);
    setData((list) => list.map((x) => (x.id === p.id ? { ...x, status: s } : x)));
    toast(s === "published" ? "Product approved & live" : "Product hidden", s === "published" ? "green" : "gray");
  };
  return (
    <div className="page">
      <div className="page-head"><div><h1>Manage Products</h1><p className="muted">{data.length} products · {data.filter((p) => p.status === "pending").length} awaiting review</p></div></div>
      <Card>
        <div className="table-tools">
          <div className="input-icon search-box"><Search size={16} /><input placeholder="Search products or artisans…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Craft</th><th>Artisan</th><th>Price</th><th>Views</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((p) => {
                const [label, tone] = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.published;
                return (
                  <tr key={p.id}>
                    <td><div className="cell-product"><ProductImage src={p.imageUrl} className="thumb-sm" alt="" /><b>{p.title}</b></div></td>
                    <td>{craftLabel(p.craft)}</td>
                    <td>{p.artisanName}<small className="muted block">{p.artisanState}</small></td>
                    <td>{inr(p.price)}</td>
                    <td>{p.views || 0}</td>
                    <td><Badge tone={tone}>{label}</Badge></td>
                    <td className="right nowrap">
                      {p.status !== "published" ? (
                        <Button size="sm" variant="outline" icon={Eye} onClick={() => setStatus(p, "published")}>Approve</Button>
                      ) : (
                        <Button size="sm" variant="outline-red" icon={EyeOff} onClick={() => setStatus(p, "hidden")}>Hide</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <Empty icon={Package} title="No products match" />}
        </div>
      </Card>
    </div>
  );
}

export function AdminAnalytics() {
  const { data, loading } = useAsync(() => Promise.all([api.adminOverview(), api.listEnquiries()]), []);
  if (loading || !data) return <Spinner />;
  const [o, enquiries] = data;
  const funnel = [
    { name: "New", value: enquiries.filter((e) => e.status === "open").length },
    { name: "In discussion", value: enquiries.filter((e) => e.status === "negotiating").length },
    { name: "Accepted", value: enquiries.filter((e) => e.status === "accepted").length },
    { name: "Confirmed", value: enquiries.filter((e) => e.status === "deal_closed").length },
    { name: "Declined", value: enquiries.filter((e) => e.status === "declined").length },
  ];
  return (
    <div className="page">
      <div className="page-head"><div><h1>Analytics &amp; Impact</h1><p className="muted">How crafts, regions and deals are performing</p></div></div>
      <div className="grid-2 gap-lg">
        <Card>
          <h3 className="card-title">Top Craft Categories</h3>
          <Donut data={craftData(o.productsByCraft)} label="Products by craft category" />
        </Card>
        <Card>
          <h3 className="card-title">Artisans by State</h3>
          <BarList data={o.artisansByState} />
        </Card>
        <Card>
          <h3 className="card-title">Enquiry pipeline</h3>
          <BarList data={funnel} color="#E7892F" />
        </Card>
        <Card>
          <h3 className="card-title">Growth (cumulative)</h3>
          <LineChart data={o.growth} series={[{ key: "artisans", label: "Artisans", color: "#2F6FD6" }, { key: "products", label: "Products", color: "#2F9E5B" }]} height={160} />
        </Card>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const { data, loading, setData } = useAsync(() => api.getSettings(), []);
  const [newCat, setNewCat] = useState("");
  const [saving, setSaving] = useState(false);
  if (loading || !data) return <Spinner />;

  const save = async (patch) => {
    setSaving(true);
    try {
      const s = await api.saveSettings(patch);
      setData({ ...data, ...s });
      toast("Settings saved");
    } finally {
      setSaving(false);
    }
  };
  const addCat = (e) => {
    e.preventDefault();
    if (!newCat.trim() || data.categories.includes(newCat.trim())) return;
    save({ categories: [...data.categories, newCat.trim()] });
    setNewCat("");
  };

  return (
    <div className="page">
      <div className="page-head"><h1>Settings &amp; Content</h1></div>
      <div className="grid-2 gap-lg">
        <Card>
          <h3 className="card-title"><Tags size={16} /> Manage Categories</h3>
          <div className="chip-row">
            {data.categories.map((c) => (
              <span key={c} className="chip">{c}
                <button aria-label={`Remove ${c}`} onClick={() => save({ categories: data.categories.filter((x) => x !== c) })}><X size={12} /></button>
              </span>
            ))}
          </div>
          <form onSubmit={addCat} className="row-gap">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Bamboo & Cane" />
            <Button type="submit" variant="outline" icon={Plus}>Add</Button>
          </form>
        </Card>
        <Card>
          <h3 className="card-title"><Megaphone size={16} /> Platform Announcement</h3>
          <Field hint="Shown on every artisan's dashboard">
            <textarea rows={3} value={data.announcement} onChange={(e) => setData({ ...data, announcement: e.target.value })} />
          </Field>
          <Button loading={saving} onClick={() => save({ announcement: data.announcement })}>Publish announcement</Button>
        </Card>
        <Card>
          <h3 className="card-title"><FileBarChart size={16} /> Reports</h3>
          <p className="small muted">Download current platform data as CSV.</p>
          <div className="row-gap">
            <Button variant="outline" icon={Download} onClick={async () => downloadCsv("artisans.csv", (await api.adminArtisans()).map(({ name, phone, craft, location, status, productCount }) => ({ name, phone, craft, location, status, productCount })))}>Artisans</Button>
            <Button variant="outline" icon={Download} onClick={async () => downloadCsv("products.csv", (await api.adminProducts()).map(({ title, craft, artisanName, price, views, status }) => ({ title, craft, artisanName, price, views, status })))}>Products</Button>
            <Button variant="outline" icon={Download} onClick={async () => downloadCsv("enquiries.csv", (await api.listEnquiries()).map(({ productTitle, buyerName, quantity, askingPrice, finalPrice, status }) => ({ productTitle, buyerName, quantity, askingPrice, finalPrice, status })))}>Enquiries</Button>
          </div>
        </Card>
        <Card>
          <h3 className="card-title"><LifeBuoy size={16} /> User Support</h3>
          <p className="small muted">Artisans can reach the helpline in their language. Demo admin credentials: <span className="mono">admin@shilpsaathi.gov.in / admin123</span> (set ADMIN_EMAIL / ADMIN_PASSWORD in backend .env to change).</p>
        </Card>
      </div>
    </div>
  );
}
