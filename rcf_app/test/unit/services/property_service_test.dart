import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:rcf_app/services/property/property_service.dart';
import 'package:rcf_app/models/property/property_model.dart';

@GenerateNiceMocks([
  MockSpec<FirebaseFirestore>(),
  MockSpec<DocumentReference<Map<String, dynamic>>>(),
  MockSpec<DocumentSnapshot<Map<String, dynamic>>>(),
  MockSpec<CollectionReference<Map<String, dynamic>>>()
])
import 'property_service_test.mocks.dart';

void main() {
  late PropertyService propertyService;
  late MockFirebaseFirestore mockFirestore;

  setUp(() {
    mockFirestore = MockFirebaseFirestore();
    propertyService = PropertyService();
  });

  group('PropertyService Tests', () {
    test('getPropertyById returns PropertyModel when document exists', () async {
      final mockDocumentSnapshot = MockDocumentSnapshot<Map<String, dynamic>>();
      final mockDocumentReference = MockDocumentReference<Map<String, dynamic>>();
      final mockCollectionReference = MockCollectionReference<Map<String, dynamic>>();
      
      when(mockFirestore.collection('properties'))
          .thenReturn(mockCollectionReference);
      when(mockCollectionReference.doc('test-id'))
          .thenReturn(mockDocumentReference);
      when(mockDocumentReference.get())
          .thenAnswer((_) async => mockDocumentSnapshot);
      when(mockDocumentSnapshot.data())
          .thenReturn({
            'id': 'test-id',
            'name': 'Test Property',
            'description': 'Test Description',
            'address': 'Test Address',
            'phone': '1234567890',
            'pricePerHour': 1000,
            'type': 'futbol5',
            'images': ['image1.jpg'],
            'latitude': -34.6037,
            'longitude': -58.3816,
            'isAvailable': true,
            'ownerId': 'owner-id',
            'createdAt': DateTime.now().toIso8601String(),
            'updatedAt': DateTime.now().toIso8601String(),
          });
      when(mockDocumentSnapshot.exists).thenReturn(true);
      when(mockDocumentSnapshot.id).thenReturn('test-id');

      final result = await propertyService.getPropertyById('test-id');

      expect(result, isNotNull);
      expect(result?.id, equals('test-id'));
      expect(result?.name, equals('Test Property'));
    });

    test('getPropertyById returns null when document does not exist', () async {
      final mockDocumentReference = MockDocumentReference<Map<String, dynamic>>();
      final mockDocumentSnapshot = MockDocumentSnapshot<Map<String, dynamic>>();
      final mockCollectionReference = MockCollectionReference<Map<String, dynamic>>();
      
      when(mockFirestore.collection('properties'))
          .thenReturn(mockCollectionReference);
      when(mockCollectionReference.doc('non-existent-id'))
          .thenReturn(mockDocumentReference);
      when(mockDocumentReference.get())
          .thenAnswer((_) async => mockDocumentSnapshot);
      when(mockDocumentSnapshot.exists).thenReturn(false);

      final result = await propertyService.getPropertyById('non-existent-id');

      expect(result, isNull);
    });
  });
} 