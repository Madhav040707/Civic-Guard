package com.Civic.files.service;

import com.Civic.files.model.User;
import com.Civic.files.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    public String registerUser(String name, String email, String password) {

        if (userRepository.findByEmail(email).isPresent()) {
            return "EMAIL_EXISTS";
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);

        // ✅ ENCODE PASSWORD HERE
        user.setPassword(passwordEncoder.encode(password));

        user.setRole("USER");

        userRepository.save(user);

        return "SUCCESS";
    }
    // ── LOGIN ────────────────────────────────
    public String loginUser(String email, String rawPassword) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return "USER_NOT_FOUND";
        }

        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return "SUCCESS";
        }

        return "WRONG_PASSWORD";
    }
    public User authenticateUser(String email, String rawPassword) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return null;
        }

        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }

        return null;
    }
}