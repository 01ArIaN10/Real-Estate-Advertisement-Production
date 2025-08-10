package com.example.realestate.controller;

import com.example.realestate.model.RealEstateModels.*;
import com.example.realestate.service.RealEstateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/real-estate")
public class RealEstateController {
    private final RealEstateService service;

    public RealEstateController(RealEstateService service) {
        this.service = service;
    }

    // View all data
    @GetMapping
    public RealEstate getAll() {
        return service.getAll();
    }

    // Search by ownership and property type
    @GetMapping("/search")
    public List<Object> search(@RequestParam String ownership,
                               @RequestParam(required = false) String propertyType,
                               @RequestParam(required = false) Integer page,
                               @RequestParam(required = false) Integer size) {
        List<Object> results = service.search(ownership, propertyType);
        return service.paginateList(results, page, size);
    }

    // Search by keyword across all properties
    @GetMapping("/search/keyword")
    public List<Object> searchByKeyword(@RequestParam String keyword,
                                        @RequestParam(required = false) Integer page,
                                        @RequestParam(required = false) Integer size) {
        List<Object> results = service.searchByKeyword(keyword);
        return service.paginateList(results, page, size);
    }

    // Advanced filter search
    @GetMapping("/filter")
    public List<Object> filter(@RequestParam String ownership,
                               @RequestParam(required = false) String propertyType,
                               @RequestParam(required = false) Double minPrice,
                               @RequestParam(required = false) Double maxPrice,
                               @RequestParam(required = false) Double minArea,
                               @RequestParam(required = false) Double maxArea,
                               @RequestParam(required = false) Integer minRoomCount,
                               @RequestParam(required = false) Integer maxRoomCount,
                               @RequestParam(required = false) Double minYardArea,
                               @RequestParam(required = false) Double maxYardArea,
                                @RequestParam(required = false) Integer minFloorCount,
                                @RequestParam(required = false) Integer maxFloorCount,
                                @RequestParam(required = false) Double minMortgagePrice,
                                @RequestParam(required = false) Double maxMortgagePrice,
                               @RequestParam(required = false) Integer page,
                               @RequestParam(required = false) Integer size) {
        List<Object> results = service.filter(ownership, propertyType, minPrice, maxPrice, minArea, maxArea, minRoomCount, maxRoomCount, minYardArea, maxYardArea, minFloorCount, maxFloorCount, minMortgagePrice, maxMortgagePrice);
        return service.paginateList(results, page, size);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@RequestParam String ownership,
                                     @RequestParam(required = false) String propertyType) {
        return service.stats(ownership, propertyType);
    }

    /* === Create === */
    @PostMapping("/sale/land")
    public LandSale createLandSale(@Valid @RequestBody LandSale req) { return service.addLandSale(req); }

    @PostMapping("/sale/commercial/office")
    public OfficeSale createOfficeSale(@Valid @RequestBody OfficeSale req) { return service.addOfficeSale(req); }

    @PostMapping("/sale/commercial/shop")
    public ShopSale createShopSale(@Valid @RequestBody ShopSale req) { return service.addShopSale(req); }

    @PostMapping("/sale/residential/villa")
    public VillaSale createVillaSale(@Valid @RequestBody VillaSale req) { return service.addVillaSale(req); }

    @PostMapping("/sale/residential/apartment")
    public ApartmentSale createApartmentSale(@Valid @RequestBody ApartmentSale req) { return service.addApartmentSale(req); }

    @PostMapping("/rent/land")
    public LandRent createLandRent(@Valid @RequestBody LandRent req) { return service.addLandRent(req); }

    @PostMapping("/rent/commercial/office")
    public OfficeRent createOfficeRent(@Valid @RequestBody OfficeRent req) { return service.addOfficeRent(req); }

    @PostMapping("/rent/commercial/shop")
    public ShopRent createShopRent(@Valid @RequestBody ShopRent req) { return service.addShopRent(req); }

    @PostMapping("/rent/residential/villa")
    public VillaRent createVillaRent(@Valid @RequestBody VillaRent req) { return service.addVillaRent(req); }

    @PostMapping("/rent/residential/apartment")
    public ApartmentRent createApartmentRent(@Valid @RequestBody ApartmentRent req) { return service.addApartmentRent(req); }

    /* === Delete === */
    @DeleteMapping("/{ownership}/{propertyType}/{id}")
    public ResponseEntity<Void> delete(@PathVariable String ownership,
                                       @PathVariable String propertyType,
                                       @PathVariable String id) {
        boolean removed = service.delete(ownership, propertyType, id);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}


