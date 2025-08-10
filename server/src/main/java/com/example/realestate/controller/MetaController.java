package com.example.realestate.controller;

import com.example.realestate.model.RealEstateModels.RealEstate;
import com.example.realestate.repository.FileBackedRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MetaController {

    private final FileBackedRepository repository;

    public MetaController(FileBackedRepository repository) {
        this.repository = repository;
    }

    @GetMapping({"/", ""})
    public Map<String, Object> apiIndex() {
        Map<String, Object> res = new LinkedHashMap<>();
        
        // Get current data from repository
        RealEstate data = repository.get();
        
        // Calculate statistics
        Map<String, Object> statistics = calculateStatistics(data);
        
        // Specific output order: message, developedBy, officialName, studentNumber, description, routes, statistics
        res.put("message", "Welcome to the Real Estate API");
        res.put("developedBy", "Arian");
        res.put("officialName", "Amirmohammad Parchami");
        res.put("studentNumber", "4030711313");
        res.put("description", "This project was developed for the Persian Gulf University Java course.");
        res.put("routes", List.of(
                // Read
                "/api/v1/real-estate",
                
                // Search & Filter
                "/api/v1/real-estate/search?ownership={sale|rent}&propertyType={land|office|shop|villa|apartment}&page={n}&size={m}",
                "/api/v1/real-estate/search/keyword?keyword={text}&page={n}&size={m}",
                "/api/v1/real-estate/filter?ownership={sale|rent}&propertyType={land|office|shop|villa|apartment}&minPrice={n}&maxPrice={n}&minArea={n}&maxArea={n}&minRoomCount={n}&maxRoomCount={n}&minYardArea={n}&maxYardArea={n}&minFloorCount={n}&maxFloorCount={n}&minMortgagePrice={n}&maxMortgagePrice={n}&page={n}&size={m}",
                "/api/v1/real-estate/stats?ownership={sale|rent}&propertyType={land|office|shop|villa|apartment}",
                
                // Create (Sale)
                "POST /api/v1/real-estate/sale/land",
                "POST /api/v1/real-estate/sale/commercial/office",
                "POST /api/v1/real-estate/sale/commercial/shop",
                "POST /api/v1/real-estate/sale/residential/villa",
                "POST /api/v1/real-estate/sale/residential/apartment",
                
                // Create (Rent)
                "POST /api/v1/real-estate/rent/land",
                "POST /api/v1/real-estate/rent/commercial/office",
                "POST /api/v1/real-estate/rent/commercial/shop",
                "POST /api/v1/real-estate/rent/residential/villa",
                "POST /api/v1/real-estate/rent/residential/apartment",
                
                // Delete
                "DELETE /api/v1/real-estate/{ownership}/{propertyType}/{id}",
                
                // API Info
                "GET /api/"
        ));
        res.put("statistics", statistics);
        // Optional extra
        res.put("footer", "Developed By Arian");
        return res;
    }

    private Map<String, Object> calculateStatistics(RealEstate data) {
        Map<String, Object> stats = new LinkedHashMap<>();
        
        // Sale statistics
        Map<String, Object> saleStats = new LinkedHashMap<>();
        saleStats.put("land", data.getSale().getLand().size());
        saleStats.put("office", data.getSale().getCommercial().getOffice().size());
        saleStats.put("shop", data.getSale().getCommercial().getShop().size());
        saleStats.put("villa", data.getSale().getResidential().getVilla().size());
        saleStats.put("apartment", data.getSale().getResidential().getApartment().size());
        saleStats.put("total", data.getSale().getLand().size() + 
                           data.getSale().getCommercial().getOffice().size() + 
                           data.getSale().getCommercial().getShop().size() + 
                           data.getSale().getResidential().getVilla().size() + 
                           data.getSale().getResidential().getApartment().size());
        
        // Rent statistics
        Map<String, Object> rentStats = new LinkedHashMap<>();
        rentStats.put("land", data.getRent().getLand().size());
        rentStats.put("office", data.getRent().getCommercial().getOffice().size());
        rentStats.put("shop", data.getRent().getCommercial().getShop().size());
        rentStats.put("villa", data.getRent().getResidential().getVilla().size());
        rentStats.put("apartment", data.getRent().getResidential().getApartment().size());
        rentStats.put("total", data.getRent().getLand().size() + 
                           data.getRent().getCommercial().getOffice().size() + 
                           data.getRent().getCommercial().getShop().size() + 
                           data.getRent().getResidential().getVilla().size() + 
                           data.getRent().getResidential().getApartment().size());
        
        // Overall statistics
        Map<String, Object> overallStats = new LinkedHashMap<>();
        overallStats.put("totalProperties", (Integer)saleStats.get("total") + (Integer)rentStats.get("total"));
        overallStats.put("saleProperties", saleStats.get("total"));
        overallStats.put("rentProperties", rentStats.get("total"));
        
        // Property type breakdown
        Map<String, Object> propertyTypeStats = new LinkedHashMap<>();
        propertyTypeStats.put("land", (Integer)saleStats.get("land") + (Integer)rentStats.get("land"));
        propertyTypeStats.put("office", (Integer)saleStats.get("office") + (Integer)rentStats.get("office"));
        propertyTypeStats.put("shop", (Integer)saleStats.get("shop") + (Integer)rentStats.get("shop"));
        propertyTypeStats.put("villa", (Integer)saleStats.get("villa") + (Integer)rentStats.get("villa"));
        propertyTypeStats.put("apartment", (Integer)saleStats.get("apartment") + (Integer)rentStats.get("apartment"));
        
        stats.put("sale", saleStats);
        stats.put("rent", rentStats);
        stats.put("overall", overallStats);
        stats.put("byPropertyType", propertyTypeStats);
        
        return stats;
    }
}


