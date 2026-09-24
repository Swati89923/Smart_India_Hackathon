import { Link } from "react-router-dom";
import { PlusCircle, MessageSquareText, UserPen, HelpCircle, Package, Eye, Inbox, Clock, Megaphone, ArrowRight, Sparkles } from "lucide-react";
import { Card, Stat, Badge, ProductImage, Spinner, useAsync, Empty } from "../../components/ui";
import { useSession } from "../../session";
import { ENQUIRY_STATUS, inr, priceRange, timeAgo } from "../../constants";
import * as api from "../../api";

export const needsReply = (e) =>
  (e.status === "open" || e.status === "negotiating") && e.thread?.[e.thread.length - 1]?.sender === "buyer";

export default function ArtisanDashboard() {
  const { user } = useSession("artisan");
  const { data, loading } = useAsync(
    () =>
      Promise.all([
        api.listProducts({ artisanId: user.id }),
        api.listEnquiries({ artisanId: user.id }),
        api.getSettings().catch(() => null),
      ]),
    [user.id]
  );

  if (loading || !data) return <Spinner />;
  const [products, enquiries, settings] = data;
  const views = products.reduce((s, p) => s + (p.views || 0), 0);
  const pending = enquiries.filter(needsReply);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Welcome, {user.name?.split(" ")[0] || "Artisan"}! 👋</h1>
          <p className="muted">नमस्ते! Here&apos;s how your craft business is doing.</p>
        </div>
        <Link to="/artisan/add" className="btn btn-primary"><PlusCircle size={16} /> Add Product</Link>
      </div>

      {settings?.announcement && (
        <div className="announce"><Megaphone size={16} /> {settings.announcement}</div>
      )}

      <div className="stats-row">
        <Stat value={products.length} label="Products" tone="green" icon={Package} />
        <Stat value={views.toLocaleString("en-IN")} label="Views" tone="blue" icon={Eye} />
        <Stat value={enquiries.length} label="Enquiries" tone="orange" icon={Inbox} />
        <Stat value={pending.length} label="Pending" tone="red" icon={Clock} />
      </div>

      <Card>
        <h3 className="card-title">Quick Actions <small>त्वरित कार्य</small></h3>
        <div className="quick-actions">
          <Link to="/artisan/add" className="qa qa-green"><PlusCircle size={22} /><span>Add Product</span><small>उत्पाद जोड़ें</small></Link>
          <Link to="/artisan/enquiries" className="qa qa-blue"><MessageSquareText size={22} /><span>Buyer Enquiries</span><small>पूछताछ</small></Link>
          <Link to="/artisan/profile" className="qa qa-orange"><UserPen size={22} /><span>Edit Profile</span><small>प्रोफ़ाइल</small></Link>
          <a href="#help" className="qa qa-teal"><HelpCircle size={22} /><span>Help</span><small>मदद</small></a>
        </div>
      </Card>

      <div className="grid-2 gap-lg">
        <Card>
          <div className="card-head">
            <h3 className="card-title">Recent Enquiries</h3>
            <Link to="/artisan/enquiries" className="link small">View all <ArrowRight size={13} /></Link>
          </div>
          {enquiries.length === 0 ? (
            <Empty icon={Inbox} title="No enquiries yet">Publish products to start receiving buyer enquiries.</Empty>
          ) : (
            <ul className="list">
              {enquiries.slice(0, 4).map((e) => (
                <li key={e.id}>
                  <Link to={`/artisan/enquiries/${e.id}`} className="list-row">
                    <div>
                      <b>{e.buyerName}</b>
                      <small>{e.productTitle} · {e.quantity} units · {timeAgo(e.createdAt)}</small>
                    </div>
                    <Badge tone={needsReply(e) ? "red" : ENQUIRY_STATUS[e.status]?.tone}>{needsReply(e) ? "Reply needed" : ENQUIRY_STATUS[e.status]?.label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="card-head">
            <h3 className="card-title">Top Products</h3>
            <Link to="/artisan/products" className="link small">My products <ArrowRight size={13} /></Link>
          </div>
          {products.length === 0 ? (
            <Empty icon={Package} title="No products yet"><Link className="link" to="/artisan/add">Add your first product</Link> — it takes 2 minutes.</Empty>
          ) : (
            <ul className="list">
              {[...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4).map((p) => (
                <li key={p.id} className="list-row">
                  <ProductImage src={p.imageUrl} className="thumb" alt="" />
                  <div className="grow">
                    <b>{p.title}</b>
                    <small>{priceRange(p)} · {p.views || 0} views</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card id="help" className="tip-card">
        <Sparkles size={20} />
        <div>
          <b>Tip: Speak naturally about your product</b>
          <p className="muted small">Mention the material, how many days it took and the tradition behind it — the AI turns it into a bilingual listing buyers love. Deals so far: {inr(enquiries.filter((e) => e.totalAmount).reduce((s, e) => s + e.totalAmount, 0))}.</p>
        </div>
      </Card>
    </div>
  );
}
