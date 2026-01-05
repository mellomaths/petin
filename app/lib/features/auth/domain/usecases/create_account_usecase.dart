import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

class CreateAccountUseCase {
  final AuthRepository repository;

  CreateAccountUseCase(this.repository);

  Future<Either<Failure, void>> call({
    required String email,
    required String password,
  }) async {
    return await repository.createAccount(email, password);
  }
}

