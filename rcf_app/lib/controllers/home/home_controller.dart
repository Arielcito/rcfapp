import 'package:get/get.dart';
import '../../models/court/court_model.dart';
import '../../services/court/court_service.dart';

class HomeController extends GetxController {
  final CourtService _courtService = CourtService();
  final RxList<CourtModel> courts = <CourtModel>[].obs;
  final Rx<DateTime> selectedDate = DateTime.now().obs;
  final RxString selectedStartTime = ''.obs;
  final RxString selectedEndTime = ''.obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadCourts();
  }

  Future<void> loadCourts() async {
    try {
      isLoading.value = true;
      error.value = '';
      
      courts.value = await _courtService.getCourts(
        date: selectedDate.value,
        startTime: selectedStartTime.value.isNotEmpty ? selectedStartTime.value : null,
        endTime: selectedEndTime.value.isNotEmpty ? selectedEndTime.value : null,
      );
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  void setDate(DateTime date) {
    selectedDate.value = date;
    loadCourts();
  }

  void setTimeRange(String startTime, String endTime) {
    selectedStartTime.value = startTime;
    selectedEndTime.value = endTime;
    loadCourts();
  }

  Future<List<String>> getAvailableHours(String courtId) async {
    try {
      return await _courtService.getAvailableHours(
        courtId: courtId,
        date: selectedDate.value,
      );
    } catch (e) {
      error.value = e.toString();
      return [];
    }
  }
} 