import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useRoute } from "@react-navigation/native";
import MercadoPagoImage from "../../assets/images/mercado-pago.png";
import CreditCardImage from "../../assets/images/credit-card.png";
import handleIntegrationMP from "../../../infraestructure/config/MercadoPagoConfig";
import { openBrowserAsync } from "expo-web-browser";
import moment from "moment";
import Colors from "../../../infraestructure/utils/Colors";
import { useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import CashImage from "../../assets/images/cash.png";

const { width } = Dimensions.get("window");

const API_BASE_URL = 'http://tu-api-url/api';

export default function PaymentScreen() {
  const { params } = useRoute();
  const date = params.selectedDate.selectedDate;
  const selectedTime = params.selectedTime.selectedTime;
  const place = params.appointmentData;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("efectivo");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  console.log(params)
  console.log(date)
  console.log(selectedTime)
  const navigator = useNavigation();
  const formatDate = moment(date).format("YYYY-MM-DD");
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  const bookAppointment = async (paymentMethod) => {
    setLoading(true);

    try {
      const formattedDate = moment(date).format("YYYY-MM-DD");

      const appointmentData = {
        appointmentId: Date.now(),
        place: place.place,
        cancha: 1,
        appointmentDate: formattedDate,
        appointmentTime: selectedTime,
        email: user.email,
        estado: "pendiente",
        paymentMethod: paymentMethod,
      };

      const checkResponse = await fetch(`${API_BASE_URL}/reservas/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          cancha: 1,
          appointmentDate: formattedDate,
          appointmentTime: selectedTime
        })
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        ToastAndroid.show(
          "Ya existe una cita en esta cancha para la fecha y hora seleccionada.",
          ToastAndroid.LONG
        );
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        throw new Error('Error al crear la reserva');
      }

      const createdReserva = await response.json();
      navigator.navigate("successScreen", { appointmentData: createdReserva });

    } catch (error) {
      console.error("Error agendando:", error);
      ToastAndroid.show(error.message, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (place) => {
    try {
      switch (selectedPaymentMethod) {
        case "Mercado Pago": {
          const data = await handleIntegrationMP(place);
          if (!data) {
            return console.log("Ha ocurrido un error");
          }
          const response = await openBrowserAsync(data);
          console.log(response);

          if (response.type === "cancel") {
            return console.log("El usuario ha cancelado el pago");
          }
          await bookAppointment("Mercado Pago");
          break;
        }
        case "efectivo": {
          await bookAppointment("Efectivo");
          break;
        }
        case "tarjeta": {
          await bookAppointment("Tarjeta");
          break;
        }
        default:
          throw new Error("Método de pago no válido");
      }
      
      await bookAppointment();
    } catch (error) {
      console.error("Error en el pago:", error);
      ToastAndroid.show(
        `Ha ocurrido un error: ${error.message}`,
        ToastAndroid.LONG
      );
    }
  };

  useEffect(() => {
    const timeMoment = moment(selectedTime, "HH:mm");

    // Añade una hora
    const newTimeMoment = timeMoment.add(1, "hour");

    // Formatea el nuevo tiempo
    const newTime = newTimeMoment.format("HH:mm");
    setEndTime(newTime);
  }, [selectedTime]);

  const renderCreditCardForm = () => {
    if (selectedPaymentMethod !== 'tarjeta') return null;

    return (
      <View style={styles.creditCardForm}>
        <Text style={styles.formLabel}>Número de Tarjeta</Text>
        <TextInput
          style={styles.formInput}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={16}
        />

        <Text style={styles.formLabel}>Nombre en la Tarjeta</Text>
        <TextInput
          style={styles.formInput}
          placeholder="NOMBRE APELLIDO"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="characters"
        />

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <Text style={styles.formLabel}>Fecha de Vencimiento</Text>
            <TextInput
              style={styles.formInput}
              placeholder="MM/AA"
              value={expiryDate}
              onChangeText={setExpiryDate}
              maxLength={5}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.formLabel}>CVV</Text>
            <TextInput
              style={styles.formInput}
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              maxLength={3}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Confirma tu reserva</Text>
      <Text
        style={{
          color: Colors.PRIMARY,
          fontSize: 18,
          fontFamily: "montserrat-medium",
        }}
      >
        {place.place.name}
      </Text>
      <View style={styles.appointmentCardContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Horario y Fecha</Text>
          <View style={styles.scheduleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.scheduleText}>
              {selectedTime}hs - {endTime}hs
            </Text>
            <View style={styles.iconContainer}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.PRIMARY}
              />
            </View>
            <Text style={styles.scheduleText}>{formatDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>Pago</Text>
        <View style={styles.billDetailsContainer}>
          <View style={styles.billRow}>
            <Text style={styles.billDetailText}>Costo de la cancha:</Text>
            <Text style={styles.billDetailAmount}>$20000</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billDetailText}>Reserva:</Text>
            <Text style={styles.billDetailAmount}>$10000</Text>
          </View>
          {/*<View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>$30000</Text>
          </View>*/}
        </View>
      </View>
      <Text style={styles.heading}>Método de Pago</Text>
      <View style={styles.paymentMethodContainer}>
        <TouchableOpacity
          onPress={() => setSelectedPaymentMethod("efectivo")}
          style={[
            styles.paymentButton,
            selectedPaymentMethod === "efectivo" && {
              borderColor: Colors.PRIMARY,
            },
          ]}
        >
          <Ionicons name="cash-outline" size={30} color={Colors.PRIMARY} />
          <Text style={styles.paymentMethodText}>Efectivo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPaymentMethod("tarjeta")}
          style={[
            styles.paymentButton,
            selectedPaymentMethod === "tarjeta" && {
              borderColor: Colors.PRIMARY,
            },
          ]}
        >
          <Image source={CreditCardImage} style={styles.paymentImage} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPaymentMethod("Mercado Pago")}
          style={[
            styles.paymentButton,
            selectedPaymentMethod === "Mercado Pago" && {
              borderColor: Colors.PRIMARY,
            },
          ]}
        >
          <Image source={MercadoPagoImage} style={styles.paymentImage} />
        </TouchableOpacity>
      </View>

      {renderCreditCardForm()}

      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          onPress={() => handlePayment(place)}
          disabled={loading}
          style={styles.reserveButton}
        >
          {!loading ? (
            <Text style={styles.reserveButtonText}>Reservar</Text>
          ) : (
            <ActivityIndicator />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  heading: {
    fontSize: 24,
    fontFamily: "montserrat-medium",
    color: "#003366",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    marginTop: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: "montserrat-medium",
    color: "#003366",
    marginBottom: 10,
  },
  scheduleContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scheduleText: {
    fontSize: 16,
    fontFamily: "montserrat",
    color: "#000",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  billDetailsContainer: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billDetailText: {
    fontSize: 16,
    color: Colors.GRAY,
    fontFamily: "montserrat",
  },
  billDetailAmount: {
    fontSize: 16,
    color: Colors.BLACK,
    fontFamily: "montserrat-medium",
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    paddingTop: 8,
  },
  totalText: {
    fontSize: 18,
    color: Colors.BLACK,
    fontFamily: "montserrat-medium",
  },
  totalAmount: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontFamily: "montserrat-bold",
  },
  paymentButton: {
    borderWidth: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    width: width * 0.28,
    margin: 5,
    height: 80,
  },
  paymentMethodText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: "montserrat-medium",
    color: Colors.BLACK,
  },
  paymentImage: {
    width: 60,
    height: 40,
    resizeMode: 'contain',
  },
  paymentForm: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  expirySecurityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiryInput: {
    flex: 1,
    marginRight: 10,
  },
  securityInput: {
    flex: 1,
  },
  reserveButton: {
    padding: 13,
    backgroundColor: Colors.PRIMARY,
    margin: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reserveButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat-medium",
    fontSize: 17,
  },
  creditCardForm: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  formLabel: {
    fontSize: 14,
    color: Colors.GRAY,
    fontFamily: "montserrat-medium",
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "montserrat",
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
});
