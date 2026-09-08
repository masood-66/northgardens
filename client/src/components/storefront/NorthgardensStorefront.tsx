import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import type { Product, CartItem } from "@shared/commerce/types";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Heart,
  Leaf,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const HERO_IMAGE = "/manus-storage/northgardens-hero_87e554db.jpg";
const WISHLIST_KEY = "northgardens:wishlist";

function readWishlist() {
  if (typeof window === "undefined") return [] as string[];
  try {
    return JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]") as string[];
  } catch {
    return [] as string[];
  }
}

function writeWishlist(items: string[]) {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("northgardens:wishlist"));
}

function useWishlist() {
  const [items, setItems] = useState<string[]>(readWishlist);
  useEffect(() => {
    const sync = () => setItems(readWishlist());
    window.addEventListener("northgardens:wishlist", sync);
    return () => window.removeEventListener("northgardens:wishlist", sync);
  }, []);
  const toggle = (handle: string) => {
    const next = items.includes(handle) ? items.filter(item => item !== handle) : [...items, handle];
    writeWishlist(next);
    setItems(next);
    toast.success(items.includes(handle) ? "Removed from wishlist" : "Saved to wishlist");
  };
  return { items, toggle };
}

function money(value?: { amount: string; currencyCode: string }) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: value.currencyCode }).format(Number(value.amount));
}

function MapleLeaves() {
  return (
    <div className="leaf-layer" aria-hidden="true">
      {["leaf-a", "leaf-b", "leaf-c", "leaf-d", "leaf-e", "leaf-f", "leaf-g"].map((name, index) => (
        <span key={name} className={`maple-leaf ${name}`} style={{ animationDelay: `${index * -2.6}s` }}>🍁</span>
      ))}
    </div>
  );
}

function CornerLeaves({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`corner-leaves ${compact ? "corner-leaves-compact" : ""}`} aria-hidden="true">
      <span className="corner-leaf corner-leaf-one">🍁</span>
      <span className="corner-leaf corner-leaf-two">🍁</span>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="logo-mark" aria-label="Northgardens home">
      <span className="logo-kicker">quiet objects for</span>
      <span className="logo-name">NORTHGARDENS</span>
    </Link>
  );
}

export function StorefrontShell({ children }: { children: ReactNode }) {
  const { itemCount, openCart } = useCart();
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { items: wishlist } = useWishlist();

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    setLocation(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  };

  const nav = [
    ["Shop", "/shop"],
    ["Autumn edit", "/shop?tag=Autumn%20Edit"],
    ["Our story", "/about"],
    ["Journal", "/journal"],
  ];

  return (
    <div className="site-shell">
      <MapleLeaves />
      <div className="announcement-bar">
        <span>Seasonal objects, quietly considered.</span>
        <span className="announcement-detail"><Sparkles size={13} /> Free shipping on orders over $150</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button className="icon-button mobile-only" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {nav.map(([label, href]) => <Link key={href} href={href} className={location === href ? "active" : ""}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(value => !value)}><Search size={18} /></button>
            <Link className="icon-button desktop-only" href="/wishlist" aria-label={`Wishlist, ${wishlist.length} saved`}><Heart size={18} /><span className="action-count">{wishlist.length}</span></Link>
            <button className="icon-button cart-trigger" aria-label={`Cart, ${itemCount} items`} onClick={openCart}><ShoppingBag size={18} /><span className="action-count">{itemCount}</span></button>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel glass-card">
            <form onSubmit={submitSearch}>
              <Search size={18} />
              <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search objects, materials, rituals…" aria-label="Search products" />
              <button className="text-button" type="submit">Search <ArrowRight size={15} /></button>
            </form>
            <p>Try “ceramics”, “linen”, or “autumn”.</p>
          </div>
        )}
      </header>
      {menuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)}>
          <aside className="mobile-menu glass-card" onClick={event => event.stopPropagation()}>
            <div className="mobile-menu-head"><Logo /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
            <nav>{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={16} /></Link>)}</nav>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="mobile-secondary-link"><Heart size={17} /> Saved objects <span>{wishlist.length}</span></Link>
          </aside>
        </div>
      )}
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <CornerLeaves compact />
      <div className="footer-top">
        <div>
          <p className="eyebrow">A slower kind of shopping</p>
          <h2>Keep a little<br /><em>room for wonder.</em></h2>
        </div>
        <div className="footer-signup">
          <p>Seasonal notes, new objects, and small rituals for home.</p>
          <form onSubmit={event => { event.preventDefault(); toast.success("You're on the list."); }}>
            <input required type="email" placeholder="Your email address" aria-label="Email address" />
            <button className="round-arrow" type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <Logo />
        <div className="footer-links"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/shop">Shop all</Link></div>
        <span>© {new Date().getFullYear()} Northgardens</span>
      </div>
    </footer>
  );
}

export function HomePage() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 25 });
  const [quickView, setQuickView] = useState<Product | null>(null);
  const featured = products.slice(0, 2);

  return (
    <>
      <section className="hero-section">
        <div className="hero-image-wrap"><img src={HERO_IMAGE} alt="Japanese maple garden with Northgardens home objects" /><div className="hero-image-wash" /></div>
        <CornerLeaves />
        <div className="hero-copy">
          <p className="eyebrow light-eyebrow"><Leaf size={14} /> The autumn edit · 2026</p>
          <h1>Make space<br /><em>for the season.</em></h1>
          <p className="hero-description">Thoughtful pieces for the rituals that make a house feel like yours — gathered from quiet studios and shaped by hand.</p>
          <Link href="/shop" className="button button-light">Explore the edit <ArrowRight size={16} /></Link>
        </div>
        <div className="hero-note"><span>01 / 04</span><span className="hero-line" /><span>Objects for slow living</span></div>
      </section>

      <section className="intro-section page-section">
        <div className="intro-statement"><p className="eyebrow">Northgardens / 001</p><h2>Good things take their<br /><em>own sweet time.</em></h2></div>
        <div className="intro-body"><p>We collect warm, useful things for home. Nothing loud. Nothing made to be replaced next season. Just honest materials, considered forms, and the feeling of finding something that fits.</p><Link href="/about" className="text-link">Read our story <ArrowRight size={15} /></Link></div>
      </section>

      <section className="category-section page-section">
        <div className="section-head"><div><p className="eyebrow">Shop by feeling</p><h2>Find your <em>north.</em></h2></div><Link href="/shop" className="text-link">View everything <ArrowRight size={15} /></Link></div>
        <div className="category-grid">
          <CategoryCard image={featured[0]?.images[0]?.url || HERO_IMAGE} label="The daily ritual" title="Small comforts" copy="Objects that make everyday moments feel a little more intentional." href="/shop" />
          <CategoryCard image={featured[1]?.images[0]?.url || HERO_IMAGE} label="For the table" title="Gather well" copy="Pieces for shared meals, quiet mornings, and the people you keep close." href="/shop" />
          <CategoryCard image={HERO_IMAGE} label="The seasonal edit" title="Autumn, held" copy="Warm textures and amber notes to welcome the turn of the year." href="/shop?tag=Autumn%20Edit" />
        </div>
      </section>

      <section className="reward-banner page-section"><CornerLeaves compact /><div><p className="eyebrow">The Northgardens circle</p><h2>A little more <em>goodness.</em></h2><p>Join our quiet list for first looks, studio stories, and a thank-you note on your first order.</p></div><Link href="/contact" className="button button-dark">Join the circle <ArrowRight size={16} /></Link></section>

      <section className="products-section page-section">
        <div className="section-head"><div><p className="eyebrow">Recently gathered</p><h2>Hand-picked <em>objects.</em></h2></div><Link href="/shop" className="text-link">Shop all <ArrowRight size={15} /></Link></div>
        {isLoading ? <ProductSkeletons /> : featured.length ? <div className="product-grid">{featured.map(product => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div> : <EmptyCatalog />}
      </section>

      <section className="story-band page-section"><div className="story-copy"><p className="eyebrow">A note from the garden</p><h2>Bring the outside<br /><em>in, gently.</em></h2><p>From mossy greens to the small flash of an autumn leaf, our palette follows the world just outside the window.</p><Link href="/journal" className="text-link">Read the journal <ArrowRight size={15} /></Link></div><div className="story-image"><img src={HERO_IMAGE} alt="Warm autumn garden light" /></div></section>
      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}

function CategoryCard({ image, label, title, copy, href }: { image: string; label: string; title: string; copy: string; href: string }) {
  return <Link href={href} className="category-card"><img src={image} alt="" /><div className="category-overlay" /><div className="category-copy"><p>{label}</p><h3>{title}</h3><span>{copy}</span><b>Explore <ArrowRight size={14} /></b></div></Link>;
}

export function ShopPage() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 50 });
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [sort, setSort] = useState("featured");
  const [activeType, setActiveType] = useState("All");
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const [mobileFilters, setMobileFilters] = useState(false);
  const types = ["All", ...Array.from(new Set(products.map(product => product.productType).filter(Boolean) as string[]))];
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const next = products.filter(product => {
      const matchesType = activeType === "All" || product.productType === activeType;
      const haystack = [product.title, product.description, product.productType, ...product.tags].join(" ").toLowerCase();
      return matchesType && (!normalized || haystack.includes(normalized));
    });
    return [...next].sort((a, b) => sort === "price-low" ? Number(a.priceRange.min.amount) - Number(b.priceRange.min.amount) : sort === "price-high" ? Number(b.priceRange.min.amount) - Number(a.priceRange.min.amount) : a.title.localeCompare(b.title));
  }, [products, query, activeType, sort]);

  return <>
    <PageIntro eyebrow="The Northgardens shop" title={<>Objects with a<br /><em>quiet point of view.</em></>} copy="A considered collection of home goods, gathered for the season ahead." />
    <section className="shop-layout page-section">
      <aside className={`filter-sidebar ${mobileFilters ? "open" : ""}`}><div className="filter-head"><p className="eyebrow">Refine</p><button className="icon-button mobile-only" onClick={() => setMobileFilters(false)}><X size={18} /></button></div><label className="filter-label">Category</label><div className="filter-options">{types.map(type => <button key={type} className={activeType === type ? "selected" : ""} onClick={() => { setActiveType(type); setMobileFilters(false); }}>{type}<span>{type === "All" ? products.length : products.filter(product => product.productType === type).length}</span></button>)}</div><div className="filter-note"><Leaf size={16} /><p>Every object is chosen for its material, usefulness, and ability to age well.</p></div></aside>
      <div className="shop-results"><div className="shop-toolbar"><span>{filtered.length} objects</span><div className="shop-toolbar-actions"><button className="filter-toggle mobile-only" onClick={() => setMobileFilters(true)}>Filter <ChevronDown size={15} /></button><label className="sort-control">Sort <select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={15} /></label></div></div>{query && <div className="search-result-note">Showing results for <strong>“{query}”</strong><button onClick={() => setQuery("")}><X size={13} /></button></div>}{isLoading ? <ProductSkeletons /> : filtered.length ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div> : <EmptyCatalog message="No objects found for this search." />}</div>
    </section>
    {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
  </>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: ReactNode; copy: string }) {
  return <section className="page-intro"><CornerLeaves /><div className="page-section page-intro-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div></section>;
}

function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (product: Product) => void }) {
  const { addItem, loading } = useCart();
  const { items, toggle } = useWishlist();
  const variant = product.variants[0];
  const image = product.images[0];
  const saved = items.includes(product.handle);
  const add = async () => {
    if (!variant) return;
    try { await addItem(variant.id, 1); toast.success(`${product.title} added to bag`); } catch { toast.error("We couldn't add that object right now."); }
  };
  return <article className="product-card"><div className="product-image-wrap"><Link href={`/product/${product.handle}`}><img src={image?.url} alt={image?.altText || product.title} loading="lazy" /></Link><div className="product-card-actions"><button className={`round-icon ${saved ? "saved" : ""}`} onClick={() => toggle(product.handle)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}><Heart size={16} fill={saved ? "currentColor" : "none"} /></button><button className="quick-button" onClick={() => onQuickView(product)}>Quick view</button></div>{product.tags.includes("Featured") && <span className="product-badge">Featured</span>}</div><div className="product-meta"><p className="product-type">{product.productType || "Home object"}</p><Link href={`/product/${product.handle}`} className="product-title">{product.title}</Link><div className="product-bottom"><span className="product-price">{money(product.priceRange.min)}</span><button className="add-mini" disabled={loading || !variant?.availableForSale} onClick={add}>{variant?.availableForSale ? <><Plus size={14} /> Add</> : "Sold out"}</button></div></div></article>;
}

function ProductSkeletons() { return <div className="product-grid">{[1, 2].map(item => <div className="skeleton-card" key={item}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /></div>)}</div>; }
function EmptyCatalog({ message = "The shelves are being gathered. Check back soon." }: { message?: string }) { return <div className="empty-catalog"><Leaf size={22} /><h3>{message}</h3><Link href="/" className="text-link">Return home <ArrowRight size={15} /></Link></div>; }

export function ProductPage({ params }: { params: { handle: string } }) {
  const { data: product, isLoading } = trpc.commerce.products.byHandle.useQuery({ handle: params.handle }, { enabled: Boolean(params.handle) });
  const { addItem, loading } = useCart();
  const { items, toggle } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("Details");
  if (isLoading) return <PageLoader />;
  if (!product) return <EmptyCatalog message="That object has wandered out of the garden." />;
  const variant = product.variants[0];
  const image = product.images[activeImage] || product.images[0];
  const saved = items.includes(product.handle);
  const add = async () => { try { await addItem(variant.id, 1); toast.success(`${product.title} added to bag`); } catch { toast.error("We couldn't add that object right now."); } };
  return <section className="product-detail page-section"><div className="breadcrumbs"><Link href="/shop">Shop</Link><span>/</span><span>{product.title}</span></div><div className="product-detail-grid"><div className="product-gallery"><div className="product-main-image"><img src={image?.url} alt={image?.altText || product.title} /></div><div className="thumbnail-row">{product.images.map((productImage, index) => <button className={activeImage === index ? "active" : ""} key={productImage.url} onClick={() => setActiveImage(index)}><img src={productImage.url} alt="" /></button>)}</div></div><div className="product-info"><p className="eyebrow">{product.productType || "Home object"}</p><h1>{product.title}</h1><div className="rating"><span>{[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}</span><small>Considered by Northgardens</small></div><p className="detail-price">{money(product.priceRange.min)}</p><p className="detail-description">{product.description}</p><div className="detail-rule" /><div className="stock-line"><span className="stock-dot" /> In stock · ready to ship</div><div className="detail-actions"><button className="button button-dark wide-button" disabled={loading || !variant.availableForSale} onClick={add}>{loading ? "Adding…" : "Add to bag"}<ArrowRight size={16} /></button><button className={`round-icon detail-save ${saved ? "saved" : ""}`} onClick={() => toggle(product.handle)} aria-label="Toggle wishlist"><Heart size={18} fill={saved ? "currentColor" : "none"} /></button></div><div className="detail-note"><Check size={16} /><span>Free shipping over $150 · 30-day returns</span></div></div></div><div className="product-tabs"><div className="tab-buttons">{["Details", "Materials & care", "Shipping"].map(label => <button className={tab === label ? "active" : ""} key={label} onClick={() => setTab(label)}>{label}</button>)}</div><div className="tab-content">{tab === "Details" && <p>{product.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}</p>}{tab === "Materials & care" && <p>Made in small batches with honest materials. Wipe gently with a soft, dry cloth and allow natural patina to develop over time.</p>}{tab === "Shipping" && <p>Orders leave our studio within 2–3 business days. Complimentary shipping is applied automatically to orders over $150.</p>}</div></div></section>;
}

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, loading } = useCart();
  const variant = product.variants[0];
  const add = async () => { try { await addItem(variant.id, 1); toast.success(`${product.title} added to bag`); onClose(); } catch { toast.error("We couldn't add that object right now."); } };
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [onClose]);
  return <div className="modal-backdrop" onClick={onClose}><div className="quick-view glass-card" onClick={event => event.stopPropagation()}><button className="modal-close icon-button" onClick={onClose} aria-label="Close quick view"><X size={19} /></button><div className="quick-image"><img src={product.images[0]?.url} alt={product.title} /></div><div className="quick-copy"><p className="eyebrow">Quick view</p><h2>{product.title}</h2><p className="detail-price">{money(product.priceRange.min)}</p><p>{product.description}</p><div className="quick-actions"><button className="button button-dark" disabled={loading} onClick={add}>Add to bag <ArrowRight size={16} /></button><Link href={`/product/${product.handle}`} className="text-link" onClick={onClose}>View full details <ArrowRight size={15} /></Link></div></div></div></div>;
}

function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, proceedToCheckout, loading } = useCart();
  if (!isOpen) return null;
  return <div className="drawer-backdrop" onClick={closeCart}><aside className="cart-drawer" onClick={event => event.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">Your bag</p><h2>{cart?.itemCount || 0} {cart?.itemCount === 1 ? "object" : "objects"}</h2></div><button className="icon-button" onClick={closeCart} aria-label="Close cart"><X size={20} /></button></div>{cart?.items.length ? <><div className="drawer-items">{cart.items.map(item => <CartLine key={item.lineId} item={item} onUpdate={updateQuantity} onRemove={removeItem} />)}</div><div className="drawer-summary"><div><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="button button-dark wide-button" disabled={loading} onClick={proceedToCheckout}>Secure checkout <ArrowRight size={16} /></button><Link href="/cart" className="drawer-link" onClick={closeCart}>View full bag</Link></div></> : <div className="drawer-empty"><Leaf size={24} /><h3>Your bag is waiting.</h3><p>Find a small thing to bring home.</p><Link href="/shop" className="button button-outline" onClick={closeCart}>Explore the shop</Link></div>}</aside></div>;
}

function CartLine({ item, onUpdate, onRemove }: { item: CartItem; onUpdate: (lineId: string, quantity: number) => Promise<void>; onRemove: (lineId: string) => Promise<void> }) {
  return <div className="cart-line"><img src={item.image?.url} alt={item.productTitle} /><div className="cart-line-info"><Link href={`/product/${item.productHandle}`}>{item.productTitle}</Link>{item.variantTitle !== "Default Title" && <small>{item.variantTitle}</small>}<div className="cart-line-bottom"><strong>{money(item.lineTotal)}</strong><div className="qty-control"><button onClick={() => onUpdate(item.lineId, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => onUpdate(item.lineId, item.quantity + 1)} aria-label="Increase quantity"><Plus size={12} /></button></div></div><button className="remove-link" onClick={() => onRemove(item.lineId)}>Remove</button></div></div>;
}

export function CartPage() {
  const { cart, updateQuantity, removeItem, proceedToCheckout, loading } = useCart();
  if (!cart?.items.length) return <><PageIntro eyebrow="Your bag" title={<>A little space<br /><em>for something good.</em></>} copy="Your bag is currently empty. We’ll keep the light on." /><div className="empty-page page-section"><Leaf size={28} /><Link href="/shop" className="button button-dark">Go shopping <ArrowRight size={16} /></Link></div></>;
  return <section className="cart-page page-section"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Your bag</span></div><div className="cart-page-head"><div><p className="eyebrow">Your bag</p><h1>Objects coming <em>home.</em></h1></div><span>{cart.itemCount} items</span></div><div className="cart-page-grid"><div className="cart-page-items">{cart.items.map(item => <CartLine key={item.lineId} item={item} onUpdate={updateQuantity} onRemove={removeItem} />)}<Link href="/shop" className="text-link">Continue shopping <ArrowRight size={15} /></Link></div><OrderSummary cart={cart} loading={loading} onCheckout={proceedToCheckout} /></div></section>;
}

function OrderSummary({ cart, loading, onCheckout }: { cart: NonNullable<ReturnType<typeof useCart>["cart"]>; loading: boolean; onCheckout: () => void }) {
  return <aside className="order-summary glass-card"><p className="eyebrow">Summary</p><h2>Almost yours.</h2><div className="summary-row"><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div><div className="summary-row muted"><span>Shipping</span><span>Calculated at checkout</span></div><div className="summary-total"><span>Total</span><strong>{money(cart.total)}</strong></div><button className="button button-dark wide-button" disabled={loading} onClick={onCheckout}>Proceed to checkout <ArrowRight size={16} /></button><p className="secure-note"><Check size={14} /> Secure checkout by Shopify</p></aside>;
}

export function CheckoutPage() {
  const { cart, proceedToCheckout } = useCart();
  const [shipping, setShipping] = useState("standard");
  if (!cart?.items.length) return <EmptyCatalog message="Add something to your bag before checkout." />;
  return <section className="checkout-page page-section"><div className="breadcrumbs"><Link href="/cart">Your bag</Link><span>/</span><span>Checkout</span></div><div className="checkout-grid"><form className="checkout-form" onSubmit={event => { event.preventDefault(); proceedToCheckout(); }}><p className="eyebrow">Northgardens checkout</p><h1>Settle in.</h1><p className="checkout-copy">We’ll hand you over to Shopify for secure payment and final delivery details.</p><div className="form-section"><div className="form-section-head"><span>01</span><h2>Contact</h2></div><div className="form-grid"><label>Email address<input required type="email" placeholder="you@example.com" /></label><label>Phone <span>(optional)</span><input type="tel" placeholder="+1 555 000 0000" /></label></div></div><div className="form-section"><div className="form-section-head"><span>02</span><h2>Delivery</h2></div><div className="form-grid"><label>First name<input required placeholder="First name" /></label><label>Last name<input required placeholder="Last name" /></label><label className="full-field">Address<input required placeholder="Street and number" /></label><label>City<input required placeholder="City" /></label><label>Postal code<input required placeholder="Postal code" /></label></div></div><div className="form-section"><div className="form-section-head"><span>03</span><h2>Shipping</h2></div><div className="shipping-options"><label className={shipping === "standard" ? "selected" : ""}><input type="radio" name="shipping" checked={shipping === "standard"} onChange={() => setShipping("standard")} /><span><strong>Standard</strong><small>3–5 business days</small></span><b>Free</b></label><label className={shipping === "express" ? "selected" : ""}><input type="radio" name="shipping" checked={shipping === "express"} onChange={() => setShipping("express")} /><span><strong>Express</strong><small>1–2 business days</small></span><b>$18</b></label></div></div><button className="button button-dark wide-button" type="submit">Continue to secure payment <ArrowRight size={16} /></button></form><aside className="checkout-summary glass-card"><p className="eyebrow">Your order</p>{cart.items.map(item => <div className="checkout-item" key={item.lineId}><img src={item.image?.url} alt="" /><span>{item.productTitle}<small>Qty {item.quantity}</small></span><strong>{money(item.lineTotal)}</strong></div>)}<div className="summary-total"><span>Total</span><strong>{money(cart.total)}</strong></div><p className="secure-note"><Check size={14} /> You’ll complete payment securely on Shopify.</p></aside></div></section>;
}

export function WishlistPage() {
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 50 });
  const { items } = useWishlist();
  const saved = products.filter(product => items.includes(product.handle));
  return <><PageIntro eyebrow="Your saved objects" title={<>Keep the ones<br /><em>that stay with you.</em></>} copy="A small shelf for pieces you’re not ready to forget." /><section className="page-section">{isLoading ? <ProductSkeletons /> : saved.length ? <div className="product-grid">{saved.map(product => <ProductCard key={product.id} product={product} onQuickView={() => undefined} />)}</div> : <div className="empty-catalog"><Heart size={22} /><h3>Nothing saved yet.</h3><Link href="/shop" className="text-link">Browse the shop <ArrowRight size={15} /></Link></div>}</section></>;
}

export function InfoPage({ kind }: { kind: "about" | "journal" | "contact" | "faq" }) {
  const content = {
    about: { eyebrow: "Our story", title: <>Made for the<br /><em>long way home.</em></>, intro: "Northgardens is a small edit of warm, useful objects — chosen to make the everyday feel considered.", body: "We believe a home becomes yours through the things you return to: the cup that fits your hand, the throw that softens with use, the bowl that comes out for every shared meal. We look for those pieces in quiet studios, small workshops, and makers who care about the details no one rushes past." },
    journal: { eyebrow: "The journal", title: <>Notes from the<br /><em>turning season.</em>,</>, intro: "A field guide to slower rooms, warmer light, and the objects that make both feel possible.", body: "The garden is changing by the day. We’re gathering the colours, textures, and rituals that help a home change with it — from the ember tone of a hand-thrown vase to the calm of fresh linen folded at the end of the day." },
    contact: { eyebrow: "Come say hello", title: <>A good place<br /><em>to begin.</em></>, intro: "Questions about an object, a delivery, or what to choose next? We’re here.", body: "Write to hello@northgardens.example and a real person from our small studio will get back to you within two business days. For order questions, include your order number so we can find the right thread." },
    faq: { eyebrow: "Frequently asked", title: <>The little<br /><em>helpful things.</em></>, intro: "A few answers before your object finds its way to you.", body: "Orders ship within 2–3 business days. Returns are welcome within 30 days of delivery, provided the piece is unused and in its original condition. Shipping is complimentary on orders over $150." },
  }[kind];
  return <section className="info-page page-section"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="info-intro">{content.intro}</p><div className="info-rule" /><p className="info-body">{content.body}</p><Link href={kind === "about" ? "/shop" : "/contact"} className="button button-dark">{kind === "about" ? "Shop the edit" : "Get in touch"} <ArrowRight size={16} /></Link></section>;
}

function PageLoader() { return <div className="page-loader"><div className="loader-ring" /><p>Gathering the good things…</p></div>; }
export function NotFoundPage() { return <div className="not-found page-section"><p className="eyebrow">404 / A small detour</p><h1>That path is<br /><em>overgrown.</em></h1><Link href="/" className="button button-dark">Return home <ArrowRight size={16} /></Link></div>; }
