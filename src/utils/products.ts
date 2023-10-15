import { firestore } from "../services/firebase";
import { SaleProduct } from "../types/sale";

export const updateProducts = async (saleProducts: SaleProduct[]) => {
  for (let i = 0; i < saleProducts.length; i++) {
    const sp = saleProducts[i];
    const doc = firestore.collection('products').doc(sp.id);
    await doc.update({
      quantityTotal: FirebaseFirestore.FieldValue.increment(-sp.quantity),
      quantityAvailable: FirebaseFirestore.FieldValue.increment(-sp.quantity),
    })
  }
};
