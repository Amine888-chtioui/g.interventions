package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication, @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication, @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(authentication.getName(), request));
    }
}
