import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, BadgeCheck, Pencil, Package, Handshake, IdCard, Languages, Palette, Share2 } from "lucide-react";
import { Card, Tabs, ProductImage, Spinner, Empty, useAsync, Avatar, Badge, Button, toast } from "../components/ui";
import { useSession } from "../session";
import { priceRange, craftLabel, inr, VOICE_LANGUAGES } from "../constants";
import * as api from "../api";

const COVER = {
  pottery: "photo-1493106641515-6b5631de4bb9",
  weaving: "photo-1594040226829-7f251ab46d80",
  painting: "photo-1513519245088-0e12902e5a38",
  jewelry: "photo-1601121141461-9d6647bca1ed",
  woodwork: "photo-1611486212557-88be5ff6f941",
  embroidery: "photo-1616627561950-9f746e330187",
};

/** Artisan profile / public storefront (artisan "My Profile" and buyer "View shop"). */
export function Storefront({ artisanId, owner = false }) {
  const [tab, setTab] = useState("products");
  const { data, loading, error } = useAsync(
    () => Promise.all([api.getArtisan(artisanId), api.listProducts({ artisanId }), api.listEnquiries({ artisanId })]),
    [artisanId]
  );
  if (loading) return <Spinner />;
  if (error || !data) return <Card><Empty icon={Package} title="Artisan not found" /></Card>;
  const [artisan, allProducts, enquiries] = data;
  const products = owner ? allProducts : allProducts.filter((p) => (p.status || "published") === "published");
  const deals = enquiries.filter((e) => e.status === "deal_closed");
  const lang = VOICE_LANGUAGES.find((l) => l.code.startsWith(artisan.language || "hi"))?.label;

  const share = () => {
    const url = `${window.location.origin}/market/artisan/${artisan.id}`;
    navigator.clipboard?.writeText(url).then(() => toast("Storefront link copied"), () => toast(url, "blue"));
  };

  return (
    <div className="storefront">
      <div className="store-cover">
        <ProductImage src={`https://images.unsplash.com/${COVER[artisan.craft] || COVER.pottery}?w=1400&auto=format&fit=crop&q=70`} alt="" />
      </div>
      <div className="store-head">
        <Avatar name={artisan.name} size={92} />
        <div className="grow">
          <h1>{artisan.name} {artisan.kycVerified && <BadgeCheck size={20} className="green" aria-label="Verified" />}</h1>
          <p className="muted"><MapPin size={14} /> {artisan.location || "India"}</p>
          <p className="store-craft">Traditional {craftLabel(artisan.craft)} Artisan</p>
        </div>
        <div className="row-gap">
          <Button variant="outline" size="sm" icon={Share2} onClick={share}>Share shop</Button>
          {owner && <Button as="link" to="/artisan/onboarding" size="sm" icon={Pencil}>Edit Profile</Button>}
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[
        { value: "products", label: `Products (${products.length})` },
        { value: "about", label: "About" },
        { value: "reviews", label: `Orders (${deals.length})` },
      ]} />

      {tab === "products" && (
        products.length === 0 ? <Card><Empty icon={Package} title="No products yet" /></Card> : (
          <div className="grid-products">
            {products.map((p) => (
              <Link key={p.id} to={`/market/product/${p.id}`} className="pcard">
                <ProductImage src={p.imageUrl} alt={p.title} className="pcard-img" />
                <div className="pcard-body">
                  <b>{p.title}</b>
                  <span className="price">{priceRange(p)}</span>
                  {owner && p.status !== "published" && <Badge tone="orange">{p.status}</Badge>}
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "about" && (
        <Card>
          <p>{artisan.bio || `${artisan.name} is a traditional ${craftLabel(artisan.craft).toLowerCase()} artisan from ${artisan.location || "India"}.`}</p>
          <ul className="facts about-facts">
            <li><Palette size={15} /> Craft: <b>{craftLabel(artisan.craft)}</b></li>
            <li><MapPin size={15} /> Cluster: <b>{artisan.location || "—"}</b></li>
            <li><IdCard size={15} /> Pehchan ID: <b>{artisan.pehchanId || "Not linked"}</b></li>
            <li><Languages size={15} /> Speaks: <b>{lang || "Hindi"}</b></li>
            <li><Handshake size={15} /> Completed orders: <b>{deals.length}</b></li>
          </ul>
        </Card>
      )}

      {tab === "reviews" && (
        deals.length === 0 ? <Card><Empty icon={Handshake} title="No completed orders yet">Confirmed bulk orders will show here.</Empty></Card> : (
          <Card>
            <ul className="list">
              {deals.map((d) => (
                <li key={d.id} className="list-row">
                  <Avatar name={d.buyerName} size={36} tone="blue" />
                  <div className="grow">
                    <b>{d.buyerName}</b>
                    <small>{d.quantity} × {d.productTitle} at {inr(d.finalPrice)}/unit</small>
                  </div>
                  <Badge tone="green">Order confirmed</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )
      )}
    </div>
  );
}

export function ArtisanProfilePage() {
  const { user } = useSession("artisan");
  return <div className="page"><Storefront artisanId={user.id} owner /></div>;
}

export function PublicStorefrontPage() {
  const { id } = useParams();
  return <div className="page"><Storefront artisanId={id} /></div>;
}
