import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get_storage/get_storage.dart';
import 'package:hive/hive.dart';

class ApiClient {
  late final Dio _dio;
  final Box<dynamic> _cache = Hive.box('api_cache');
  
  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: dotenv.env['API_URL'] ?? 'http://localhost:8080/api',
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 3),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.addAll([
      _AuthInterceptor(),
      _ErrorInterceptor(),
      _RetryInterceptor(),
      _CacheInterceptor(_cache),
    ]);
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    bool useCache = true,
  }) async {
    return _dio.get(
      path,
      queryParameters: queryParameters,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.put(
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.delete(
      path,
      queryParameters: queryParameters,
    );
  }
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = GetStorage().read<String>('token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token expirado o inválido
      GetStorage().remove('token');
      // TODO: Redirigir a login
    }
    handler.next(err);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    switch (err.response?.statusCode) {
      case 400:
        // Error de validación
        break;
      case 401:
        // Error de autenticación
        break;
      case 403:
        // Error de autorización
        break;
      case 404:
        // Recurso no encontrado
        break;
      case 422:
        // Error de negocio
        break;
      case 500:
        // Error de servidor
        break;
    }
    handler.next(err);
  }
}

class _RetryInterceptor extends Interceptor {
  int maxRetries = 3;
  final Dio _dio = Dio();
  
  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (_shouldRetry(err) && err.requestOptions.extra['retryCount'] < maxRetries) {
      try {
        final retryCount = err.requestOptions.extra['retryCount'] as int? ?? 0;
        err.requestOptions.extra['retryCount'] = retryCount + 1;
        
        await Future.delayed(Duration(seconds: retryCount + 1));
        final response = await _dio.fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (e) {
        return handler.next(err);
      }
    }
    return handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
           err.type == DioExceptionType.receiveTimeout ||
           err.response?.statusCode == 500 ||
           err.response?.statusCode == 503;
  }
}

class _CacheInterceptor extends Interceptor {
  final Box<dynamic> cache;
  
  _CacheInterceptor(this.cache);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method == 'GET' && options.extra['useCache'] == true) {
      final cachedResponse = cache.get(options.path);
      if (cachedResponse != null) {
        return handler.resolve(
          Response(
            requestOptions: options,
            data: cachedResponse,
            statusCode: 200,
          ),
        );
      }
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (response.requestOptions.method == 'GET' &&
        response.requestOptions.extra['useCache'] == true) {
      cache.put(response.requestOptions.path, response.data);
    }
    handler.next(response);
  }
} 