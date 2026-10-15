
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function loadProducts() {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}
