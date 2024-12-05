
import { FIREBASE_DB } from "../config/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { User } from "../../domain/entities/user.entity";
const db = FIREBASE_DB;


export const getProfileInfo = async (user: any): Promise<User> => {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      console.log(user)
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs[0].data();
     
      return userData as User;
    } catch (error) {
      console.error("Error obteniendo información del perfil: ", error);
      throw error;
    } 
  };