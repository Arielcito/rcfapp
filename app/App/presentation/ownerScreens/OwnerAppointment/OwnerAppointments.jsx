import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Colors from "../../../infraestructure/utils/Colors";
import { getDays, getTime } from "../../../infraestructure/utils/TimeDate";
import AppointmentItem from "./AppointmentItem";
import Divider from "../../components/Divider";
import { getAppointmentsByAppointmentDate } from "../../../infraestructure/api/appointments.api";

export default function OwnerAppointments() {
  const [next7Days, setNext7Days] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedTime, setSelectedTime] = useState(new Date().getHours());
  const [appList, setAppList] = useState([]);

  useEffect(() => {
    const date = getDays();
    const time = getTime().filter(t => {
      const hour = parseInt(t.time.split(':')[0]);
      return hour >= 10 && hour <= 23;
    });

    setNext7Days(date);
    setTimeList(time);

    setSelectedDate(date[0].date);
    setSelectedTime(time[0].time);
  }, []);

  useEffect( () => {
    const fetchData = async () => {
      setLoading(true);
      const date = await getAppointmentsByAppointmentDate(selectedDate);
      setAppList(date);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);
  
  return (
    <View style={styles.headerContainer}>
      <Text
        style={{
          fontFamily: "montserrat-medium",
          fontSize: 30,
          marginBottom: 20,
          marginTop: 30,
        }}
      >
        Mis Reservas
        <Text style={{ color: Colors.PRIMARY }}> Cancha</Text>
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
            onPress={() => setSelectedDate(item.date)}
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
