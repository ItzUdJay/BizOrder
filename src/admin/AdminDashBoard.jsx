

import { useEffect, useState } from "react";

import {

  onAuthStateChanged,

  signInWithEmailAndPassword,

  signOut,

} from "firebase/auth";

import {

  addDoc,

  collection,

  deleteDoc,

  doc,

  getDoc,

  onSnapshot,

  updateDoc,

} from "firebase/firestore";

import { auth, db } from "../firebase";



const emptyProduct = {

  name: "",

  price: "",

  category: "Food",

  description: "",

  image: "",

};



export default function AdminDashBoard() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);



  const [user, setUser] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");



  const [products, setProducts] = useState([]);

  const [productsLoading, setProductsLoading] = useState(false);

  const [productForm, setProductForm] = useState(emptyProduct);

  const [editingId, setEditingId] = useState(null);

  const [savingProduct, setSavingProduct] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);



  // Verify administrator access.

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (!currentUser) {

        setUser(null);

        setIsAdmin(false);

        setLoading(false);

        return;

      }



      setLoading(true);



      try {

        const adminRef = doc(db, "admins", currentUser.uid);

        const adminSnapshot = await getDoc(adminRef);



        const allowed =

          adminSnapshot.exists() &&

          adminSnapshot.data().admin === true;



        if (allowed) {

          setUser(currentUser);

          setIsAdmin(true);

          setMessage("");

        } else {

          setUser(null);

          setIsAdmin(false);

          setMessage("This account does not have administrator permission.");

          await signOut(auth);

        }

      } catch (error) {

        console.error("Admin verification error:", error);

        setUser(null);

        setIsAdmin(false);

        setMessage("Could not verify administrator permission.");

        await signOut(auth);

      } finally {

        setLoading(false);

      }

    });



    return () => unsubscribe();

  }, []);



  // Listen for product changes in Firestore.

  useEffect(() => {

    if (!user || !isAdmin) return;



    setProductsLoading(true);



    const unsubscribe = onSnapshot(

      collection(db, "products"),

      (snapshot) => {

        setProducts(

          snapshot.docs.map((item) => ({

            id: item.id,

            ...item.data(),

          }))

        );

        setProductsLoading(false);

      },

      (error) => {

        console.error("Products loading error:", error);

        setMessage("Could not load products. Check your connection and Firebase rules.");

        setProductsLoading(false);

      }

    );



    return () => unsubscribe();

  }, [user, isAdmin]);



  async function handleLogin(event) {

    event.preventDefault();

    setMessage("");

    setSubmitting(true);



    try {

      await signInWithEmailAndPassword(auth, email.trim(), password);

    } catch (error) {

      console.error("Admin login error:", error);



      if (

        error.code === "auth/invalid-credential" ||

        error.code === "auth/wrong-password" ||

        error.code === "auth/user-not-found"

      ) {

        setMessage("Incorrect email or password.");

      } else if (error.code === "auth/too-many-requests") {

        setMessage("Too many login attempts. Please wait and try again.");

      } else if (error.code === "auth/invalid-email") {

        setMessage("Please enter a valid email address.");

      } else if (error.code === "auth/network-request-failed") {

        setMessage("Network error. Check your internet connection.");

      } else {

        setMessage("Login failed. Please check your details and try again.");

      }

    } finally {

      setSubmitting(false);

    }

  }



  async function handleLogout() {

    setMessage("");



    try {

      await signOut(auth);

      setEmail("");

      setPassword("");

      setShowPassword(false);

      setProductForm(emptyProduct);

      setEditingId(null);

    } catch (error) {

      console.error("Logout error:", error);

      setMessage("Could not log out. Please try again.");

    }

  }



  function handleProductChange(event) {

    const { name, value } = event.target;



    setProductForm((current) => ({

      ...current,

      [name]: value,

    }));

  }



  // Cloudinary unsigned upload settings.
  const CLOUDINARY_CLOUD_NAME = "g4g6dgyp";
  const CLOUDINARY_UPLOAD_PRESET = "bizorder_uploads";

  function selectProductImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image must be 10 MB or smaller.");
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  }

  function handleImagePaste(event) {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (!imageItem) {
      setMessage("No image found. Copy an image first, then press Ctrl + V in the image box.");
      return;
    }

    event.preventDefault();
    const file = imageItem.getAsFile();

    if (file) selectProductImage(file);
  }

  async function uploadProductImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
      console.error("Cloudinary upload error:", result);
      throw new Error(result.error?.message || "Image upload failed.");
    }

    return result.secure_url;
  }

  function clearSelectedImage() {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview("");
  }

  async function handleProductSubmit(event) {

    event.preventDefault();

    setMessage("");



    const price = Number(productForm.price);



    if (!productForm.name.trim()) {

      setMessage("Please enter a product name.");

      return;

    }



    if (!Number.isFinite(price) || price <= 0) {

      setMessage("Enter a price greater than zero.");

      return;

    }



    setSavingProduct(true);

    try {
      setUploadingImage(Boolean(selectedImage));

      let imageUrl = productForm.image.trim();
      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage);
      }

      const productData = {
        name: productForm.name.trim(),
        price,
        category: productForm.category,
        description: productForm.description.trim(),
        image: imageUrl,
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        setMessage("Product updated successfully.");
      } else {
        await addDoc(collection(db, "products"), productData);
        setMessage("Product added successfully.");
      }

      clearSelectedImage();
      setProductForm(emptyProduct);
      setEditingId(null);
    } catch (error) {
      console.error("Saving product error:", error);
      setMessage(error.message || "Could not save the product. Please try again.");
    } finally {
      setSavingProduct(false);
      setUploadingImage(false);
    }
  }

  function startEditing(product) {

    setEditingId(product.id);

    setProductForm({

      name: product.name || "",

      price: String(product.price ?? ""),

      category: product.category || "Food",

      description: product.description || "",

      image: product.image || "",

    });



    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });

  }



  function cancelEditing() {

    setEditingId(null);

    setProductForm(emptyProduct);

    setMessage("");

  }



  async function handleDelete(product) {

    const confirmed = window.confirm(

      `Are you sure you want to delete "${product.name}"?`

    );



    if (!confirmed) return;



    setMessage("");



    try {

      await deleteDoc(doc(db, "products", product.id));



      if (editingId === product.id) {

        cancelEditing();

      }



      setMessage("Product deleted successfully.");

    } catch (error) {

      console.error("Deleting product error:", error);

      setMessage("Could not delete the product. Check your admin permission.");

    }

  }



  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <p className="text-lg font-medium text-gray-600">

          Checking administrator access...

        </p>

      </div>

    );

  }



  if (user && isAdmin) {

    return (

      <div className="min-h-screen bg-gray-100">

        <header className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-5 shadow-sm">

          <div>

            <h1 className="text-2xl font-bold text-green-700">

              BizOrder Admin

            </h1>

            <p className="mt-1 text-sm text-gray-500">

              Welcome, {user.email}

            </p>

          </div>



          <button

            type="button"

            onClick={handleLogout}

            className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"

          >

            Logout

          </button>

        </header>



        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

          {message && (

            <div

              role="status"

              className="mb-6 rounded-lg border border-green-200 bg-white p-4 text-sm text-gray-700"

            >

              {message}

            </div>

          )}



          <section className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-800">

              {editingId ? "Edit Product" : "Add a New Product"}

            </h2>



            <form onSubmit={handleProductSubmit} className="mt-6 space-y-4">

              <div>

                <label htmlFor="product-name" className="mb-1 block font-medium">

                  Product name \*

                </label>

                <input

                  id="product-name"

                  name="name"

                  value={productForm.name}

                  onChange={handleProductChange}

                  placeholder="e.g. Jollof Rice"

                  required

                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"

                />

              </div>



              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label htmlFor="product-price" className="mb-1 block font-medium">

                    Price in naira (₦) \*

                  </label>

                  <input

                    id="product-price"

                    name="price"

                    type="number"

                    min="1"

                    step="0.01"

                    value={productForm.price}

                    onChange={handleProductChange}

                    placeholder="3000"

                    required

                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"

                  />

                </div>



                <div>

                  <label htmlFor="product-category" className="mb-1 block font-medium">

                    Category

                  </label>

                  <select

                    id="product-category"

                    name="category"

                    value={productForm.category}

                    onChange={handleProductChange}

                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"

                  >

                    <option>Food</option>

                    <option>Protein</option>

                    <option>Drinks</option>

                    <option>Snacks</option>

                    <option>Other</option>

                  </select>

                </div>

              </div>



              <div>

                <label htmlFor="product-description" className="mb-1 block font-medium">

                  Description

                </label>

                <textarea

                  id="product-description"

                  name="description"

                  value={productForm.description}

                  onChange={handleProductChange}

                  placeholder="Describe this product"

                  rows={3}

                  className="w-full rounded-lg border border-gray-300 px-4 py-3"

                />

              </div>



              <div className="space-y-3">
                <label className="block font-medium text-gray-800">
                  Product Image
                </label>

                <div
                  tabIndex={0}
                  onPaste={handleImagePaste}
                  aria-label="Paste product image here"
                  className="rounded-xl border-2 border-dashed border-green-400 bg-green-50 p-5 text-center outline-none focus:ring-2 focus:ring-green-500"
                >
                  <p className="font-semibold text-gray-800">Paste an image here</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Copy an image, click inside this box, then press Ctrl + V.
                  </p>
                  <p className="my-3 text-sm text-gray-500">or</p>
                  <label
                    htmlFor="product-image-file"
                    className="inline-block cursor-pointer rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                  >
                    Choose Image
                  </label>
                  <input
                    id="product-image-file"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      selectProductImage(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="product-image-url" className="mb-1 block text-sm font-medium text-gray-700">
                    Or paste an image URL
                  </label>
                  <input
                    id="product-image-url"
                    name="image"
                    type="url"
                    value={productForm.image}
                    onChange={(event) => {
                      clearSelectedImage();
                      handleProductChange(event);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </div>

                {(imagePreview || productForm.image) && (
                  <div className="space-y-2">
                    <img
                      src={imagePreview || productForm.image}
                      alt="Product preview"
                      className="h-48 w-full rounded-lg border border-gray-200 bg-gray-50 object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      onLoad={(event) => {
                        event.currentTarget.style.display = "block";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        clearSelectedImage();
                        setProductForm((current) => ({ ...current, image: "" }));
                      }}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Images up to 10 MB. The image will upload when you save the product.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                <button

                  type="submit"

                  disabled={savingProduct}

                  className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"

                >

                  {savingProduct
                    ? uploadingImage
                      ? "Uploading image..."
                      : "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Add Product"}

                </button>



                {editingId && (

                  <button

                    type="button"

                    onClick={cancelEditing}

                    className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700"

                  >

                    Cancel Edit

                  </button>

                )}

              </div>

            </form>

          </section>



          <section className="mt-8">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

              <h2 className="text-xl font-bold text-gray-800">

                Your Products ({products.length})

              </h2>

            </div>



            {productsLoading ? (

              <p className="text-gray-600">Loading products...</p>

            ) : products.length === 0 ? (

              <div className="rounded-xl bg-white p-6 text-gray-600 shadow-sm">

                No products yet. Add your first product using the form above.

              </div>

            ) : (

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {products.map((product) => (

                  <article

                    key={product.id}

                    className="overflow-hidden rounded-xl bg-white shadow-sm"

                  >
       {product.name}: {product.image}
       
                    {product.image ? (

                    
              


                      <img
                      

                        src={product.image}

                        alt={product.name}

                        className="h-44 w-full object-cover"

                      />

                    ) : (

                      <div className="flex h-44 items-center justify-center bg-green-50 text-5xl">

                        🛍️

                      </div>

                    )}



                    <div className="p-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">

                        {product.category || "Other"}

                      </p>

                      <h3 className="mt-1 text-lg font-bold text-gray-900">

                        {product.name}

                      </h3>

                      <p className="mt-2 font-semibold text-green-800">

                        ₦{Number(product.price || 0).toLocaleString("en-NG")}

                      </p>



                      {product.description && (

                        <p className="mt-2 text-sm text-gray-600">

                          {product.description}

                        </p>

                      )}



                      <div className="mt-5 flex gap-3">

                        <button

                          type="button"

                          onClick={() => startEditing(product)}

                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"

                        >

                          Edit

                        </button>



                        <button

                          type="button"

                          onClick={() => handleDelete(product)}

                          className="flex-1 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700"

                        >

                          Delete

                        </button>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>

        </main>

      </div>

    );

  }



  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

            <svg

              xmlns="http\://www.w3.org/2000/svg"

              width="32"

              height="32"

              viewBox="0 0 24 24"

              fill="none"

              stroke="currentColor"

              strokeWidth="2"

              strokeLinecap="round"

              strokeLinejoin="round"

              className="text-green-700"

              aria-hidden="true"

            >

              <rect x="3" y="11" width="18" height="11" rx="2" />

              <path d="M7 11V7a5 5 0 0110 0v4" />

            </svg>

          </div>



          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>

          <p className="mt-2 text-sm text-gray-500">

            Sign in to manage your BizOrder store.

          </p>

        </div>



        {message && (

          <div

            role="alert"

            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"

          >

            {message}

          </div>

        )}



        <form onSubmit={handleLogin} className="space-y-5">

          <div>

            <label

              htmlFor="admin-email"

              className="mb-2 block font-semibold text-gray-700"

            >

              Email Address

            </label>

            <input

              id="admin-email"

              type="email"

              autoComplete="username"

              value={email}

              onChange={(event) => setEmail(event.target.value)}

              placeholder="Enter your admin email"

              required

              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"

            />

          </div>



          <div>

            <label

              htmlFor="admin-password"

              className="mb-2 block font-semibold text-gray-700"

            >

              Password

            </label>



            <div className="relative">

              <input

                id="admin-password"

                type={showPassword ? "text" : "password"}

                autoComplete="current-password"

                value={password}

                onChange={(event) => setPassword(event.target.value)}

                placeholder="Enter your password"

                required

                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"

              />



              <button

                type="button"

                onClick={() => setShowPassword((previous) => !previous)}

                aria-label={showPassword ? "Hide password" : "Show password"}

                aria-pressed={showPassword}

                title={showPassword ? "Hide password" : "Show password"}

                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-green-700"

              >

                {showPassword ? (

                  <svg

                    xmlns="http\://www.w3.org/2000/svg"

                    width="22"

                    height="22"

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="2"

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    aria-hidden="true"

                  >

                    <path d="M3 3l18 18" />

                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />

                    <path d="M9.9 5.2A11 11 0 0112 5c5 0 9 4 10 7-.4 1.3-1.3 2.5-2.4 3.5" />

                    <path d="M6.6 6.6C4.3 7.8 2.6 9.7 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" />

                  </svg>

                ) : (

                  <svg

                    xmlns="http\://www.w3.org/2000/svg"

                    width="22"

                    height="22"

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="2"

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    aria-hidden="true"

                  >

                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />

                    <circle cx="12" cy="12" r="3" />

                  </svg>

                )}

              </button>

            </div>

          </div>



          <button

            type="submit"

            disabled={submitting}

            className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"

          >

            {submitting ? "Signing in..." : "Login to Dashboard"}

          </button>

        </form>



        <p className="mt-6 text-center text-xs text-gray-500">

          Authorized administrators only.

        </p>

      </div>

    </div>

  );

}
