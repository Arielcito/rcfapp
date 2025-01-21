class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final int statusCode;
  final String? message;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    required this.statusCode,
    this.message,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) fromJson) {
    return ApiResponse<T>(
      success: json['success'] as bool,
      data: json['data'] != null ? fromJson(json['data'] as Map<String, dynamic>) : null,
      error: json['error'] as String?,
      statusCode: json['statusCode'] as int,
      message: json['message'] as String?,
    );
  }

  factory ApiResponse.error({
    required String message,
    int statusCode = 400,
  }) {
    return ApiResponse(
      success: false,
      error: message,
      statusCode: statusCode,
      message: message,
    );
  }
} 