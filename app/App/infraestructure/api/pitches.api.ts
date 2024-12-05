import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "../config/FirebaseConfig";
const db = FIREBASE_DB;

export const getPitchesByPlaceId = async (id_place: number) => {
  const q = query(
    collection(db, "rcf-pitches"),
    where("id_place", "==", id_place)
  );
  const querySnapshot = await getDocs(q);
  const pitchesData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return pitchesData;
};
