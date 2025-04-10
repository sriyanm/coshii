import {
  collection,
  query,
  doc,
  where,
  getDoc,
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
  tag: string,
  bonusProductId: string | null,
  lastVisible: DocumentSnapshot | null,
) => {
  try {
    const productsRef = collection(db, "products");
    let done = false;

    let q;
    if (tag != "All") {
      q = query(
        productsRef,
        where("createdBy", "==", shopID),
        where("tags", "array-contains", tag), // checks if `tags` array has `tag`
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      );
    } else {
      q = query(
        productsRef,
        where("createdBy", "==", shopID),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      );
    }

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
        images: data.mediaUrls || ["/tempImages/blank.jpg"],
        description: data.description || "",
        stock: data.inventory || 0,
        isListed: data.isListed ?? true,
        tags: data.tags || [],
        shopName: shopName,
        sellerId: data.sellerId || "",
      });
    });

    // If a bonusProductId is provided, fetch that product
    if (bonusProductId) {
      console.log("BONUS", bonusProductId);
      const bonusProductRef = doc(db, "products", bonusProductId); // Fetch by document ID
      const bonusProductSnapshot = await getDoc(bonusProductRef);
      if (bonusProductSnapshot.exists()) {
        // If the bonus product exists, format it similarly to the fetched products
        const bonusProductData = bonusProductSnapshot.data();
        const bonusProduct: Product = {
          id: bonusProductSnapshot.id,
          name: bonusProductData.name || "",
          price: bonusProductData.price || 0,
          images: bonusProductData.mediaUrls || ["/tempImages/blank.jpg"],
          description: bonusProductData.description || "",
          stock: bonusProductData.inventory || 0,
          isListed: bonusProductData.isListed ?? true,
          tags: bonusProductData.tags || [],
          shopName: shopName,
          sellerId: bonusProductData.sellerId || "",
        };

        // Ensure the bonus product isn't already in the list
        if (!newProducts.some((product) => product.id === bonusProductId)) {
          newProducts.unshift(bonusProduct); // Add the bonus product at the start of the list
        }
      }
    }

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
