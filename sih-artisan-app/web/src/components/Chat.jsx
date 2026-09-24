import { useEffect, useRef, useState } from "react";
import { Send, IndianRupee } from "lucide-react";
import { inr, timeAgo } from "../constants";

export const lastOffer = (enq, sender) =>
  [...(enq?.thread || [])].reverse().find((m) => m.offerPrice != null && (!sender || m.sender === sender));

/** Negotiation thread; `me` is "artisan" | "buyer". */
export function ChatThread({ enquiry, me }) {
  const box = useRef();
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [enquiry?.id, enquiry?.thread?.length]);
  return (
    <div className="chat-thread" ref={box}>
      {(enquiry?.thread || []).map((m) => (
        <div key={m.id} className={`bubble ${m.sender === me ? "mine" : "theirs"} ${m.sender === "buyer" ? "b-buyer" : "b-artisan"}`}>
          {m.offerPrice != null && <span className="offer-tag"><IndianRupee size={11} />{inr(m.offerPrice).slice(1)}/unit</span>}
          <p>{m.message}</p>
          <small>{m.sender === "buyer" ? "Buyer" : "Artisan"} · {timeAgo(m.time)}</small>
        </div>
      ))}
    </div>
  );
}

export function ChatComposer({ onSend, disabled, withOffer = true, tone = "primary" }) {
  const [text, setText] = useState("");
  const [offer, setOffer] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !offer) return;
    setBusy(true);
    try {
      await onSend(text.trim() || `Offer: ₹${offer} per unit`, offer ? Number(offer) : null);
      setText("");
      setOffer("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="composer" onSubmit={submit}>
      <input placeholder={disabled ? "This conversation is closed" : "Type a message…"} value={text} onChange={(e) => setText(e.target.value)} disabled={disabled || busy} />
      {withOffer && (
        <span className="composer-offer" title="Optional price per unit">
          ₹<input type="number" min="1" placeholder="offer" value={offer} onChange={(e) => setOffer(e.target.value)} disabled={disabled || busy} />
        </span>
      )}
      <button className={`send send-${tone}`} disabled={disabled || busy} aria-label="Send"><Send size={16} /></button>
    </form>
  );
}
