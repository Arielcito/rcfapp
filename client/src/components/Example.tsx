'use client'

import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function Example() {
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'predios'));
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addData = async () => {
    try {
      const docRef = await addDoc(collection(db, 'predios'), {
        nombre: 'Nuevo Predio',
        direccion: 'Calle Example 123',
        // ... otros campos
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={addData}>Add Data</button>
    </div>
  );
} 