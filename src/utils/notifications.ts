import { firestore, messaging } from "../services/firebase";
import { SALE_STATUS } from "../types/sale";

const getCustomerSaleNotificationData = (saleId: string, status: SALE_STATUS) => {
  const data = {
    [SALE_STATUS.DELIVERED]: {
      title: `Order ${saleId} delivered`,
      body: ''
    }
  } as any;
  return data[status];
}

// const getSellerSaleNotificationData = (saleId: string, status: SALE_STATUS) => {
//   const data = {
//     [SALE_STATUS.RECEIVED]: {
//       title: `Order ${saleId} received by customer`,
//       body: ''
//     }
//   } as any;
//   return data[status];
// }

export const notifyUser = async (userId: string, title: string, body?: string) => {
  const userDoc = await firestore.collection('users').doc(userId).get();
  const token = userDoc.data()?.notificationToken;
  if (token) {
    await messaging.send({
      token,
      notification: { title, body }
    });
  }
};

export const notifySaleUpdate = (customerId: string, sellerId: string, saleId: string, status: SALE_STATUS) => {
  const customerData = getCustomerSaleNotificationData(saleId, status);
  // const sellerData = getSellerSaleNotificationData(saleId, status);
  if (customerData) {
    notifyUser(customerId, customerData.title, customerData.body);
  }
  // if (sellerData) {
  //   notifyUser(sellerId, sellerData.title, sellerData.body);
  // }
}
