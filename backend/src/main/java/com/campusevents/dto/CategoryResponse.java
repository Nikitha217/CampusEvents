package com.campusevents.dto;

import lombok.Data;

@Data
public class CategoryResponse {

    private String id;

    private String name;

    private String description;

    private long eventCount;
}