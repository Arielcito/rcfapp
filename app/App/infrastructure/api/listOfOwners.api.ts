import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../config/FirebaseConfig";

const getListOfOwners = async () => {
  const db = FIREBASE_DB;
  const querySnapshot = await getDocs(collection(db, "list-of-owners"));
  return querySnapshot.docs.map((doc) => doc.data());
};

export default getListOfOwners;