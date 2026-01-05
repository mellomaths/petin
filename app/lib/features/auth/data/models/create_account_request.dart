import 'package:json_annotation/json_annotation.dart';

part 'create_account_request.g.dart';

@JsonSerializable()
class CreateAccountRequest {
  final String email;
  final String password;

  CreateAccountRequest({
    required this.email,
    required this.password,
  });

  factory CreateAccountRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateAccountRequestFromJson(json);

  Map<String, dynamic> toJson() => _$CreateAccountRequestToJson(this);
}

