import { collection, query, getDocs, where, DocumentData } from "firebase/firestore";
import { FIREBASE_DB } from "../config/FirebaseConfig";
import { Place } from "../../domain/entities/place.entity";
import { api } from "./api";
const db = FIREBASE_DB;

export const getPredios = async (): Promise<Place[]> => {
  try {
    const response = await api.get('/predios');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener predios:", error);
    return [];
  }
};


export const fetchOwnerPlace = async (ownerId: string) => {
  try {
    const q = query(collection(FIREBASE_DB, 'rcf-places'), where('id_duenio', '==', ownerId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const placeData = querySnapshot.docs[0].data();
      return placeData;
    }
  } catch (error) {
    console.error('Error al buscar el predio del dueño:', error);
  }
};

