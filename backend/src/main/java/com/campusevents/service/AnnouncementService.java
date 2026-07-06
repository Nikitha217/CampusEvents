package com.campusevents.service;

import com.campusevents.entity.Announcement;
import com.campusevents.exception.ResourceNotFoundException;
import com.campusevents.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    // Constructor Injection
    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    // CREATE
    public Announcement createAnnouncement(Announcement announcement) {
        if (announcement.getCreatedAt() == null) {
            announcement.setCreatedAt(LocalDateTime.now());
        }
        return announcementRepository.save(announcement);
    }

    // READ ALL
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    // READ BY ID
    public Announcement getAnnouncementById(String id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with ID: " + id));
    }

    // UPDATE
    public Announcement updateAnnouncement(String id, Announcement updatedAnnouncement) {
        Announcement existingAnnouncement = getAnnouncementById(id);

        existingAnnouncement.setTitle(updatedAnnouncement.getTitle());
        existingAnnouncement.setMessage(updatedAnnouncement.getMessage());
        
        if (updatedAnnouncement.getCreatedBy() != null && !updatedAnnouncement.getCreatedBy().isEmpty()) {
            existingAnnouncement.setCreatedBy(updatedAnnouncement.getCreatedBy());
        }

        return announcementRepository.save(existingAnnouncement);
    }

    // DELETE
    public void deleteAnnouncement(String id) {
        Announcement announcement = getAnnouncementById(id);
        announcementRepository.delete(announcement);
    }
}
