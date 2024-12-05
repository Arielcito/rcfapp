import { View, Text, FlatList, Dimensions } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import PlaceItem from "../../components/PlaceItem";
import { SelectMarkerContext } from "../../../application/context/SelectMarkerContext";
import { FIREBASE_AUTH } from "../../../infraestructure/config/FirebaseConfig";
import PlaceMapItem from "../../components/PlaceMapItem";
export default function PlaceListView({ placeList }) {
  const flatListRef = useRef(null);

  const auth = FIREBASE_AUTH;
  const user = auth?.currentUser;
  const [favList, setFavList] = useState([]);
  const { selectedMarker, setSelectedMarker } = useContext(SelectMarkerContext);

  useEffect(() => {
    if (selectedMarker && placeList.length > 0) {
      scrollToIndex(selectedMarker);
    }
  }, [selectedMarker, placeList]);

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ animated: true, index });
  };
  const getItemLayout = (_, index) => ({
    length: Dimensions.get("window").width,
    offset: Dimensions.get("window").width * index,
    index,
  });

  return (
    <View>
      <FlatList
        data={placeList}
        horizontal={false}
        pagingEnabled
        ref={flatListRef}
        style={{ marginBottom: 60, paddindbottom: 50 }}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View key={index}>
            <PlaceMapItem
              place={item}
            />
          </View>
        )}
      />
    </View>
  );
}
