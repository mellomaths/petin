import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/api_client.dart';
import '../models/login_request.dart';
import '../models/login_response.dart';
import '../models/create_account_request.dart';
import '../../domain/entities/auth_tokens.dart';

abstract class AuthRemoteDataSource {
  Future<Either<Failure, LoginResponse>> login(LoginRequest request);
  Future<Either<Failure, void>> createAccount(CreateAccountRequest request);
  Future<Either<Failure, AuthTokens>> refreshToken(String refreshToken);
  Future<Either<Failure, void>> verifyEmail(String accountExternalId);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl(this.apiClient);

  @override
  Future<Either<Failure, LoginResponse>> login(LoginRequest request) async {
    try {
      final response = await apiClient.post(
        '/auth/login',
        data: request.toJson(),
      );

      final loginResponse = LoginResponse.fromJson(response.data);
      return Right(loginResponse);
    } on DioException catch (e) {
      return Left(_handleDioError(e));
    } catch (e) {
      final errorMessage = e.toString();
      if (_isNetworkErrorString(errorMessage)) {
        return Left(NetworkFailure('Unable to connect to server. Please check your internet connection and try again.'));
      }
      return Left(ServerFailure(errorMessage));
    }
  }

  @override
  Future<Either<Failure, void>> createAccount(
    CreateAccountRequest request,
  ) async {
    try {
      await apiClient.post(
        '/accounts',
        data: request.toJson(),
      );
      return const Right(null);
    } on DioException catch (e) {
      return Left(_handleDioError(e));
    } catch (e) {
      final errorMessage = e.toString();
      if (_isNetworkErrorString(errorMessage)) {
        return Left(NetworkFailure('Unable to connect to server. Please check your internet connection and try again.'));
      }
      return Left(ServerFailure(errorMessage));
    }
  }

  @override
  Future<Either<Failure, AuthTokens>> refreshToken(
    String refreshToken,
  ) async {
    try {
      final response = await apiClient.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      final loginResponse = LoginResponse.fromJson(response.data);
      return Right(loginResponse.toEntity());
    } on DioException catch (e) {
      return Left(_handleDioError(e));
    } catch (e) {
      final errorMessage = e.toString();
      if (_isNetworkErrorString(errorMessage)) {
        return Left(NetworkFailure('Unable to connect to server. Please check your internet connection and try again.'));
      }
      return Left(ServerFailure(errorMessage));
    }
  }

  @override
  Future<Either<Failure, void>> verifyEmail(String accountExternalId) async {
    try {
      await apiClient.post('/accounts/$accountExternalId/verify');
      return const Right(null);
    } on DioException catch (e) {
      return Left(_handleDioError(e));
    } catch (e) {
      final errorMessage = e.toString();
      if (_isNetworkErrorString(errorMessage)) {
        return Left(NetworkFailure('Unable to connect to server. Please check your internet connection and try again.'));
      }
      return Left(ServerFailure(errorMessage));
    }
  }
  
  Failure _handleDioError(DioException error) {
    if (_isNetworkError(error)) {
      return NetworkFailure('Unable to connect to server. Please check your internet connection and try again.');
    }
    
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final responseData = error.response!.data;
      
      // Extract error message from response (backend uses 'error_message' field)
      String message = 'An error occurred';
      if (responseData is Map<String, dynamic>) {
        message = responseData['error_message'] ?? 
                  responseData['message'] ?? 
                  responseData['error'] ?? 
                  message;
      } else if (responseData is String) {
        message = responseData;
      }
      
      // Handle specific status codes
      if (statusCode == 400) {
        return ValidationFailure(message);
      } else if (statusCode == 409) {
        return AuthFailure(message.isNotEmpty ? message : 'Email already in use');
      } else if (statusCode == 401 || statusCode == 403) {
        return AuthFailure(message.isNotEmpty ? message : 'Unauthorized');
      } else if (statusCode == 404) {
        return ServerFailure(message.isNotEmpty ? message : 'Resource not found', statusCode: statusCode);
      }
      
      return ServerFailure(message, statusCode: statusCode);
    }
    
    return ServerFailure(error.message ?? 'An unexpected error occurred');
  }
  
  bool _isNetworkError(DioException error) {
    return error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.unknown;
  }
  
  bool _isNetworkErrorString(String errorMessage) {
    final lowerMessage = errorMessage.toLowerCase();
    return lowerMessage.contains('connection refused') ||
        lowerMessage.contains('connection timeout') ||
        lowerMessage.contains('connection error') ||
        lowerMessage.contains('no internet connection') ||
        lowerMessage.contains('network is unreachable') ||
        lowerMessage.contains('connection closed');
  }
}

