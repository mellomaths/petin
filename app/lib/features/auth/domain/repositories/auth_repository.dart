import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/auth_tokens.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthTokens>> login(String email, String password);
  Future<Either<Failure, void>> createAccount(String email, String password);
  Future<Either<Failure, AuthTokens>> refreshToken(String refreshToken);
  Future<Either<Failure, void>> verifyEmail(String accountExternalId);
  Future<Either<Failure, User>> getCurrentUser();
  Future<Either<Failure, void>> logout();
}

