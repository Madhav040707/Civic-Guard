package com.Civic.files.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.Civic.files.model.Complaint;

import java.util.List;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByUserId(String userId);

}

