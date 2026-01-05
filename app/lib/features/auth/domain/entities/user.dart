import 'package:equatable/equatable.dart';

/// User entity representing authenticated user
class User extends Equatable {
  final String externalId;
  final String email;
  final String? profileExternalId;

  const User({
    required this.externalId,
    required this.email,
    this.profileExternalId,
  });

  @override
  List<Object?> get props => [externalId, email, profileExternalId];
}

