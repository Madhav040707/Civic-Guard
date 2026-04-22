package com.Civic.files.controller;

import com.Civic.files.model.Complaint;
import com.Civic.files.model.Notification;
import com.Civic.files.repository.ComplaintRepository;
import com.Civic.files.repository.NotificationRepository;
import com.Civic.files.service.ComplaintService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin("*")
public class ComplaintController {

    private final ComplaintRepository repo;
    private final ComplaintService service;

    public ComplaintController(ComplaintRepository repo,
                               ComplaintService service) {
        this.repo = repo;
        this.service = service;

    }
    @Autowired
    private NotificationRepository notificationRepo;

    @PostMapping("/upload")
    public Complaint createComplaint(
            @RequestParam("image") MultipartFile image,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("location") String location,
            @RequestParam("userId") String userId
    ) throws IOException {

        String imagePath = service.saveImage(image);

        Complaint complaint = new Complaint(
                description, category, location, imagePath
        );

        complaint.setUserId(userId);
        complaint.setCreatedAt(java.time.LocalDateTime.now());

        return repo.save(complaint);
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return repo.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Complaint> getUserComplaints(@PathVariable String userId) {
        return repo.findByUserId(userId);
    }

    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable String id,
                                  @RequestBody java.util.Map<String, String> body) {

        Complaint c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String status = body.get("status");

        // update complaint
        c.setStatus(status);
        repo.save(c);

        // 🔔 CREATE NOTIFICATION HERE
        Notification n = new Notification();
        n.setUserId(c.getUserId());  // 👈 VERY IMPORTANT
        n.setStatus("UNREAD");
        n.setCreatedAt(new java.util.Date());

        n.setMessage("Your complaint '" + c.getCategory() +
                "' is now " + status +
                "\nDescription: " + c.getDescription());

        notificationRepo.save(n);

        return c;
    }
}
