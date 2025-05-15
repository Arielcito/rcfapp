import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
// ... existing imports ...

export default function HomeScreen() {
  // ... existing state ...
  
  // Valores de animación
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  // Animación inicial
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const renderTimePickerModal = () => (
    <Modal
      visible={isTimePickerVisible}
      transparent={true}
      animationType="none"
      onShow={() => {
        Animated.parallel([
          Animated.timing(modalSlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            opacity: modalOpacityAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: modalSlideAnim }]
            }
          ]}
        >
          <Text style={styles.modalTitle}>Selecciona una hora</Text>
          <FlatList
            data={timeList}
            renderItem={({ item, index }) => (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20 * index]
                      })
                    }
                  ]
                }}
              >
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setSelectedTime(item.time);
                    setIsTimePickerVisible(false);
                  }}
                >
                  <Text style={styles.timeButtonText}>{item.time}</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            keyExtractor={(item) => item.time.toString()}
            numColumns={3}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Animated.parallel([
                Animated.timing(modalSlideAnim, {
                  toValue: 300,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(modalOpacityAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                })
              ]).start(() => {
                setIsTimePickerVisible(false);
                modalSlideAnim.setValue(300);
                modalOpacityAnim.setValue(0);
              });
            }}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  const renderDayButton = useCallback(({ item, index }) => {
    const isSelected = selectedDate === item.date;
    
    const handleDatePress = () => {
      if (!item.date) return;

      // Animación al seleccionar fecha
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        })
      ]).start();

      setSelectedDate(item.date);
      
      // ... resto del código existente ...
    };
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { 
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50 * index]
              })
            },
            { scale: scaleAnim }
          ]
        }}
      >
        <TouchableOpacity
          style={[
            styles.dayButton,
            isSelected && { backgroundColor: Colors.PRIMARY },
            isTablet && styles.tabletDayButton,
          ]}
          onPress={handleDatePress}
        >
          <View style={styles.dayButtonHeader}>
            <Text style={[
              styles.dayButtonHeaderText,
              isSelected && { color: Colors.WHITE },
            ]}>
              {item.day}
            </Text>
          </View>
          <View>
            <Text style={[
              styles.dayButtonDateText,
              isSelected && { color: Colors.WHITE },
            ]}>
              {item.formmatedDate}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [selectedDate, selectedTime, isTablet, fadeAnim, slideAnim, scaleAnim]);

  return (
    <SelectMarkerContext.Provider value={{ selectedMarker, setSelectedMarker }}>
      <View style={[styles.container, isTablet && styles.tabletContainer]}>
        <Animated.View 
          style={[
            styles.headerContainer, 
            isTablet && styles.tabletHeaderContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Header isTablet={isTablet} />
          <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>Elegi la fecha</Text>
          {Array.isArray(next7Days) && next7Days.length > 0 ? (
            <FlatList
              data={next7Days}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={renderDayButton}
              keyExtractor={item => item.date}
              contentContainerStyle={isTablet && styles.tabletDayButtonContainer}
            />
          ) : (
            <Text style={styles.noPlacesText}>Cargando fechas disponibles...</Text>
          )}
          <Animated.View 
            style={[
              styles.timePickerContainer, 
              isTablet && styles.tabletTimePickerContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Text style={styles.timePickerLabel}>¿A qué hora jugas?</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setIsTimePickerVisible(true)}
            >
              <Text style={styles.timePickerButtonText}>
                {selectedTime || "Seleccionar"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {renderTimePickerModal()}
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.listContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {loading ? (
            <View style={styles.listLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          ) : placeList.length > 0 ? (
            <FlatList
              data={placeList}
              style={styles.placeList}
              contentContainerStyle={styles.placeListContent}
              renderItem={({ item, index }) => (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      { 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20 * index]
                        })
                      }
                    ]
                  }}
                >
                  <PlaceItem
                    place={item}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    isTablet={isTablet}
                  />
                </Animated.View>
              )}
              keyExtractor={(item) => item.id}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={21}
              initialNumToRender={5}
              numColumns={isTablet ? 2 : 1}
            />
          ) : (
            <Text style={[styles.noPlacesText, isTablet && styles.tabletNoPlacesText]}>
              No hay lugares disponibles
            </Text>
          )}
        </Animated.View>
      </View>
    </SelectMarkerContext.Provider>
  );
}

// ... existing styles ... 