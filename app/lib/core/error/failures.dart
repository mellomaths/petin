import 'package:equatable/equatable.dart';

/// Base class for all failures in the application
abstract class Failure extends Equatable {
  final String message;

  const Failure(this.message);

  @override
  List<Object> get props => [message];
}

/// Server failure - represents errors from the API
class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure(String message, {this.statusCode}) : super(message);

  @override
  List<Object> get props => [message, statusCode ?? 0];
}

/// Network failure - represents network connectivity issues
class NetworkFailure extends Failure {
  const NetworkFailure(String message) : super(message);
}

/// Cache failure - represents errors when reading/writing to local storage
class CacheFailure extends Failure {
  const CacheFailure(String message) : super(message);
}

/// Validation failure - represents input validation errors
class ValidationFailure extends Failure {
  final Map<String, List<String>>? errors;

  const ValidationFailure(String message, {this.errors}) : super(message);

  @override
  List<Object> get props => [message, errors ?? {}];
}

/// Authentication failure - represents authentication/authorization errors
class AuthFailure extends Failure {
  const AuthFailure(String message) : super(message);
}

/// Unknown failure - represents unexpected errors
class UnknownFailure extends Failure {
  const UnknownFailure(String message) : super(message);
}

