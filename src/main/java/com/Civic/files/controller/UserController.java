package com.Civic.files.controller;

import com.Civic.files.model.User;
import com.Civic.files.repository.UserRepository;
import com.Civic.files.service.ComplaintService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintService complaintService; // ✅ FIX

    // ================= GET USER =================
    @GetMapping("/{email}")
    public ResponseEntity<User> getUser(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPassword(null); // 🔐 hide password
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ================= UPDATE USER =================
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User updatedUser) {

        User user = userRepository.findById(updatedUser.getId()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        userRepository.save(user);

        user.setPassword(null); // 🔐 safety
        return ResponseEntity.ok(user);
    }

    // ================= UPLOAD PROFILE IMAGE =================
    @PostMapping("/uploadProfile")
    public ResponseEntity<?> uploadProfile(
            @RequestParam("image") MultipartFile file,
            @RequestParam("userId") String userId
    ) throws IOException {

        String path = complaintService.saveImage(file); // ✅ FIX

        User user = userRepository.findById(userId).orElse(null); // ✅ FIX

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setProfileImage(path); // make sure field exists in User.java
        userRepository.save(user);

        user.setPassword(null); // 🔐 safety
        return ResponseEntity.ok(user);
    }
}