import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Sparkles, Check, X, Repeat2, Inbox, ArrowLeft, CalendarDays, Package, MessageCircle } from "lucide-react";
import { Card, Badge, Button, Field, Modal, Spinner, Empty, useAsync, toast, Avatar } from "../../components/ui";
import { ChatThread, ChatComposer, lastOffer } from "../../components/Chat";
import { useSession } from "../../session";
import { ENQUIRY_STATUS, inr, timeAgo } from "../../constants";
import { needsReply } from "./Dashboard";
import * as api from "../../api";

function EnquiryDetail({ enquiry, onUpdated }) {
  const [suggestion, setSuggestion] = useState(null);
  const [counter, setCounter] = useState(null); // { price, message } when modal open
  const [busy, setBusy] = useState("");
  const closed = ["deal_closed", "declined"].includes(enquiry.status);
  const offer = lastOffer(enquiry, "buyer");
  const acceptPrice = offer?.offerPrice ?? enquiry.askingPrice;

  useEffect(() => {
    setSuggestion(null);
    if (!closed) api.suggestResponse(enquiry.id).then(setSuggestion).catch(() => {});
  }, [enquiry.id, enquiry.thread?.length, closed]);

  const respond = async (action, price, message) => {
    setBusy(action);
    try {
      const updated = await api.respondToEnquiry(enquiry.id, action, price, message);
      onUpdated(updated);
      toast(action === "accept" ? "Offer accepted — buyer will confirm the order" : action === "counter" ? "Counter-offer sent" : "Enquiry declined", action === "reject" ? "gray" : "green");
      setCounter(null);
    } catch (e) {
      toast(e.message, "red");
    } finally {
      setBusy("");
    }
  };

  const send = async (message, offerPrice) => onUpdated(await api.sendMessage(enquiry.id, "artisan", message, offerPrice));

  return (
    <div className="stack">
      <Card>
        <div className="card-head">
          <h3 className="card-title">{enquiry.status === "open" ? "New Enquiry" : "Enquiry"}</h3>
          <Badge tone={ENQUIRY_STATUS[enquiry.status]?.tone}>{ENQUIRY_STATUS[enquiry.status]?.label}</Badge>
        </div>
        <div className="enq-summary">
          <span className="enq-icon"><Building2 size={22} /></span>
          <div>
            <b>{enquiry.buyerName}</b>
            <small className="muted">{enquiry.buyerType} · {timeAgo(enquiry.createdAt)}</small>
            <ul className="facts">
              <li><Package size={14} /> {enquiry.productTitle}</li>
              <li><b>{enquiry.quantity} units</b></li>
              <li>{enquiry.budgetMin ? `${inr(enquiry.budgetMin)} – ${inr(enquiry.budgetMax)} per unit` : offer ? `Offer ${inr(offer.offerPrice)} per unit` : `Your price ${inr(enquiry.askingPrice)}`}</li>
              {enquiry.requiredBy && <li><CalendarDays size={14} /> Required by: {new Date(enquiry.requiredBy).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</li>}
            </ul>
            <p className="small">Message: {enquiry.thread?.[0]?.message}</p>
          </div>
        </div>
        {enquiry.status === "deal_closed" && (
          <div className="note-green"><Check size={16} /> Deal closed at {inr(enquiry.finalPrice)}/unit · Total {inr(enquiry.totalAmount)}</div>
        )}
        {!closed && (
          <div className="action-row">
            <Button onClick={() => respond("accept", acceptPrice)} loading={busy === "accept"} icon={Check}>Accept {inr(acceptPrice)}</Button>
            <Button variant="outline-blue" icon={Repeat2} onClick={() => setCounter({ price: suggestion?.suggestedPrice || enquiry.askingPrice, message: "" })}>Counter Offer</Button>
            <Button variant="outline-red" icon={X} loading={busy === "reject"} onClick={() => window.confirm("Decline this enquiry?") && respond("reject")}>Reject</Button>
          </div>
        )}
      </Card>

      {!closed && suggestion && suggestion.action !== "none" && (
        <Card className="ai-card">
          <Sparkles size={18} />
          <div className="grow">
            <b>AI Negotiation Copilot suggests: {suggestion.action === "accept" ? "Accept" : `Counter at ${inr(suggestion.suggestedPrice)}`}</b>
            <p className="small muted">{suggestion.note}</p>
            <small className="muted">Only a suggestion — nothing is sent until you choose.</small>
          </div>
          <Button size="sm" variant="outline" onClick={() => (suggestion.action === "accept" ? respond("accept", suggestion.suggestedPrice) : setCounter({ price: suggestion.suggestedPrice, message: "" }))}>
            Use suggestion
          </Button>
        </Card>
      )}

      <Card className="chat-card">
        <h3 className="card-title"><MessageCircle size={16} /> Chat with Buyer</h3>
        <ChatThread enquiry={enquiry} me="artisan" />
        <ChatComposer onSend={send} disabled={closed} />
      </Card>

      <Modal open={!!counter} onClose={() => setCounter(null)} title="Send Counter Offer">
        {counter && (
          <form className="stack" onSubmit={(e) => { e.preventDefault(); respond("counter", Number(counter.price), counter.message || undefined); }}>
            <p className="small muted">Buyer offered {offer ? inr(offer.offerPrice) : "—"} · your listed price {inr(enquiry.askingPrice)}</p>
            <Field label="Your price per unit (₹)">
              <input type="number" min="1" value={counter.price} onChange={(e) => setCounter({ ...counter, price: e.target.value })} autoFocus />
            </Field>
            <Field label="Message (optional)">
              <textarea rows={2} value={counter.message} onChange={(e) => setCounter({ ...counter, message: e.target.value })} placeholder={`We can do ${inr(counter.price)} per unit for ${enquiry.quantity} units.`} />
            </Field>
            <p className="small">Order value: <b>{inr(Number(counter.price) * enquiry.quantity)}</b></p>
            <Button type="submit" variant="blue" loading={busy === "counter"} className="btn-block">Send Counter Offer</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default function ArtisanEnquiries() {
  const { user } = useSession("artisan");
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: enquiries, loading, setData } = useAsync(() => api.listEnquiries({ artisanId: user.id }), [user.id]);

  if (loading || !enquiries) return <Spinner />;
  const selected = enquiries.find((e) => e.id === id) || (window.innerWidth > 900 ? enquiries[0] : null);
  const onUpdated = (u) => u && setData((list) => list.map((e) => (e.id === u.id ? u : e)));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Enquiries &amp; Negotiation <small>पूछताछ और मोलभाव</small></h1>
          <p className="muted">{enquiries.filter(needsReply).length} waiting for your reply</p>
        </div>
      </div>
      {enquiries.length === 0 ? (
        <Card><Empty icon={Inbox} title="No enquiries yet">When buyers enquire about your products they will appear here.</Empty></Card>
      ) : (
        <div className={`split ${id ? "has-detail" : ""}`}>
          <Card className="split-list">
            <ul className="list">
              {enquiries.map((e) => (
                <li key={e.id}>
                  <Link to={`/artisan/enquiries/${e.id}`} className={`list-row ${selected?.id === e.id ? "selected" : ""}`}>
                    <Avatar name={e.buyerName} size={36} tone="blue" />
                    <div className="grow">
                      <b>{e.buyerName}</b>
                      <small>{e.productTitle} · {e.quantity} units</small>
                    </div>
                    <div className="right">
                      <Badge tone={needsReply(e) ? "red" : ENQUIRY_STATUS[e.status]?.tone}>{needsReply(e) ? "Reply" : ENQUIRY_STATUS[e.status]?.label}</Badge>
                      <small className="muted">{timeAgo(e.thread?.[e.thread.length - 1]?.time || e.createdAt)}</small>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <div className="split-detail">
            {id && <button className="back-link show-sm" onClick={() => navigate("/artisan/enquiries")}><ArrowLeft size={15} /> All enquiries</button>}
            {selected ? <EnquiryDetail key={selected.id} enquiry={selected} onUpdated={onUpdated} /> : <Card><Empty icon={Inbox} title="Select an enquiry" /></Card>}
          </div>
        </div>
      )}
    </div>
  );
}
