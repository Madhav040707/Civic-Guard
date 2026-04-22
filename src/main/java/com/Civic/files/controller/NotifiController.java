package com.Civic.files.controller;

import com.Civic.files.model.Notification;
import com.Civic.files.repository.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotifiController {

    @Autowired
    private NotificationRepository notificationRepo;

    // 🔔 GET USER NOTIFICATIONS
    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }
}