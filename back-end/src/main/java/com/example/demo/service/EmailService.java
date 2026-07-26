package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Réinitialisation de votre mot de passe");
        message.setText(
                "Voici votre code de vérification : " + code + "\n\n" +
                "Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
        );
        mailSender.send(message);
    }
}
