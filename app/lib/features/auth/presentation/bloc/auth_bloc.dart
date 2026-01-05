import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/error/failures.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/create_account_usecase.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final CreateAccountUseCase createAccountUseCase;
  final AuthRepository authRepository;

  AuthBloc({
    required this.loginUseCase,
    required this.createAccountUseCase,
    required this.authRepository,
  }) : super(const AuthState.initial()) {
    on<LoginEvent>(_onLogin);
    on<CreateAccountEvent>(_onCreateAccount);
    on<LogoutEvent>(_onLogout);
    on<CheckAuthStatusEvent>(_onCheckAuthStatus);
  }

  Future<void> _onLogin(
    LoginEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    final result = await loginUseCase(
      email: event.email,
      password: event.password,
    );

    result.fold(
      (failure) => emit(AuthState.error(_mapFailureToMessage(failure))),
      (tokens) {
        // TODO: Fetch user info and emit authenticated state
        emit(const AuthState.unauthenticated());
      },
    );
  }

  Future<void> _onCreateAccount(
    CreateAccountEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    final result = await createAccountUseCase(
      email: event.email,
      password: event.password,
    );

    result.fold(
      (failure) => emit(AuthState.error(_mapFailureToMessage(failure))),
      (_) => emit(const AuthState.unauthenticated()),
    );
  }

  Future<void> _onLogout(
    LogoutEvent event,
    Emitter<AuthState> emit,
  ) async {
    final result = await authRepository.logout();
    result.fold(
      (failure) => emit(AuthState.error(_mapFailureToMessage(failure))),
      (_) => emit(const AuthState.unauthenticated()),
    );
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatusEvent event,
    Emitter<AuthState> emit,
  ) async {
    // TODO: Check if user is authenticated
    emit(const AuthState.unauthenticated());
  }

  String _mapFailureToMessage(Failure failure) {
    if (failure is ServerFailure) {
      return failure.message;
    } else if (failure is NetworkFailure) {
      return 'No internet connection. Please check your network.';
    } else if (failure is AuthFailure) {
      return failure.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }
}

