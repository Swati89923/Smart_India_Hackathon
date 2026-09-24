import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Inbox, MessagesSquare, CheckCircle2, ArrowLeft, Handshake, Search, Receipt } from "lucide-react";
import { Card, Stat, Badge, Button, Field, Modal, ProductImage, Spinner, Empty, useAsync, toast, Avatar } from "../../components/ui";
import { ChatThread, ChatComposer, lastOffer } from "../../components/Chat";
import { useSession } from "../../session";
import { ENQUIRY_STATUS, inr, timeAgo } from "../../constants";
import * as api from "../../api";

const loadBuyerData = (buyer) =>
  Promise.all([api.listEnquiries({ buyerId: buyer.id, buyerPhone: buyer.phone }), api.listProducts()]);

export function BuyerDashboard() {
  const { user } = useSession("buyer");
  const { data, loading } = useAsync(() => loadBuyerData(user), [user.id]);
  if (loading || !data) return <Spinner />;
  const [enquiries, products] = data;
  const img = (e) => products.find((p) => p.id === e.productId)?.imageUrl;
  const active = enquiries.filter((e) => ["open", "negotiating", "accepted"].includes(e.status));
  const confirmed = enquiries.filter((e) => e.status === "deal_closed");

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Welcome, {user.name?.split(" ")[0]}!</h1>
          <p className="muted">{user.companyName} · {user.buyerType} · {user.city}</p>
        </div>
        <Link to="/market/products" className="btn btn-blue"><Search size={16} /> Browse products</Link>
      </div>
      <div className="stats-row three">
        <Stat value={enquiries.length} label="Enquiries" tone="blue" icon={Inbox} />
        <Stat value={active.length} label="Active Chats" tone="green" icon={MessagesSquare} />
        <Stat value={confirmed.length} label="Confirmed" tone="orange" icon={CheckCircle2} />
      </div>
      <Card>
        <div className="card-head">
          <h3 className="card-title">Recent Enquiries</h3>
          <Link to="/buyer/chats" className="link small">Open chats</Link>
        </div>
        {enquiries.length === 0 ? (
          <Empty icon={Inbox} title="No enquiries yet"><Link className="link" to="/market/products">Find a product</Link> and request a bulk order.</Empty>
        ) : (
          <ul className="list">
            {enquiries.map((e) => (
              <li key={e.id}>
                <Link to={`/buyer/chats/${e.id}`} className="list-row">
                  <ProductImage src={img(e)} className="thumb" alt="" />
                  <div className="grow">
                    <b>{e.productTitle}</b>
                    <small>{e.quantity} units · {e.finalPrice ? `${inr(e.finalPrice)}/unit` : e.budgetMin ? `${inr(e.budgetMin)} – ${inr(e.budgetMax)}` : `listed ${inr(e.askingPrice)}`} · {timeAgo(e.createdAt)}</small>
                  </div>
                  <Badge tone={lastOffer(e)?.sender === "artisan" && e.status === "negotiating" ? "orange" : ENQUIRY_STATUS[e.status]?.tone}>
                    {lastOffer(e)?.sender === "artisan" && e.status === "negotiating" ? "Replied" : ENQUIRY_STATUS[e.status]?.label}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function DealModal({ enquiry, price, onClose, onDone }) {
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("Escrow / Cash on Delivery");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      onDone(await api.confirmDeal(enquiry.id, { finalPrice: price, address, paymentMode }));
      toast("🤝 Deal confirmed!", "green");
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Confirm Order">
      <form className="stack" onSubmit={submit}>
        <div className="invoice">
          <div><span>Product</span><b>{enquiry.productTitle}</b></div>
          <div><span>Quantity</span><b>{enquiry.quantity}</b></div>
          <div><span>Unit price</span><b>{inr(price)}</b></div>
          <div className="total"><span>Total</span><b>{inr(price * enquiry.quantity)}</b></div>
        </div>
        <Field label="Delivery address"><textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Warehouse 4, Okhla Phase II, New Delhi" /></Field>
        <Field label="Payment">
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option>Escrow / Cash on Delivery</option>
            <option>Escrow / UPI</option>
            <option>Escrow / Bank transfer</option>
          </select>
        </Field>
        <p className="tiny muted">Payment is held in escrow and released to the artisan after delivery.</p>
        <Button type="submit" variant="blue" loading={busy} className="btn-block" icon={Handshake}>Confirm Deal</Button>
      </form>
    </Modal>
  );
}

export function BuyerChats() {
  const { user } = useSession("buyer");
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const { data, loading, setData } = useAsync(() => loadBuyerData(user), [user.id]);
  if (loading || !data) return <Spinner />;
  const [enquiries] = data;
  const selected = enquiries.find((e) => e.id === id) || (window.innerWidth > 900 ? enquiries[0] : null);
  const onUpdated = (u) => u && setData(([list, prods]) => [list.map((e) => (e.id === u.id ? u : e)), prods]);
  const artisanOffer = selected && lastOffer(selected, "artisan");
  const latest = selected && lastOffer(selected);
  const closed = selected && ["deal_closed", "declined"].includes(selected.status);
  const canAccept = selected && !closed && (selected.status === "accepted" || latest?.sender === "artisan");

  return (
    <div className="page">
      <div className="page-head"><h1>Chat / Negotiation</h1></div>
      {enquiries.length === 0 ? (
        <Card><Empty icon={MessagesSquare} title="No conversations yet"><Link to="/market/products" className="link">Browse products</Link> to contact an artisan.</Empty></Card>
      ) : (
        <div className={`split ${id ? "has-detail" : ""}`}>
          <Card className="split-list">
            <ul className="list">
              {enquiries.map((e) => (
                <li key={e.id}>
                  <Link to={`/buyer/chats/${e.id}`} className={`list-row ${selected?.id === e.id ? "selected" : ""}`}>
                    <Avatar name={e.productTitle} size={36} />
                    <div className="grow">
                      <b>{e.productTitle}</b>
                      <small>{e.thread?.[e.thread.length - 1]?.message?.slice(0, 48)}</small>
                    </div>
                    <Badge tone={ENQUIRY_STATUS[e.status]?.tone}>{ENQUIRY_STATUS[e.status]?.label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <div className="split-detail">
            {id && <button className="back-link show-sm" onClick={() => navigate("/buyer/chats")}><ArrowLeft size={15} /> All chats</button>}
            {selected && (
              <Card className="chat-card">
                <div className="card-head">
                  <div>
                    <b>{selected.productTitle}</b>
                    <small className="muted"> · {selected.quantity} units · listed {inr(selected.askingPrice)}/unit</small>
                  </div>
                  <Badge tone={ENQUIRY_STATUS[selected.status]?.tone}>{ENQUIRY_STATUS[selected.status]?.label}</Badge>
                </div>
                <ChatThread enquiry={selected} me="buyer" />
                {canAccept && (
                  <div className="accept-bar">
                    <span>Artisan {selected.status === "accepted" ? "accepted" : "offered"} <b>{inr((artisanOffer || latest).offerPrice)}</b>/unit · Total {inr((artisanOffer || latest).offerPrice * selected.quantity)}</span>
                    <Button size="sm" variant="blue" icon={Handshake} onClick={() => setDeal((artisanOffer || latest).offerPrice)}>Accept &amp; Confirm</Button>
                  </div>
                )}
                {selected.status === "deal_closed" && (
                  <div className="note-green"><Receipt size={16} /> Order confirmed · {selected.quantity} × {inr(selected.finalPrice)} = <b>{inr(selected.totalAmount)}</b></div>
                )}
                <ChatComposer tone="blue" disabled={closed} onSend={async (m, o) => onUpdated(await api.sendMessage(selected.id, "buyer", m, o))} />
              </Card>
            )}
          </div>
        </div>
      )}
      {deal != null && selected && <DealModal enquiry={selected} price={deal} onClose={() => setDeal(null)} onDone={onUpdated} />}
    </div>
  );
}
