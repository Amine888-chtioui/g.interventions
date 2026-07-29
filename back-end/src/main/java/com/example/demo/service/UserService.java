package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public List<UserResponse> getAllUsers(String q) {
        return userRepository.findAll(UserSpecifications.search(q)).stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return toResponse(user);
    }

    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .build();

        return toResponse(userRepository.save(user));
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!user.getEmail().equals(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));

        return toResponse(userRepository.save(user));
    }

    public void deleteUser(Long id, String currentUserEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("Vous ne pouvez pas supprimer votre propre compte");
        }

        userRepository.deleteById(id);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return toResponse(user);
    }

    public ProfileResponse updateProfile(String currentEmail, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!user.getEmail().equals(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new ProfileResponse(
                user.getId(), user.getNom(), user.getPrenom(), user.getEmail(), user.getRole().name(), token);
    }

    public MessageResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Mot de passe modifié avec succès.");
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
