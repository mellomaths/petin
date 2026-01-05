import 'package:dartz/dartz.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/utils/constants.dart';
import '../../domain/entities/auth_tokens.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/login_request.dart';
import '../models/create_account_request.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final ApiClient apiClient;
  final SharedPreferences prefs;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.apiClient,
    required this.prefs,
  });

  @override
  Future<Either<Failure, AuthTokens>> login(
    String email,
    String password,
  ) async {
    final request = LoginRequest(email: email, password: password);
    final result = await remoteDataSource.login(request);

    return result.fold(
      (failure) => Left(failure),
      (loginResponse) async {
        // Save tokens
        await apiClient.updateAuthToken(loginResponse.accessToken);
        await prefs.setString(
          AppConstants.refreshTokenKey,
          loginResponse.refreshToken,
        );

        return Right(loginResponse.toEntity());
      },
    );
  }

  @override
  Future<Either<Failure, void>> createAccount(
    String email,
    String password,
  ) async {
    final request = CreateAccountRequest(email: email, password: password);
    return await remoteDataSource.createAccount(request);
  }

  @override
  Future<Either<Failure, AuthTokens>> refreshToken(
    String refreshToken,
  ) async {
    final result = await remoteDataSource.refreshToken(refreshToken);

    return result.fold(
      (failure) => Left(failure),
      (tokens) async {
        // Update tokens
        await apiClient.updateAuthToken(tokens.accessToken);
        await prefs.setString(
          AppConstants.refreshTokenKey,
          tokens.refreshToken,
        );

        return Right(tokens);
      },
    );
  }

  @override
  Future<Either<Failure, void>> verifyEmail(String accountExternalId) async {
    return await remoteDataSource.verifyEmail(accountExternalId);
  }

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    // TODO: Implement get current user from API
    // For now, return a placeholder
    return Left(UnknownFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> logout() async {
    await apiClient.clearAuthToken();
    await prefs.remove(AppConstants.refreshTokenKey);
    return const Right(null);
  }
}

