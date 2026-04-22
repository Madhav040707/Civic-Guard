package com.Civic.files.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;


@Service
public class ComplaintService {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public static String saveImage(MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        File uploadDir = new File(UPLOAD_DIR);

        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String filePath = UPLOAD_DIR + fileName;

        File destination = new File(filePath);
        file.transferTo(destination);
        return "/uploads/" + fileName;
    }
}