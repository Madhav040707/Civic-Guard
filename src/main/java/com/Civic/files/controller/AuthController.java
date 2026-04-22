package com.Civic.files.controller;

import com.Civic.files.model.User;
import com.Civic.files.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body) {

        String result = userService.registerUser(
                body.get("name"),
                body.get("email"),
                body.get("password")
        );

        return switch (result) {
            case "SUCCESS" -> ResponseEntity.ok(Map.of("message", "Registration successful!"));
            case "EMAIL_EXISTS" -> ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered."));
            default -> ResponseEntity.internalServerError()
                    .body(Map.of("message", "Something went wrong."));
        };
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        User user = userService.authenticateUser(email, password);

        if (user != null) {
            return ResponseEntity.ok(user); // ✅ THIS FIXES EVERYTHING
        } else {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid email or password"));
        }
    }
}