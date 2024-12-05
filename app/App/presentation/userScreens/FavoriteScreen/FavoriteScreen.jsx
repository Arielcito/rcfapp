import { View, Text, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '../../../utils/Colors'
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_APP,FIREBASE_AUTH, FIREBASE_DB } from '../../../utils/FirebaseConfig';
import PlaceItem from '../../../Screen/HomeScreen/PlaceItem';

export default function FavoriteScreen() {
  const db = FIREBASE_APP;
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const [favList, setFavList] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    user && getFav();
  }, [user])

  /**
   * Get All Fav List list of places from firebase
   */
  const getFav = async () => {
    setLoading(true)
    setFavList([])
    const q = query(collection(db, "rfc-fav-place"),
      where("email", "==", user?.email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setFavList(favList => [...favList, doc.data()]);
      setLoading(false);
    });
  }
  return (
    <View >
      <Text style={{
        padding: 10, fontFamily: 'montserrat-medium',
        fontSize: 30
      }}>MIs Favoritos
        <Text style={{ color: Colors.PRIMARY }}> Place</Text></Text>
      {!favList ? <View style={{
        height: '100%',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator
          size={'large'}
          color={Colors.PRIMARY}
        />
        <Text style={{ fontFamily: 'montserrat', marginTop: 5 }}>Loading...</Text>
      </View> : null}

      <FlatList
        data={favList}
        onRefresh={() => getFav()}
        refreshing={loading}
        style={{ paddingBottom: 200 }}
        renderItem={({ item, index }) => (
          <PlaceItem place={item.place} isFav={true}
            markedFav={() => getFav()} />
        )}
      />
      <View style={{ marginBottom: 200, height: 200 }}>

      </View>
    </View>
  )
}