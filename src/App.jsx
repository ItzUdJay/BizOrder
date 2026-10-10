import { useState } from "react";
import products from "./data/Product";

function App() {
  // CART STATE
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState("");

  // CART LIMITS
  const MAX_QUANTITY_PER_PRODUCT = 5;
  const MAX_DIFFERENT_PRODUCTS = 10;

  // WHATSAPP NUMBER: international format without the first zero or +
  const whatsappNumber = "2349017928914";

  // ADD A PRODUCT TO THE CART
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      if (existingProduct.quantity >= MAX_QUANTITY_PER_PRODUCT) {
        alert(`You can only order ${MAX_QUANTITY_PER_PRODUCT} of this product.`);
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      return;
    }

    if (cart.length >= MAX_DIFFERENT_PRODUCTS) {
      alert(`You can only add ${MAX_DIFFERENT_PRODUCTS} different products to your cart.`);
      return;
    }

    setCart([...cart, { ...product, quantity: 1 }]);
  };

  // INCREASE CART QUANTITY
  const increaseQuantity = (productId) => {
    const product = cart.find((item) => item.id === productId);
    if (!product) return;

    if (product.quantity >= MAX_QUANTITY_PER_PRODUCT) {
      alert(`Maximum quantity is ${MAX_QUANTITY_PER_PRODUCT}.`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // DECREASE CART QUANTITY
  const decreaseQuantity = (productId) => {
    setCart(
      cart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // REMOVE ONE PRODUCT FROM THE CART
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // CLEAR THE CART
  const clearCart = () => setCart([]);

  // TOTAL NUMBER OF ITEMS IN THE CART
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // TOTAL PRICE OF THE CART
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // SEARCH PRODUCTS
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // OPEN WHATSAPP TO ORDER ONE PRODUCT DIRECTLY, WITHOUT USING THE CART
  const orderProductOnWhatsApp = (product) => {
    const message = `Hello FreshBite 👋

Hello, I'm interested in ordering this product:

Product: ${product.name}
Quantity: 1
Price: ₦${product.price.toLocaleString()}

Please confirm availability. Thank you!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // OPEN WHATSAPP TO ORDER EVERYTHING IN THE CART
  const orderOnWhatsApp = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add a product first.");
      return;
    }

    const orderItems = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} × ${item.quantity} - ₦${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

    const message = `Hello FreshBite 👋

I would like to order:

${orderItems}

Total: ₦${totalPrice.toLocaleString()}

Please confirm my order. Thank you!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const closeMobileMenu = () => setShowMenu(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a
            href="#home"
            onClick={closeMobileMenu}
            className="text-2xl font-bold text-green-600"
          >
            FreshBite
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-gray-700 transition hover:text-green-600">Home</a>
            <a href="#products" className="text-gray-700 transition hover:text-green-600">Products</a>
            <a href="#about" className="text-gray-700 transition hover:text-green-600">About</a>
            <a href="#contact" className="text-gray-700 transition hover:text-green-600">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="hidden w-40 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 sm:block md:w-56"
            />

            <button
              onClick={() => setShowCart(true)}
              className="relative rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            >
              🛒 Cart
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-2xl text-gray-700 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={showMenu}
            >
              ☰
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="border-t bg-white md:hidden">
            <div className="space-y-3 px-4 py-4">
              <a href="#home" onClick={closeMobileMenu} className="block rounded-lg px-4 py-3 hover:bg-green-50 hover:text-green-600">🏠 Home</a>
              <a href="#products" onClick={closeMobileMenu} className="block rounded-lg px-4 py-3 hover:bg-green-50 hover:text-green-600">🛍️ Products</a>
              <a href="#about" onClick={closeMobileMenu} className="block rounded-lg px-4 py-3 hover:bg-green-50 hover:text-green-600">ℹ️ About</a>
              <a href="#contact" onClick={closeMobileMenu} className="block rounded-lg px-4 py-3 hover:bg-green-50 hover:text-green-600">📞 Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* HOME */}
      <section id="home" className="bg-green-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-3xl">
            <p className="mb-3 font-semibold text-green-600">Welcome to BizOrder 👋</p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Fresh Food,<span className="text-green-600"> Delivered Simply</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Get delicious meals and refreshing drinks without complicated ordering. Choose your favorite products and order directly through WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#products" className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">Shop Now</a>
              <a href="#about" className="rounded-lg border border-green-600 px-6 py-3 font-semibold text-green-600 transition hover:bg-green-100">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <p className="font-semibold text-green-600">Why BizOrder?</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Simple. Fast. Convenient.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-green-50 p-6 text-center">
              <div className="mb-4 text-4xl">🍽️</div>
              <h3 className="text-xl font-bold">Quality Food</h3>
              <p className="mt-3 text-gray-600">Enjoy delicious meals made with care and quality ingredients.</p>
            </div>
            <div className="rounded-xl bg-green-50 p-6 text-center">
              <div className="mb-4 text-4xl">⚡</div>
              <h3 className="text-xl font-bold">Easy Ordering</h3>
              <p className="mt-3 text-gray-600">Add products to your cart or order one product directly through WhatsApp.</p>
            </div>
            <div className="rounded-xl bg-green-50 p-6 text-center">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="text-xl font-bold">Direct Communication</h3>
              <p className="mt-3 text-gray-600">Talk directly with us through WhatsApp about your order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <p className="font-semibold text-green-600">Our Menu</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Browse Our Products</h2>
          <p className="mt-2 text-gray-500">Add products to your cart or order directly on WhatsApp.</p>
        </div>

        {/* SEARCH ON SMALL SCREENS */}
        <div className="mb-6 sm:hidden">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl">🔍</p>
            <h3 className="mt-4 text-xl font-semibold">No products found</h3>
            <p className="mt-2 text-gray-500">Try searching for another product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              const quantity = cartItem?.quantity || 0;

              return (
                <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50 text-7xl">
                    {product.image}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  <p className="mt-3 text-xl font-bold text-green-600">₦{product.price.toLocaleString()}</p>

                  {quantity > 0 && (
                    <p className="mt-2 text-sm text-gray-500">In cart: {quantity}</p>
                  )}

                  <button
                    onClick={() => addToCart(product)}
                    disabled={quantity >= MAX_QUANTITY_PER_PRODUCT}
                    className={`mt-4 w-full rounded-lg py-2.5 font-medium text-white transition ${
                      quantity >= MAX_QUANTITY_PER_PRODUCT
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {quantity >= MAX_QUANTITY_PER_PRODUCT ? "Maximum Added" : "Add to Cart"}
                  </button>

                  {/* NEW: ORDER THIS PRODUCT DIRECTLY ON WHATSAPP */}
                  <button
                    onClick={() => orderProductOnWhatsApp(product)}
                    className="mt-2 w-full rounded-lg border border-green-600 py-2.5 font-medium text-green-700 transition hover:bg-green-50"
                  >
                    💬 Order on WhatsApp
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <p className="font-semibold text-green-600">About Us</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Food ordering made simple.</h2>
              <p className="mt-5 leading-relaxed text-gray-600">BizOrder is a simple online food ordering platform designed to make ordering convenient.</p>
              <p className="mt-4 leading-relaxed text-gray-600">Choose products and send your order directly to WhatsApp. You can order one product immediately or add several products to your cart.</p>
              <a href="#products" className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-700">Browse Products</a>
            </div>
            <div className="rounded-2xl bg-green-50 p-8">
              <h3 className="text-2xl font-bold text-gray-900">What we offer</h3>
              <div className="mt-6 space-y-5">
                <div className="flex gap-4"><span className="text-2xl">✓</span><div><h4 className="font-semibold">Easy ordering</h4><p className="mt-1 text-sm text-gray-600">Select products and add them to your cart.</p></div></div>
                <div className="flex gap-4"><span className="text-2xl">✓</span><div><h4 className="font-semibold">Direct WhatsApp ordering</h4><p className="mt-1 text-sm text-gray-600">Order a single product without using the cart.</p></div></div>
                <div className="flex gap-4"><span className="text-2xl">✓</span><div><h4 className="font-semibold">Simple experience</h4><p className="mt-1 text-sm text-gray-600">No complicated checkout process.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-green-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <p className="font-semibold text-green-600">Get In Touch</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Have a question?</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600">Need help with an order or want to ask us something? Contact us directly on WhatsApp.</p>
            <button
              onClick={() => {
                const message = "Hello FreshBite 👋 I have a question about your products.";
                window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
              }}
              className="mt-8 rounded-lg bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              💬 Chat With Us
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-sm"><div className="text-3xl">📱</div><h3 className="mt-3 font-bold">WhatsApp</h3><p className="mt-2 text-gray-500">09017928914</p></div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm"><div className="text-3xl">🕐</div><h3 className="mt-3 font-bold">Opening Hours</h3><p className="mt-2 text-gray-500">Contact us to confirm</p></div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm"><div className="text-3xl">📍</div><h3 className="mt-3 font-bold">Location</h3><p className="mt-2 text-gray-500">Nigeria</p></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div><h2 className="text-xl font-bold text-green-400">BizOrder</h2><p className="mt-3 text-gray-400">Fresh food. Simple ordering.</p></div>
            <div><h3 className="font-semibold">Quick Links</h3><div className="mt-3 flex flex-col gap-2"><a href="#home" className="text-gray-400 hover:text-white">Home</a><a href="#products" className="text-gray-400 hover:text-white">Products</a><a href="#about" className="text-gray-400 hover:text-white">About</a><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></div></div>
            <div><h3 className="font-semibold">Contact</h3><p className="mt-3 text-gray-400">WhatsApp: 09017928914</p></div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 text-center"><p className="text-sm text-gray-500">© 2026 FreshBite. All rights reserved.</p></div>
        </div>
      </footer>

      {/* CART DRAWER */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowCart(false);
          }}
        >
          <div className="absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-xl sm:max-w-md">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-sm text-gray-500">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setShowCart(false)} className="text-3xl text-gray-500 hover:text-gray-900" aria-label="Close cart">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="mb-4 text-5xl">🛒</p>
                  <h3 className="text-lg font-semibold">Your cart is empty</h3>
                  <p className="mt-2 text-gray-500">Add some products to get started.</p>
                  <button onClick={() => setShowCart(false)} className="mt-6 rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cart.map((item) => (
                    <div key={item.id} className="border-b pb-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50 text-3xl">{item.image}</div>
                          <div><h3 className="font-semibold text-gray-900">{item.name}</h3><p className="font-medium text-green-600">₦{item.price.toLocaleString()}</p></div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                          <button onClick={() => decreaseQuantity(item.id)} className="bg-gray-100 px-4 py-2 text-lg hover:bg-gray-200" aria-label={`Decrease ${item.name} quantity`}>−</button>
                          <span className="px-5 py-2 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            disabled={item.quantity >= MAX_QUANTITY_PER_PRODUCT}
                            className={`px-4 py-2 text-lg ${item.quantity >= MAX_QUANTITY_PER_PRODUCT ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-gray-100 hover:bg-gray-200"}`}
                            aria-label={`Increase ${item.name} quantity`}
                          >+</button>
                        </div>
                        <p className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-5">
                <div className="mb-5 flex justify-between text-lg font-bold"><span>Total</span><span className="text-green-600">₦{totalPrice.toLocaleString()}</span></div>
                <button onClick={clearCart} className="mb-3 w-full rounded-lg border border-red-500 py-2.5 text-red-500 transition hover:bg-red-50">Clear Cart</button>
                <button onClick={orderOnWhatsApp} className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700">📱 Order Cart on WhatsApp</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
  
