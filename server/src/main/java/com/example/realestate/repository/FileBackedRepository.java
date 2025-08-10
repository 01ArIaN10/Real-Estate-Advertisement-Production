package com.example.realestate.repository;

import com.example.realestate.model.RealEstateModels.RealEstate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@Repository
public class FileBackedRepository implements InitializingBean {
    private final ObjectMapper objectMapper;
    private final Path dataPath;

    private RealEstate cache = new RealEstate();

    public FileBackedRepository() {
        this.objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
        this.dataPath = Path.of("data", "realestate.json");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        if (!Files.exists(dataPath.getParent())) {
            Files.createDirectories(dataPath.getParent());
        }
        if (Files.exists(dataPath)) {
            try {
                cache = objectMapper.readValue(Files.readAllBytes(dataPath), RealEstate.class);
            } catch (IOException e) {
                cache = new RealEstate();
            }
        } else {
            persist();
        }
    }

    public synchronized RealEstate get() {
        return cache;
    }

    public synchronized void set(RealEstate realEstate) {
        this.cache = realEstate;
        persist();
    }

    public synchronized void persist() {
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(cache);
            Files.write(dataPath, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to persist data", e);
        }
    }
}


