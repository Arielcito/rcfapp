class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;
  final bool emailVerified;
  final String? image;
  final String? predioTrabajo;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.emailVerified,
    this.image,
    this.predioTrabajo,
    required this.createdAt,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      role: map['role'] ?? 'USER',
      emailVerified: map['emailVerified'] ?? false,
      image: map['image'],
      predioTrabajo: map['predioTrabajo'],
      createdAt: map['createdAt'] != null 
        ? DateTime.parse(map['createdAt']) 
        : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'emailVerified': emailVerified,
      'image': image,
      'predioTrabajo': predioTrabajo,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? role,
    bool? emailVerified,
    String? image,
    String? predioTrabajo,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      emailVerified: emailVerified ?? this.emailVerified,
      image: image ?? this.image,
      predioTrabajo: predioTrabajo ?? this.predioTrabajo,
      createdAt: createdAt ?? this.createdAt,
    );
  }
} 