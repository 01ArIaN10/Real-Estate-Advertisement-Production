package com.example.realestate.controller;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Validation failed");
        body.put("details", ex.getBindingResult().toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Map<String, Object> body = new HashMap<>();
        String message = "Invalid request format";
        
        if (ex.getCause() instanceof InvalidFormatException) {
            InvalidFormatException ife = (InvalidFormatException) ex.getCause();
            String fieldName = cleanFieldName(ife.getPathReference());
            message = "Invalid value '" + ife.getValue() + "' for field '" + fieldName + "'. Expected " + ife.getTargetType().getSimpleName();
        } else if (ex.getCause() instanceof MismatchedInputException) {
            MismatchedInputException mie = (MismatchedInputException) ex.getCause();
            String fieldName = cleanFieldName(mie.getPathReference());
            message = "Invalid value for field '" + fieldName + "'. Expected " + mie.getTargetType().getSimpleName();
        }
        
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private String cleanFieldName(String pathReference) {
        if (pathReference == null || pathReference.isEmpty()) {
            return "unknown";
        }
        
        // Remove the class name prefix and extract just the field name
        // Example: "com.example.realestate.model.RealEstateModels$ApartmentSale[\"roomCount\"]" -> "roomCount"
        if (pathReference.contains("[\"")) {
            int startIndex = pathReference.indexOf("[\"") + 2;
            int endIndex = pathReference.indexOf("\"]");
            if (startIndex > 1 && endIndex > startIndex) {
                return pathReference.substring(startIndex, endIndex);
            }
        }
        
        // If no brackets found, try to extract the last part after the last dot
        String[] parts = pathReference.split("\\.");
        if (parts.length > 0) {
            String lastPart = parts[parts.length - 1];
            // Remove any remaining class name parts
            if (lastPart.contains("$")) {
                String[] subParts = lastPart.split("\\$");
                if (subParts.length > 1) {
                    return subParts[subParts.length - 1];
                }
            }
            return lastPart;
        }
        
        return pathReference;
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Map<String, Object> body = new HashMap<>();
        String message = "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'. Expected " + ex.getRequiredType().getSimpleName();
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "An unexpected error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}


