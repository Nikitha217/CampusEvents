package com.campusevents.service;

import com.campusevents.events.Registration;
import com.campusevents.exception.ResourceNotFoundException;
import com.campusevents.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            NotificationService notificationService
    ) {

        this.registrationRepository =
                registrationRepository;

        this.notificationService =
                notificationService;
    }

    // CREATE
    public Registration createRegistration(
            Registration registration
    ) {

        if (
                registration.getStatus() == null ||
                registration.getStatus().isEmpty()
        ) {

            registration.setStatus(
                    "REGISTERED"
            );
        }

        Registration saved =
                registrationRepository.save(
                        registration
                );

        // Notification
        notificationService.create(
                registration.getStudentEmail(),
                "STUDENT",
                "Registration Successful",
                "You have successfully registered for "
                        + registration.getEventTitle(),
                "REGISTRATION",
                saved.getId()
        );

        return saved;
    }

    // READ ALL
    public List<Registration> getAllRegistrations() {

        return registrationRepository.findAll();
    }

    // READ BY ID
    public Registration getRegistrationById(
            String id
    ) {

        return registrationRepository.findById(id)
                .orElseThrow(() ->

                        new ResourceNotFoundException(
                                "Registration not found with ID: "
                                        + id
                        )
                );
    }

    // UPDATE
    public Registration updateRegistration(
            String id,
            Registration updatedRegistration
    ) {

        Registration existingRegistration =
                getRegistrationById(id);

        existingRegistration.setStudentName(
                updatedRegistration.getStudentName()
        );

        existingRegistration.setStudentEmail(
                updatedRegistration.getStudentEmail()
        );

        existingRegistration.setEventId(
                updatedRegistration.getEventId()
        );

        existingRegistration.setEventTitle(
                updatedRegistration.getEventTitle()
        );

        if (
                updatedRegistration.getStatus() != null &&
                !updatedRegistration.getStatus().isEmpty()
        ) {

            existingRegistration.setStatus(
                    updatedRegistration.getStatus()
            );
        }

        return registrationRepository.save(
                existingRegistration
        );
    }

    // DELETE
    public void deleteRegistration(
            String id
    ) {

        Registration existingRegistration =
                getRegistrationById(id);

        registrationRepository.delete(
                existingRegistration
        );
    }

    // READ BY EVENT ID
    public List<Registration> getRegistrationsByEventId(
            String eventId
    ) {

        return registrationRepository.findByEventId(
                eventId
        );
    }

    // READ BY STUDENT EMAIL
    public List<Registration> getRegistrationsByStudentEmail(
            String email
    ) {

        return registrationRepository.findByStudentEmail(
                email
        );
    }

    // APPROVE REGISTRATION
    public Registration approveRegistration(
            String id
    ) {

        Registration registration =
                getRegistrationById(id);

        registration.setStatus(
                "APPROVED"
        );

        Registration saved =
                registrationRepository.save(
                        registration
                );

        notificationService.create(
                registration.getStudentEmail(),
                "STUDENT",
                "Registration Approved",
                "Your registration for "
                        + registration.getEventTitle()
                        + " was approved",
                "REGISTRATION",
                registration.getId()
        );

        return saved;
    }

    // REJECT REGISTRATION
    public Registration rejectRegistration(
            String id
    ) {

        Registration registration =
                getRegistrationById(id);

        registration.setStatus(
                "REJECTED"
        );

        Registration saved =
                registrationRepository.save(
                        registration
                );

        notificationService.create(
                registration.getStudentEmail(),
                "STUDENT",
                "Registration Rejected",
                "Your registration for "
                        + registration.getEventTitle()
                        + " was rejected",
                "REGISTRATION",
                registration.getId()
        );

        return saved;
    }
}