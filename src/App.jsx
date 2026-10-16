
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { loadProducts } from "./loadProducts";
import AdminDashBoard from "./admin/AdminDashBoard";

const WHATSAPP_NUMBER = "2349017928914";
const MAX_QUANTITY_PER_PRODUCT = 5;
const MAX_DIFFERENT_PRODUCTS = 10;

function Store() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);


  // Close the image viewer when the Escape key is pressed.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setZoomedImage(null);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Load products from Firebase when the shop opens.
  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        setProductError("");

        const data = await loadProducts();

        if (active) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Could not load products:", error);

        if (active) {
          setProductError(
            "We could not load the products. Please refresh the page and try again."
          );
        }
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  // Search by product name or category.
  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText)
    );
  });

  // Calculate the total price and number of items.
  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Add a product to the cart.
  function addToCart(product) {
    setCartMessage("");

    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      if (
        existingItem.quantity >= MAX_QUANTITY_PER_PRODUCT
      ) {
        setCartMessage(
          `You can order a maximum of ${MAX_QUANTITY_PER_PRODUCT} of each product.`
        );
        return;
      }

      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );

      return;
    }

    if (cart.length >= MAX_DIFFERENT_PRODUCTS) {
      setCartMessage(
        `Your cart can contain up to ${MAX_DIFFERENT_PRODUCTS} different products.`
      );
      return;
    }

    setCart((currentCart) => [
      ...currentCart,
      {
        ...product,
        price: Number(product.price),
        quantity: 1,
      },
    ]);
  }

  // Increase a product's quantity.
  function increaseQuantity(productId) {
    setCartMessage("");

    const item = cart.find(
      (product) => product.id === productId
    );

    if (!item) return;

    if (item.quantity >= MAX_QUANTITY_PER_PRODUCT) {
      setCartMessage(
        `You can order a maximum of ${MAX_QUANTITY_PER_PRODUCT} of each product.`
      );
      return;
    }

    setCart((currentCart) =>
      currentCart.map((product) =>
        product.id === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  }

  // Decrease quantity. Remove the product if quantity reaches zero.
  function decreaseQuantity(productId) {
    setCartMessage("");

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove a product completely.
  function removeFromCart(productId) {
    setCartMessage("");

    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }

  // Order one product directly through WhatsApp.
  function orderProduct(product) {
    const price = Number(product.price);

    const message = [
      "Hello, I'm ordering from BizOrder.",
      "",
      `Product: ${product.name}`,
      `Price: ₦${price.toLocaleString("en-NG")}`,
      "Quantity: 1",
      `Total: ₦${price.toLocaleString("en-NG")}`,
      "",
      "Please confirm my order. Thank you.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  // Send every cart item and the total to WhatsApp.
  function orderCart() {
    if (cart.length === 0) {
      setCartMessage("Your cart is empty. Add a product first.");
      return;
    }

    const productLines = cart.map(
      (item) =>
        `${item.name} x ${item.quantity} = ₦${(
          Number(item.price) * item.quantity
        ).toLocaleString("en-NG")}`
    );

    const message = [
      "Hello, I'm placing an order from BizOrder.",
      "",
      ...productLines,
      "",
      `Total: ₦${cartTotal.toLocaleString("en-NG")}`,
      "",
      "Please confirm my order. Thank you.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
    


{/* Navigation */}
<header className="sticky top-0 z-40 border-b bg-white shadow-sm">
  <nav className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-3 bg-green-700 px-4 py-4">
    {/* Store name */}
    <a
      href="#home"
      onClick={() => setMenuOpen(false)}
      className="text-2xl font-extrabold text-white"
    >
      BizOrder
    </a>

    {/* Cart stays visible outside the mobile menu */}
    <div className="ml-auto flex items-center gap-2 sm:ml-0">
      <a
        href="#cart"
        aria-label={`Shopping cart with ${totalItems} items`}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 font-bold text-white shadow transition hover:bg-red-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span>Cart</span>
        <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-red-600">
          {totalItems}
        </span>
      </a>

      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-green-500 text-white transition hover:bg-green-600 sm:hidden"
      >
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>

    {/* Navigation links: dropdown on mobile, horizontal on desktop */}
    <div
      id="mobile-navigation"
      className={`${
        menuOpen ? "flex" : "hidden"
      } w-full flex-col gap-1 border-t border-green-600 pt-3 text-sm font-medium sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-5 sm:border-0 sm:pt-0`}
    >
      <a
        href="#home"
        onClick={() => setMenuOpen(false)}
        className="rounded-lg px-3 py-2 text-white transition hover:bg-green-600"
      >
        Home
      </a>

      <a
        href="#products"
        onClick={() => setMenuOpen(false)}
        className="rounded-lg px-3 py-2 text-white transition hover:bg-green-600"
      >
        Products
      </a>

      <a
        href="#about"
        onClick={() => setMenuOpen(false)}
        className="rounded-lg px-3 py-2 text-white transition hover:bg-green-600"
      >
        About Us
      </a>

      <a
        href="#contact"
        onClick={() => setMenuOpen(false)}
        className="rounded-lg px-3 py-2 text-white transition hover:bg-green-600"
      >
        Contact Us
      </a>

      <Link
        to="/admin"
        onClick={() => setMenuOpen(false)}
        className="rounded-full bg-white px-4 py-2 text-center font-semibold text-red-600 transition hover:bg-gray-100"
      >
        Admin
      </Link>
    </div>
  </nav>
</header>


      {/* Hero section */}
      <section
        id="home"
        className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-16 text-white sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 font-semibold uppercase tracking-widest text-green-100">
            Welcome to BizOrder
          </p>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Order your favourites with ease.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-green-50">
            Browse our products, add your favourites to your
            cart, and send your order directly through WhatsApp.
          </p>

          <a
            href="#products"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-bold text-green-800 transition hover:bg-green-50"
          >
            Explore Products
          </a>
        </div>
      </section>

      {/* Products section */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-4 py-12"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold">Our Products</h2>
            <p className="mt-2 text-gray-600">
              Find what you want and order directly.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-green-600 sm:max-w-sm"
          />
        </div>

        {loadingProducts && (
          <p className="py-10 text-center text-gray-600">
            Loading products...
          </p>
        )}

        {!loadingProducts && productError && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {productError}
          </div>
        )}

        {!loadingProducts &&
          !productError &&
          filteredProducts.length === 0 && (
            <p className="rounded-lg bg-white p-8 text-center text-gray-600">
              {search
                ? "No products match your search."
                : "No products are available yet."}
            </p>
          )}

       
{!loadingProducts &&
  !productError &&
  filteredProducts.length > 0 && (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((item) => (
        <article
          key={item.id}
          className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          {/* Product Image: tap to view the full image */}
          <div className="h-64 w-full overflow-hidden bg-gray-100 sm:h-72">
            {item.image ? (
              <button
                type="button"
                onClick={() => setZoomedImage(item)}
                aria-label={`View a larger image of ${item.name}`}
                className="group relative flex h-full w-full cursor-zoom-in items-center justify-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                  Tap to zoom 🔍
                </span>
              </button>
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">
                🛍️
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-1 flex-col p-5">
            <p className="text-sm font-medium text-green-700">
              {ClipboardItem.category || "Product"}
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {item.name}
            </h3>

            <p className="mt-3 text-2xl font-extrabold text-gray-900">
              ₦{Number(item.price).toLocaleString("en-NG")}
            </p>

            {/* Order Buttons */}
            <div className="mt-auto flex flex-col gap-3 pt-5">
              <button
                type="button"
                onClick={() => addToCart(item)}
                className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
              >
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => orderProduct(item)}
                className="w-full rounded-lg border border-green-700 px-4 py-3 font-semibold text-green-800 transition hover:bg-green-50"
              >
                Order on WhatsApp
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )}

{/* About Us Section */}
<section
  id="about"
  className="scroll-mt-24 bg-gray-50 px-6 py-16 sm:px-10 lg:px-16"
>
  <div className="mx-auto max-w-5xl">
    <p className="font-semibold uppercase tracking-widest text-green-700">
      About BizOrder
    </p>

    <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
      Your Style. Your Choice. Your Order.
    </h2>

    <div className="mt-6 max-w-3xl space-y-4 text-base leading-8 text-gray-600">
      <p>
        Welcome to BizOrder, your convenient destination for
        clothing shopping. We make it easy to explore available
        clothes, check prices, and order your preferred items
        without unnecessary stress.
      </p>

      <p>
        We believe clothing is more than what you wear. It is a
        way to express your personality, confidence, and unique
        sense of style.
      </p>

      <p>
        Our goal is to give you a simple shopping experience.
        Browse our available clothing, choose what you like,
        and contact us on WhatsApp to ask questions or place
        your order.
      </p>
    </div>

    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-3xl">👕</div>

        <h3 className="mt-3 text-xl font-bold text-gray-900">
          Explore Your Style
        </h3>

        <p className="mt-2 leading-7 text-gray-600">
          Discover the clothing items available in our store
          and find options that suit your personal style.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-3xl">💬</div>

        <h3 className="mt-3 text-xl font-bold text-gray-900">
          Shopping Made Simple
        </h3>

        <p className="mt-2 leading-7 text-gray-600">
          Have a question about an item? Reach us directly
          through WhatsApp for assistance with your order.
        </p>
      </div>
    </div>

    <a
      href="#products"
      className="mt-8 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
    >
      Explore Our Collection
    </a>
  </div>
</section>

      </section>


{/* Contact Us Section */}
<section
  id="contact"
  className="scroll-mt-24 bg-white px-6 py-16 sm:px-10 lg:px-16"
>
  <div className="mx-auto max-w-4xl rounded-2xl bg-green-50 px-6 py-10 text-center sm:px-12 sm:py-14">
    <p className="font-semibold uppercase tracking-widest text-green-700">
      Contact Us
    </p>

    <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
      We're Here to Help
    </h2>

    <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-600">
      Do you have a question about our clothing, prices,
      available items, or an order? Send us a message on
      WhatsApp. We'd be happy to hear from you.
    </p>

    <a
      href="https://wa.me/2349017928914?text=Hello%2C%20I%27m%20chatting%20from%20BizOrder.%20I%20have%20a%20question%20about%20your%20clothing%20products."
      target="_blank"
      rel="noopener noreferrer"
      className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-800"
    >
      <icon name="message-circle" size="lg" />
      Chat with Us on WhatsApp
    </a>

    <p className="mt-4 text-sm text-gray-500">
      We look forward to hearing from you.
    </p>
  </div>
</section>
      {/* Cart section */}
      <section id="cart" className="bg-white px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold">Your Cart 🛒</h2>

          <p className="mt-2 text-gray-600">
            You can add up to {MAX_QUANTITY_PER_PRODUCT} of each
            product and {MAX_DIFFERENT_PRODUCTS} different products.
          </p>

          {cartMessage && (
            <p
              role="status"
              className="mt-5 rounded-lg bg-amber-50 p-3 text-amber-800"
            >
              {cartMessage}
            </p>
          )}

          {cart.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
              <p className="text-lg text-gray-600">
                Your cart is empty.
              </p>

              <a
                href="#products"
                className="mt-4 inline-block font-semibold text-green-700 hover:underline"
              >
                Browse products
              </a>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-green-50 text-3xl">
                        {item.image || "🛍️"}
                      </div>

                      <div>
                        <h3 className="font-bold">{item.name}</h3>

                        <p className="text-sm text-gray-600">
                          ₦{Number(item.price).toLocaleString("en-NG")} each
                        </p>

                        <p className="mt-1 font-semibold">
                          Subtotal: ₦{(
                            Number(item.price) * item.quantity
                          ).toLocaleString("en-NG")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="h-10 w-10 rounded-lg border font-bold hover:bg-gray-100"
                      >
                        −
                      </button>

                      <span className="min-w-8 text-center font-bold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="h-10 w-10 rounded-lg border font-bold hover:bg-gray-100"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-gray-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-extrabold text-green-800">
                    ₦{cartTotal.toLocaleString("en-NG")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={orderCart}
                  className="mt-6 w-full rounded-lg bg-green-700 px-5 py-4 font-bold text-white transition hover:bg-green-800"
                >
                  Complete Order on WhatsApp
                </button>

                <p className="mt-3 text-center text-sm text-gray-500">
                  Your order details will be sent to WhatsApp for
                  confirmation.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

{/* Footer */}
<footer className="bg-gray-950 px-6 py-12 text-white sm:px-10">
  <div className="mx-auto max-w-7xl">

    {/* Footer Heading */}
    <div className="mb-10">
      <a
        href="#home"
        className="text-3xl font-extrabold text-green-400"
      >
        BizOrder
      </a>

      <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
        Shop your favourite products with ease.
        Browse our collection and place your orders conveniently
        through WhatsApp.
      </p>
    </div>

    {/* Footer Menus */}
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

      {/* Quick Links */}
      <div>
        <h3 className="mb-4 font-bold">Quick Links</h3>

        <ul className="space-y-3 text-sm text-gray-400">
          <li>
            <a href="#home" className="transition hover:text-green-400">
              Home
            </a>
          </li>

          <li>
            <a href="#products" className="transition hover:text-green-400">
              Products
            </a>
          </li>

          <li>
            <a href="#about" className="transition hover:text-green-400">
              About Us
            </a>
          </li>

          <li>
            <a href="#contact" className="transition hover:text-green-400">
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      {/* Customer Service */}
      <div>
        <h3 className="mb-4 font-bold">Customer Service</h3>

        <ul className="space-y-3 text-sm text-gray-400">
          <li>
            <a href="#contact" className="transition hover:text-green-400">
              Contact Support
            </a>
          </li>

          <li>
            <a
              href="https://wa.me/2349017928914"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-green-400"
            >
              WhatsApp Support
            </a>
          </li>

          <li>
            <a href="#cart" className="transition hover:text-green-400">
              Shopping Cart
            </a>
          </li>
        </ul>
      </div>

      {/* My Account */}
      <div>
        <h3 className="mb-4 font-bold">My Account</h3>

        <ul className="space-y-3 text-sm text-gray-400">
          <li>
            <a href="#cart" className="transition hover:text-green-400">
              My Cart
            </a>
          </li>

          <li>
            <Link
              to="/admin"
              className="transition hover:text-green-400"
            >
              Admin Dashboard
            </Link>
          </li>
        </ul>
      </div>

      {/* Follow Us */}
      <div>
        <h3 className="mb-4 font-bold">Follow Us</h3>

        <ul className="space-y-3 text-sm text-gray-400">
          <li>
            <a
              href="https://wa.me/2349017928914"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-green-400"
            >
              WhatsApp
            </a>
          </li>

          <li>
            <a href="#contact" className="transition hover:text-green-400">
              Get in Touch
            </a>
          </li>
        </ul>
      </div>

    </div>

    {/* Copyright */}
    <div className="mt-10 border-t border-gray-800 pt-6 text-center">
      <p className="text-sm text-gray-400">
        © {new Date().getFullYear()} BizOrder. All rights reserved.
      </p>

      <a
        href="#home"
        className="mt-3 inline-block text-sm text-green-400 hover:text-green-300"
      >
        Back to Top ↑
      </a>
    </div>

  </div>
</footer>

      {/* Full-screen product image viewer */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Large image of ${zoomedImage.name}`}
          onClick={() => setZoomedImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            aria-label="Close enlarged image"
            className="absolute right-4 top-4 z-[101] flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl font-bold text-gray-900 shadow-lg transition hover:bg-gray-200"
          >
            ×
          </button>
          <div
            className="flex max-h-full max-w-5xl flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={zoomedImage.image}
              alt={zoomedImage.name}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <p className="text-center text-lg font-semibold text-white">
              {zoomedImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>

      <p className="mt-3 text-gray-600">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-5 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
      >
        Return to BizOrder
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/admin" element={<AdminDashBoard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
