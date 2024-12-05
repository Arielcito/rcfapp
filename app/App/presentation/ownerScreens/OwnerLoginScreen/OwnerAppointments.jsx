import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Colors from "./App/infraestructure/utils/Colors";
import { getDays, getTime } from "../../Utils/TimeDate";
import AppointmentItem from "../OwnerAppointment/AppointmentItem";
import Divider from "../../presentation/components/Divider";

export default function OwnerAppointments() {
  const [next7Days, setNext7Days] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState();
  const [appList, setAppList] = useState([]);

  useEffect(() => {
    const date = getDays();
    let time = getTime();
  
    setNext7Days(date);

    time = time.filter(t => parseInt(t.time.split(":")[0]) >= 10);
    
    setTimeList(time);
  
    if (time.length > 0) {
      setSelectedTime(time[0].time);
    }
    
    setSelectedDate(date[0].date);
  }, []);

  const handleSelectedDate = (date) => {
    setSelectedDate(date);
  };

  
  return (
    <View style={styles.headerContainer}>
      <Text
        style={{
          fontFamily: "montserrat-medium",
          fontSize: 30,
          marginBottom: 20,
        }}
      >
        Mis 
        <Text style={{ color: Colors.PRIMARY }}> Reservas</Text>
      </Text>
      <Text style={{ padding: 10 }}>Elegi la fecha</Text>
      <FlatList
        data={next7Days}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dayButton,
              selectedDate == item.date
                ? { backgroundColor: Colors.PRIMARY }
                : null,
            ]}
            onPress={() => handleSelectedDate(item.date)}
          >
            <View
              style={[
                {
                  backgroundColor: "#003366",
                  width: "100%",
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontFamily: "montserrat-medium",
                    fontSize: 10,
                    paddingTop: 5,
                  },
                  selectedDate == item.date
                    ? { color: Colors.WHITE }
                    : { color: Colors.PRIMARY },
                ]}
              >
                {item.day}
              </Text>
            </View>
            <View>
              <Text
                style={[
                  {
                    fontFamily: "montserrat-medium",
                    fontSize: 16,
                    
                  },
                  selectedDate == item.date ? { color: Colors.WHITE } : null,
                ]}
              >
                {item.formmatedDate}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Divider  />
      
      {!loading ? (
        <FlatList
          data={timeList}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          style={{ paddingBottom: 400, marginBottom: 200, marginTop: 20 }}
          renderItem={({ item }) => (
            <AppointmentItem item={item} appList={appList} selectedTime={selectedTime}/>
          )}
        />
      ) : (
        <ActivityIndicator style={{ "height":"70%" }} size={"large"} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  dayButton: {
    borderWidth: 2,
    borderRadius: 16,
    marginBottom: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    marginRight: 10,
    borderColor: Colors.BLUE,
  },
});
