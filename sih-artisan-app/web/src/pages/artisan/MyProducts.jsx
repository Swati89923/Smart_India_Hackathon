import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Eye, EyeOff, ExternalLink, Package } from "lucide-react";
import { Card, Badge, ProductImage, Spinner, Empty, useAsync, toast } from "../../components/ui";
import { useSession } from "../../session";
import { priceRange, craftLabel } from "../../constants";
import * as api from "../../api";

const STATUS = { published: ["Active", "green"], pending: ["Under review", "orange"], hidden: ["Hidden", "gray"] };

export default function MyProducts() {
  const { user } = useSession("artisan");
  const [q, setQ] = useState("");
  const { data, loading, setData } = useAsync(
    () => Promise.all([api.listProducts({ artisanId: user.id }), api.listEnquiries({ artisanId: user.id })]),
    [user.id]
  );
  if (loading || !data) return <Spinner />;
  const [products, enquiries] = data;
  const shown = products.filter((p) => [p.title, p.titleHi, p.category].some((f) => (f || "").toLowerCase().includes(q.toLowerCase())));

  const toggle = async (p) => {
    const status = p.status === "hidden" ? "published" : "hidden";
    await api.updateProduct(p.id, { status });
    setData(([ps, es]) => [ps.map((x) => (x.id === p.id ? { ...x, status } : x)), es]);
    toast(status === "hidden" ? "Product hidden from marketplace" : "Product is live again");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My Products <small>मेरे उत्पाद</small></h1>
          <p className="muted">{products.length} products in your storefront</p>
        </div>
        <Link to="/artisan/add" className="btn btn-primary"><PlusCircle size={16} /> Add Product</Link>
      </div>
      <Card>
        <div className="input-icon search-box"><Search size={16} /><input placeholder="Search your products…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {shown.length === 0 ? (
          <Empty icon={Package} title={products.length ? "No matches" : "No products yet"}>
            {!products.length && <Link to="/artisan/add" className="link">Add your first product</Link>}
          </Empty>
        ) : (
          <ul className="product-rows">
            {shown.map((p) => {
              const enq = enquiries.filter((e) => e.productId === p.id).length;
              const [label, tone] = STATUS[p.status || "published"] || STATUS.published;
              return (
                <li key={p.id}>
                  <ProductImage src={p.imageUrl} className="thumb-lg" alt="" />
                  <div className="grow">
                    <b>{p.title}</b>
                    <small className="hi muted">{p.titleHi}</small>
                    <span className="price">{priceRange(p)}</span>
                    <small className="muted">{p.views || 0} views · {enq} {enq === 1 ? "enquiry" : "enquiries"} · {craftLabel(p.craft)}</small>
                  </div>
                  <div className="row-actions">
                    <Badge tone={tone}>{label}</Badge>
                    <Link to={`/market/product/${p.id}`} className="icon-btn" title="View as buyer"><ExternalLink size={16} /></Link>
                    {p.status !== "pending" && (
                      <button className="icon-btn" title={p.status === "hidden" ? "Show on marketplace" : "Hide from marketplace"} onClick={() => toggle(p)}>
                        {p.status === "hidden" ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
