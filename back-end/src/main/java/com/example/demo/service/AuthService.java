package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    public AuthResponse login(LoginRequest request) {
        // Spring vérifie email + password, lance une exception si incorrect
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        // Charge le UserDetails construit par SecurityConfig
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        // On récupère le rôle depuis la base pour la réponse
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }

    public AuthResponse register(RegisterRequest request) {
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

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String code = String.format("%06d", RANDOM.nextInt(1_000_000));
            user.setResetCode(code);
            user.setResetCodeExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            emailService.sendResetCode(user.getEmail(), code);
        });

        // Message générique : on ne révèle jamais si l'email existe ou non
        return new MessageResponse("Si cet email existe, un code de vérification a été envoyé.");
    }

    public MessageResponse verifyResetCode(VerifyResetCodeRequest request) {
        getUserWithValidResetCode(request.getEmail(), request.getCode());
        return new MessageResponse("Code vérifié.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = getUserWithValidResetCode(request.getEmail(), request.getCode());

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetCode(null);
        user.setResetCodeExpiry(null);
        userRepository.save(user);

        return new MessageResponse("Mot de passe réinitialisé avec succès.");
    }

    private User getUserWithValidResetCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Code invalide ou expiré."));

        if (user.getResetCode() == null
                || !user.getResetCode().equals(code)
                || user.getResetCodeExpiry() == null
                || user.getResetCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code invalide ou expiré.");
        }

        return user;
    }
}