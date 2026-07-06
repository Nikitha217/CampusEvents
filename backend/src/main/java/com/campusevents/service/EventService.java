package com.campusevents.service;

import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // CREATE
    public Event createEvent(Event event) {
        if (event.getStatus() == null || event.getStatus().isEmpty()) {
            event.setStatus("PENDING");
        }
        return eventRepository.save(event);
    }

    // READ ALL
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // READ BY ID
    public Event getEventById(String id) {
        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with ID: " + id
                        ));
    }

    // UPDATE
    public Event updateEvent(String id, Event updatedEvent) {

        Event existingEvent = getEventById(id);

        existingEvent.setTitle(
                updatedEvent.getTitle()
        );
        existingEvent.setDescription(
                updatedEvent.getDescription()
        );
        existingEvent.setStartDate(
                updatedEvent.getStartDate()
        );
        existingEvent.setEndDate(
                updatedEvent.getEndDate()
        );
        existingEvent.setStartTime(
                updatedEvent.getStartTime()
        );
        existingEvent.setEndTime(
                updatedEvent.getEndTime()
        );
        existingEvent.setDuration(
                updatedEvent.getDuration()
        );
        existingEvent.setLocation(
                updatedEvent.getLocation()
        );
        existingEvent.setCategory(
                updatedEvent.getCategory()
        );
        existingEvent.setCategoryId(
                updatedEvent.getCategoryId()
        );
        existingEvent.setMaxParticipants(
                updatedEvent.getMaxParticipants()
        );
        existingEvent.setImage(
                updatedEvent.getImage()
        );
        existingEvent.setCoordinatorId(
                updatedEvent.getCoordinatorId()
        );
        existingEvent.setCoordinatorName(
                updatedEvent.getCoordinatorName()
        );
        existingEvent.setCoordinatorEmail(
                updatedEvent.getCoordinatorEmail()
        );

        if (updatedEvent.getStatus() != null &&
                !updatedEvent.getStatus().isEmpty()) {
            existingEvent.setStatus(
                    updatedEvent.getStatus()
            );
        }

        return eventRepository.save(existingEvent);
    }

    // DELETE
    public void deleteEvent(String id) {
        Event existingEvent = getEventById(id);
        eventRepository.delete(existingEvent);
    }

    // GET PENDING EVENTS
    public List<Event> getPendingEvents() {
        return eventRepository.findByStatusIgnoreCase("PENDING");
    }

    // APPROVE EVENT
    public Event approveEvent(String id) {
        Event event = getEventById(id);
        event.setStatus("APPROVED");
        return eventRepository.save(event);
    }

    // REJECT EVENT
    public Event rejectEvent(String id) {
        Event event = getEventById(id);
        event.setStatus("REJECTED");
        return eventRepository.save(event);
    }
}