import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_client.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/create_account_usecase.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';

final getIt = GetIt.instance;

/// Initialize dependency injection
Future<void> initDependencies() async {
  // External dependencies
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerLazySingleton<SharedPreferences>(() => sharedPreferences);

  // API Client
  // Note: Android emulator uses 10.0.2.2 to access host machine's localhost
  // iOS simulator can use localhost directly
  // For physical devices, use your computer's local network IP
  getIt.registerLazySingleton<ApiClient>(
    () => ApiClient(
      baseUrl: const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://localhost:3333', // Use localhost with ADB port forwarding (adb reverse tcp:3333 tcp:3333)
      ),
      prefs: getIt<SharedPreferences>(),
    ),
  );

  // Auth dependencies
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(getIt<ApiClient>()),
  );

  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: getIt<AuthRemoteDataSource>(),
      apiClient: getIt<ApiClient>(),
      prefs: getIt<SharedPreferences>(),
    ),
  );

  getIt.registerLazySingleton<LoginUseCase>(
    () => LoginUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<CreateAccountUseCase>(
    () => CreateAccountUseCase(getIt<AuthRepository>()),
  );

  getIt.registerFactory<AuthBloc>(
    () => AuthBloc(
      loginUseCase: getIt<LoginUseCase>(),
      createAccountUseCase: getIt<CreateAccountUseCase>(),
      authRepository: getIt<AuthRepository>(),
    ),
  );
}

