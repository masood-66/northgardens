import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { InfoPage, CartPage, CheckoutPage, HomePage, NotFoundPage, ProductPage, ShopPage, StorefrontShell, WishlistPage } from "./components/storefront/NorthgardensStorefront";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <StorefrontShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/product/:handle" component={ProductPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/about"><InfoPage kind="about" /></Route>
        <Route path="/journal"><InfoPage kind="journal" /></Route>
        <Route path="/contact"><InfoPage kind="contact" /></Route>
        <Route path="/faq"><InfoPage kind="faq" /></Route>
        <Route component={NotFoundPage} />
      </Switch>
    </StorefrontShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <CartProvider>
            <Toaster position="bottom-right" />
            <Router />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
