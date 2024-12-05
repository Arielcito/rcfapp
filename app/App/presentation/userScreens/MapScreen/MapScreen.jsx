import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AppMapView from "./AppMapView";
import Header from "../HomeScreen/Header";
import SearchBar from "./SearchBar";
import { UserLocationContext } from "../../../application/context/UserLocationContext";
import PlaceListView from "./PlaceListView";
import { SelectMarkerContext } from "../../../application/context/SelectMarkerContext";
import Colors from "../../../infraestructure/utils/Colors";
import { getPredios } from "../../../infraestructure/api/places.api";
import { getAppointmentsByDate } from "../../../infraestructure/api/appointments.api";
import { getDays, getTime } from "../../../infraestructure/utils/TimeDate";

export default function MapScreen() {
  const { location, setLocation } = useContext(UserLocationContext);

  const [placeList, setPlaceList] = useState();
  const [selectedMarker, setSelectedMarker] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedMarker(0);
  }, [location]);

  useEffect(() => {
    getDays();
    getTime();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const predios = await getPredios();
        setPlaceList(predios);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <SelectMarkerContext.Provider value={{ selectedMarker, setSelectedMarker }}>
      <View>
        <View style={styles.headerContainer}>
          <SearchBar
            searchedLocation={(location) =>
              setLocation({
                latitude: location.lat,
                longitude: location.lng,
              })
            }
          />
        </View>
        {!placeList ? (
          <ActivityIndicator size={"large"} />
        ) : (
          <AppMapView placeList={placeList} />
        )}
        <View style={styles.placeListContainer}>
          {placeList && <PlaceListView placeList={placeList} />}
        </View>
      </View>
    </SelectMarkerContext.Provider>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  placeListContainer: {
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    width: "100%",
  },
  dayButton: {
    borderWidth: 1,
    borderRadius: 99,
    padding: 5,
    marginBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    marginRight: 10,
    borderColor: Colors.GRAY,
  },
});
