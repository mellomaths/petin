// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_account_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateAccountRequest _$CreateAccountRequestFromJson(
  Map<String, dynamic> json,
) => CreateAccountRequest(
  email: json['email'] as String,
  password: json['password'] as String,
);

Map<String, dynamic> _$CreateAccountRequestToJson(
  CreateAccountRequest instance,
) => <String, dynamic>{'email': instance.email, 'password': instance.password};
