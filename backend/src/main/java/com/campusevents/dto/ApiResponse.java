package com.campusevents.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Standard API response wrapper for ALL controllers.
 *
 * Success: { "success": true,  "message": "...", "data": {...} }
 * Error:   { "success": false, "message": "...", "errors": [...] }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String  message;
    private T       data;
    private List<String> errors;

    private ApiResponse() {}

    // ── Factory helpers ───────────────────────────────────────────────────────

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.message = message;
        r.data    = data;
        return r;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success("Operation successful", data);
    }

    public static <T> ApiResponse<T> ok(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.message = message;
        r.errors  = errors;
        return r;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public boolean       isSuccess() { return success; }
    public String        getMessage(){ return message;  }
    public T             getData()   { return data;     }
    public List<String>  getErrors() { return errors;   }
}