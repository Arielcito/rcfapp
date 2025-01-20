class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phoneNumber;
  final String role;
  final List<String> prediosFavoritos;
  final bool isPhoneVerified;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phoneNumber,
    required this.role,
    this.prediosFavoritos = const [],
    this.isPhoneVerified = false,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      phoneNumber: map['phoneNumber'],
      role: map['role'] ?? 'user',
      prediosFavoritos: List<String>.from(map['prediosFavoritos'] ?? []),
      isPhoneVerified: map['isPhoneVerified'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phoneNumber': phoneNumber,
      'role': role,
      'prediosFavoritos': prediosFavoritos,
      'isPhoneVerified': isPhoneVerified,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? phoneNumber,
    String? role,
    List<String>? prediosFavoritos,
    bool? isPhoneVerified,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      role: role ?? this.role,
      prediosFavoritos: prediosFavoritos ?? this.prediosFavoritos,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
    );
  }
} 