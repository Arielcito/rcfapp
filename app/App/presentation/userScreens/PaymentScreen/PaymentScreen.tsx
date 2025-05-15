// @ts-check
// Archivo renombrado: PaymentScreen.tsx (No es posible hacerlo automáticamente debido a limitaciones de la herramienta)
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
  Platform,
  Alert,
  Share,
  Animated,
} from "react-native";
import React, { useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import Colors from "../../../infraestructure/utils/Colors";
import { useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { api } from "../../../infraestructure/api/api";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { mercadoPagoApi } from "../../../infraestructure/api/mercadopago.api";
import { MercadoPagoPreferenceData, PaymentMethod, ReservaData } from "../../../types/payment";
import { PaymentScreenParams } from "../../../types/payment";
import { openBrowserAsync } from "expo-web-browser";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get("window");

type RootStackParamList = {
  successScreen: { appointmentData: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const showMessage = (message: string) => {
  if (Platform.OS === 'ios') {
    Alert.alert('Mensaje', message);
  } else {
    ToastAndroid.show(message, ToastAndroid.LONG);
  }
};

export default function PaymentScreen() {
  const { currentUser } = useCurrentUser();
  const { params } = useRoute();
  const paymentParams = params as unknown as PaymentScreenParams;
  
  const date = paymentParams.selectedDate;
  const selectedTime = paymentParams.selectedTime;
  const cancha = paymentParams.appointmentData.cancha;
  const place = paymentParams.appointmentData.place;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState<string>();
  const [notes, setNotes] = useState('');
  
  // Datos de tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const navigator = useNavigation<NavigationProp>();
  const formatDate = moment(date).format("YYYY-MM-DD");
  
  // Valores de animación
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const notesHeight = useRef(new Animated.Value(0)).current;
  const paymentMethodsOffset = useRef(new Animated.Value(50)).current;
  const headerOffset = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const timeMoment = moment(selectedTime, "HH:mm");
    const newTimeMoment = timeMoment.add(1, "hour");
    const newTime = newTimeMoment.format("HH:mm");
    setEndTime(newTime);
    
    // Animaciones iniciales
    Animated.spring(headerOffset, {
      toValue: 0,
      damping: 12,
      stiffness: 100,
      useNativeDriver: true,
    }).start();
    
    // Secuencia de animaciones para mejorar UX
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(paymentMethodsOffset, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Mostrar el formulario de notas con animación
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(notesHeight, {
        toValue: 100,
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
  }, [selectedTime]);

  const bookAppointment = async (paymentMethod: PaymentMethod) => {
    // Animación de feedback antes de iniciar el proceso
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    setLoading(true);

    try {
      if (!currentUser?.id) {
        throw new Error('No se encontró el ID del usuario');
      }

      const formattedDate = moment(date).format("YYYY-MM-DD");
      const fechaHora = moment(`${formattedDate} ${selectedTime}`, "YYYY-MM-DD HH:mm").toISOString();

      const { data: disponibilidadData } = await api.post('/reservas/check', {
        canchaId: cancha.id,
        fechaHora: fechaHora,
        duracion: 60,
      });

      if (!disponibilidadData.success || !disponibilidadData.data.disponible) {
        throw new Error('El horario seleccionado ya no está disponible');
      }

      const montoAPagar = cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora;

      const reservaData: ReservaData = {
        canchaId: cancha.id,
        userId: currentUser.id,
        fechaHora: fechaHora,
        duracion: 60,
        precioTotal: montoAPagar,
        metodoPago: paymentMethod,
        estadoPago: 'PENDIENTE',
        notasAdicionales: notes || `Reserva para ${cancha.nombre}`
      };

      const { data: createdReserva } = await api.post('/reservas', reservaData);
      console.log('createdReserva', createdReserva);
      if (!createdReserva) {
        throw new Error('Error al crear la reserva');
      }

      navigator.navigate("successScreen", { appointmentData: createdReserva });

    } catch (error: any) {
      console.error("Error en la reserva:", error);
      const errorMessage = error.response?.data?.error || error.message || "Error al procesar la reserva";
      showMessage(errorMessage);
      
      // Animación de error
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  const compartirDatosBancarios = async () => {
    try {
      const mensaje = `Datos para transferencia:
CBU: ${place.cbu}
Titular: ${place.titularCuenta}
Banco: ${place.banco}
Tipo de cuenta: ${place.tipoCuenta}
Monto: $${cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora}`;

      await Share.share({
        message: mensaje,
      });
    } catch (error) {
      console.error("Error al compartir:", error);
      showMessage("Error al compartir los datos bancarios");
    }
  };

  // Estilos animados
  const headerAnimatedStyle = {
    transform: [{ translateY: headerOffset }],
    opacity: headerOffset.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
  };

  const paymentMethodsAnimatedStyle = {
    transform: [{ translateY: paymentMethodsOffset }],
    opacity: paymentMethodsOffset.interpolate({
      inputRange: [50, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
  };

  const notesAnimatedStyle = {
    height: notesHeight,
    opacity: notesHeight.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    }),
    overflow: 'hidden' as const
  };

  const buttonAnimatedStyle = {
    transform: [{ scale: buttonScale }]
  };

  const formAnimatedStyle = {
    opacity: formOpacity,
    transform: [
      { 
        translateY: formOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
          extrapolate: 'clamp'
        })
      }
    ]
  };

  const renderTransferenciaBancaria = () => {
    if (selectedPaymentMethod !== 'transferencia') return null;
    
    // Animar entrada del formulario
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    if (!place.cbu) {
      return (
        <Animated.View style={[styles.transferWarning, formAnimatedStyle]}>
          <Text style={styles.warningText}>Este predio no tiene datos bancarios configurados.</Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.transferContainer, formAnimatedStyle]}>
        <View style={styles.transferDataRow}>
          <Text style={styles.transferLabel}>CBU:</Text>
          <Text style={styles.transferValue}>{place.cbu}</Text>
        </View>
        {place.titularCuenta && (
          <View style={styles.transferDataRow}>
            <Text style={styles.transferLabel}>Titular:</Text>
            <Text style={styles.transferValue}>{place.titularCuenta}</Text>
          </View>
        )}
        {place.banco && (
          <View style={styles.transferDataRow}>
            <Text style={styles.transferLabel}>Banco:</Text>
            <Text style={styles.transferValue}>{place.banco}</Text>
          </View>
        )}
        {place.tipoCuenta && (
          <View style={styles.transferDataRow}>
            <Text style={styles.transferLabel}>Tipo de cuenta:</Text>
            <Text style={styles.transferValue}>{place.tipoCuenta}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={compartirDatosBancarios}
        >
          <Ionicons name="share-outline" size={20} color={Colors.WHITE} />
          <Text style={styles.shareButtonText}>Compartir datos</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handlePayment = async () => {
    // Animación de presión de botón
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    try {
      switch (selectedPaymentMethod) {
        case "transferencia": {
          if (!place.cbu) {
            throw new Error("Este predio no tiene datos bancarios configurados");
          }
          await bookAppointment("transferencia");
          break;
        }
        case "Mercado Pago": {
          console.log("Iniciando proceso de pago con Mercado Pago");
          console.log("Datos del predio:", { 
            predioId: place.id, 
            nombre: place.nombre 
          });
          console.log("Datos de la cancha:", { 
            canchaId: cancha.id, 
            nombre: cancha.nombre,
            precio: cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora
          });
          
          const preferenceData: MercadoPagoPreferenceData = {
            predioId: place.id,
            items: [{
              title: cancha.nombre,
              description: `Reserva en ${place.nombre} - ${cancha.tipo} ${cancha.tipoSuperficie}`,
              picture_url: cancha.imagenUrl || place.imagenUrl,
              quantity: 1,
              currency_id: "ARS",
              unit_price: cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora
            }],
            external_reference: `reserva_${Date.now()}`
          };
          
          console.log("Datos de preferencia a enviar:", preferenceData);

          try {
            const { data: preference } = await mercadoPagoApi.createPreference(preferenceData);
            console.log("Respuesta de Mercado Pago:", preference);
            
            if (!preference?.init_point) {
              throw new Error("Error al procesar pago con Mercado Pago");
            }

            const response = await openBrowserAsync(preference.init_point);
            console.log("Respuesta del navegador:", response);
            
            if (response.type === "cancel") {
              throw new Error("Pago cancelado por el usuario");
            }

            await bookAppointment("Mercado Pago");
          } catch (mpError: any) {
            console.error("Error específico de Mercado Pago:", mpError);
            console.error("Detalles del error:", {
              message: mpError.message,
              response: mpError.response?.data,
              status: mpError.response?.status
            });
            
            // Verificar si el error es porque el predio no tiene configurado Mercado Pago
            const errorMessage = mpError.response?.data?.error || mpError.message;
            if (errorMessage.includes("no tiene configurado Mercado Pago")) {
              showMessage("Este predio no tiene configurado Mercado Pago. Por favor, elija otro método de pago.");
              return;
            }
            
            throw new Error(`Error con Mercado Pago: ${mpError.message}`);
          }
          break;
        }
        case "efectivo": {
          await bookAppointment("efectivo");
          break;
        }
        case "tarjeta": {
          if (!cardNumber || !cardName || !expiryDate || !cvv) {
            throw new Error("Por favor complete todos los campos de la tarjeta");
          }
          await bookAppointment("tarjeta");
          break;
        }
        default:
          throw new Error("Método de pago no válido");
      }
    } catch (error: any) {
      console.error("Error en el pago:", error);
      showMessage(error.message);
      
      // Animación de error
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const renderCreditCardForm = () => {
    if (selectedPaymentMethod !== 'tarjeta') return null;
    
    // Animar entrada del formulario
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={[styles.creditCardForm, formAnimatedStyle]}>
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
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <Text style={styles.heading}>Confirma tu reserva</Text>
          <Text style={styles.subHeading}>{cancha.nombre}</Text>
        </Animated.View>
        
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
                <Ionicons name="calendar-outline" size={24} color={Colors.PRIMARY} />
              </View>
              <Text style={styles.scheduleText}>{formatDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Detalles de la Cancha</Text>
          <View style={styles.billDetailsContainer}>
            {cancha.tipo && (
              <View style={styles.billRow}>
                <Text style={styles.billDetailText}>Tipo:</Text>
                <Text style={styles.billDetailAmount}>{cancha.tipo}</Text>
              </View>
            )}
            {cancha.tipoSuperficie && (
              <View style={styles.billRow}>
                <Text style={styles.billDetailText}>Superficie:</Text>
                <Text style={styles.billDetailAmount}>{cancha.tipoSuperficie}</Text>
              </View>
            )}
            <View style={styles.billRow}>
              <Text style={styles.billDetailText}>Dimensiones:</Text>
              <Text style={styles.billDetailAmount}>{cancha.longitud}m x {cancha.ancho}m</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Pago</Text>
          <View style={styles.billDetailsContainer}>
            <View style={styles.billRow}>
              <Text style={styles.billDetailText}>Costo por hora:</Text>
              <Text style={styles.billDetailAmount}>${cancha.precioPorHora}</Text>
            </View>
            {cancha.requiereSeña && (
              <View style={styles.billRow}>
                <Text style={styles.billDetailText}>Seña requerida:</Text>
                <Text style={styles.billDetailAmount}>${cancha.montoSeña}</Text>
              </View>
            )}
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalText}>Total a pagar:</Text>
              <Text style={styles.totalAmount}>
                ${cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.heading}>Método de Pago</Text>
        <Animated.View style={[styles.paymentMethodContainer, paymentMethodsAnimatedStyle]}>
          <Animated.View>
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
          </Animated.View>

          <Animated.View>
            <TouchableOpacity
              onPress={() => setSelectedPaymentMethod("transferencia")}
              style={[
                styles.paymentButton,
                selectedPaymentMethod === "transferencia" && {
                  borderColor: Colors.PRIMARY,
                },
              ]}
            >
              <Ionicons name="card-outline" size={30} color={Colors.PRIMARY} />
              <Text style={styles.paymentMethodText}>Transferencia</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View>
            <TouchableOpacity
              onPress={() => setSelectedPaymentMethod("tarjeta")}
              style={[
                styles.paymentButton,
                selectedPaymentMethod === "tarjeta" && {
                  borderColor: Colors.PRIMARY,
                },
              ]}
            >
              <Image source={require("../../assets/images/credit-card.png")} style={styles.paymentImage} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View>
            <TouchableOpacity
              onPress={() => setSelectedPaymentMethod("Mercado Pago")}
              style={[
                styles.paymentButton,
                selectedPaymentMethod === "Mercado Pago" && {
                  borderColor: Colors.PRIMARY,
                },
              ]}
            >
              <Image source={require("../../assets/images/mercado-pago.png")} style={styles.paymentImage} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {renderTransferenciaBancaria()}
        {renderCreditCardForm()}

        <Animated.View style={[styles.sectionContainer, notesAnimatedStyle]}>
          <Text style={styles.sectionHeading}>Notas Adicionales</Text>
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Agrega alguna nota o comentario para tu reserva..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        {selectedPaymentMethod === "efectivo" && (
          <Animated.View style={[styles.voucherInfoContainer, formAnimatedStyle]}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.PRIMARY} />
            <Text style={styles.voucherInfoText}>
              Al pagar en efectivo, podrás obtener un voucher digital para presentar en el predio como comprobante de tu reserva.
            </Text>
          </Animated.View>
        )}
        
        <View style={{ height: 80 }} />
      </ScrollView>
      
      <View style={styles.stickyButtonContainer}>
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading}
            style={styles.reserveButton}
          >
            {!loading ? (
              <Text style={styles.reserveButtonText}>Reservar</Text>
            ) : (
              <ActivityIndicator color={Colors.WHITE} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: 20,
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
  subHeading: {
    color: Colors.PRIMARY,
    fontSize: 18,
    fontFamily: "montserrat-medium",
    marginBottom: 15,
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  creditCardForm: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  reserveButton: {
    padding: 13,
    backgroundColor: Colors.PRIMARY,
    margin: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  reserveButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat-medium",
    fontSize: 17,
  },
  transferContainer: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transferDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  transferLabel: {
    fontSize: 14,
    color: Colors.GRAY,
    fontFamily: "montserrat-medium",
  },
  transferValue: {
    fontSize: 14,
    color: Colors.BLACK,
    fontFamily: "montserrat",
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  transferWarning: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#92400E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  warningText: {
    color: '#92400E',
    fontFamily: "montserrat",
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  shareButtonText: {
    color: Colors.WHITE,
    fontFamily: "montserrat-medium",
    marginLeft: 8,
  },
  voucherInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#E6F7FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherInfoText: {
    marginLeft: 10,
    flex: 1,
    color: Colors.PRIMARY,
    fontFamily: "montserrat",
    fontSize: 14,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notesContainer: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "montserrat",
    minHeight: 100,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 102, 204, 0.1)",
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
