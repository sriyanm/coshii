import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
import { Product } from "../types/index";

const PAGE_SIZE = 5;

// Fetch products with pagination (either initial or subsequent)
export const fetchProducts = async (
  shopID: string,
  shopName: string,
  lastVisible: DocumentSnapshot | null,
) => {
  try {
    const productsRef = collection(db, "products");
    let done = false;

    let q = query(
      productsRef,
      where("createdBy", "==", shopID),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    );

    // If there's a lastVisible, apply startAfter for pagination
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Update lastVisible for next fetch
    }

    if (snapshot.docs.length < PAGE_SIZE) {
      done = true;
    }

    const newProducts: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      newProducts.push({
        id: doc.id,
        name: data.name || "",
        price: data.price || 0,
        images: data.mediaUrls || ["/tempImages/basket.jpeg"],
        description: data.description || "",
        stock: data.inventory || 0,
        isListed: data.isListed ?? true,
        tags: data.tags || [],
        shopName: shopName,
        sellerId: data.sellerId || "",
      });
    });

    console.log("newProds", newProducts);

    return {
      products: newProducts,
      lastVisible,
      done,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], lastVisible: null, done: true };
  }
};
