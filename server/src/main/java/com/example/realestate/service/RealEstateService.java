package com.example.realestate.service;

import com.example.realestate.model.RealEstateModels.*;
import com.example.realestate.repository.FileBackedRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RealEstateService {
    private final FileBackedRepository repository;

    public RealEstateService(FileBackedRepository repository) {
        this.repository = repository;
    }

    public RealEstate getAll() {
        return repository.get();
    }

    public List<Object> search(String ownership, String propertyType) {
        RealEstate data = repository.get();
        List<Object> result = new ArrayList<>();

        if ("sale".equalsIgnoreCase(ownership)) {
            if (propertyType == null) {
                result.addAll(data.getSale().getLand());
                result.addAll(data.getSale().getCommercial().getOffice());
                result.addAll(data.getSale().getCommercial().getShop());
                result.addAll(data.getSale().getResidential().getVilla());
                result.addAll(data.getSale().getResidential().getApartment());
            } else switch (propertyType.toLowerCase()) {
                case "land" -> result.addAll(data.getSale().getLand());
                case "office" -> result.addAll(data.getSale().getCommercial().getOffice());
                case "shop" -> result.addAll(data.getSale().getCommercial().getShop());
                case "commercial" -> { result.addAll(data.getSale().getCommercial().getOffice()); result.addAll(data.getSale().getCommercial().getShop()); }
                case "villa" -> result.addAll(data.getSale().getResidential().getVilla());
                case "apartment" -> result.addAll(data.getSale().getResidential().getApartment());
                case "residential" -> { result.addAll(data.getSale().getResidential().getVilla()); result.addAll(data.getSale().getResidential().getApartment()); }
            }
        } else if ("rent".equalsIgnoreCase(ownership)) {
            if (propertyType == null) {
                result.addAll(data.getRent().getLand());
                result.addAll(data.getRent().getCommercial().getOffice());
                result.addAll(data.getRent().getCommercial().getShop());
                result.addAll(data.getRent().getResidential().getVilla());
                result.addAll(data.getRent().getResidential().getApartment());
            } else switch (propertyType.toLowerCase()) {
                case "land" -> result.addAll(data.getRent().getLand());
                case "office" -> result.addAll(data.getRent().getCommercial().getOffice());
                case "shop" -> result.addAll(data.getRent().getCommercial().getShop());
                case "commercial" -> { result.addAll(data.getRent().getCommercial().getOffice()); result.addAll(data.getRent().getCommercial().getShop()); }
                case "villa" -> result.addAll(data.getRent().getResidential().getVilla());
                case "apartment" -> result.addAll(data.getRent().getResidential().getApartment());
                case "residential" -> { result.addAll(data.getRent().getResidential().getVilla()); result.addAll(data.getRent().getResidential().getApartment()); }
            }
        }
        return result;
    }

    public List<Object> searchByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        String searchTerm = keyword.trim().toLowerCase();
        RealEstate data = repository.get();
        List<Object> result = new ArrayList<>();
        
        // Search in sale properties
        result.addAll(searchInList(data.getSale().getLand(), searchTerm));
        result.addAll(searchInList(data.getSale().getCommercial().getOffice(), searchTerm));
        result.addAll(searchInList(data.getSale().getCommercial().getShop(), searchTerm));
        result.addAll(searchInList(data.getSale().getResidential().getVilla(), searchTerm));
        result.addAll(searchInList(data.getSale().getResidential().getApartment(), searchTerm));
        
        // Search in rent properties
        result.addAll(searchInList(data.getRent().getLand(), searchTerm));
        result.addAll(searchInList(data.getRent().getCommercial().getOffice(), searchTerm));
        result.addAll(searchInList(data.getRent().getCommercial().getShop(), searchTerm));
        result.addAll(searchInList(data.getRent().getResidential().getVilla(), searchTerm));
        result.addAll(searchInList(data.getRent().getResidential().getApartment(), searchTerm));
        
        return result;
    }
    
    private <T> List<T> searchInList(List<T> items, String searchTerm) {
        return items.stream()
            .filter(item -> matchesKeyword(item, searchTerm))
            .collect(Collectors.toList());
    }
    
    private boolean matchesKeyword(Object item, String searchTerm) {
        try {
            // Get the data object from the item
            var dataField = item.getClass().getDeclaredField("data");
            dataField.setAccessible(true);
            Object data = dataField.get(item);
            
            // Build searchable text from all relevant fields
            StringBuilder searchableText = new StringBuilder();
            
            // Add ID
            try {
                var idField = item.getClass().getDeclaredField("id");
                idField.setAccessible(true);
                Object id = idField.get(item);
                if (id != null) {
                    searchableText.append(id.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add owner name
            try {
                var ownerField = data.getClass().getDeclaredField("ownerFullName");
                ownerField.setAccessible(true);
                Object owner = ownerField.get(data);
                if (owner != null) {
                    searchableText.append(owner.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add address
            try {
                var addressField = data.getClass().getDeclaredField("address");
                addressField.setAccessible(true);
                Object address = addressField.get(data);
                if (address != null) {
                    searchableText.append(address.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add email
            try {
                var emailField = data.getClass().getDeclaredField("email");
                emailField.setAccessible(true);
                Object email = emailField.get(data);
                if (email != null) {
                    searchableText.append(email.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add whatUse for land properties
            try {
                var whatUseField = item.getClass().getDeclaredField("whatUse");
                whatUseField.setAccessible(true);
                Object whatUse = whatUseField.get(item);
                if (whatUse != null) {
                    searchableText.append(whatUse.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add room count
            try {
                var roomCountField = item.getClass().getDeclaredField("roomCount");
                roomCountField.setAccessible(true);
                Object roomCount = roomCountField.get(item);
                if (roomCount != null) {
                    searchableText.append(roomCount.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add floor count
            try {
                var floorCountField = item.getClass().getDeclaredField("floorCount");
                floorCountField.setAccessible(true);
                Object floorCount = floorCountField.get(item);
                if (floorCount != null) {
                    searchableText.append(floorCount.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add yard area
            try {
                var yardAreaField = item.getClass().getDeclaredField("yardArea");
                yardAreaField.setAccessible(true);
                Object yardArea = yardAreaField.get(item);
                if (yardArea != null) {
                    searchableText.append(yardArea.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add area
            try {
                var areaField = data.getClass().getDeclaredField("area");
                areaField.setAccessible(true);
                Object area = areaField.get(data);
                if (area != null) {
                    searchableText.append(area.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {}
            
            // Add price (fullPrice or rentPrice)
            try {
                var fullPriceField = data.getClass().getDeclaredField("fullPrice");
                fullPriceField.setAccessible(true);
                Object fullPrice = fullPriceField.get(data);
                if (fullPrice != null) {
                    searchableText.append(fullPrice.toString().toLowerCase()).append(" ");
                }
            } catch (NoSuchFieldException ignored) {
                try {
                    var rentPriceField = data.getClass().getDeclaredField("rentPrice");
                    rentPriceField.setAccessible(true);
                    Object rentPrice = rentPriceField.get(data);
                    if (rentPrice != null) {
                        searchableText.append(rentPrice.toString().toLowerCase()).append(" ");
                    }
                } catch (NoSuchFieldException ignored2) {}
            }
            
            return searchableText.toString().contains(searchTerm);
            
        } catch (Exception e) {
            // If any reflection fails, don't include the item
            return false;
        }
    }

    public List<Object> paginateList(List<Object> items, Integer page, Integer size) {
        if (items == null) return new ArrayList<>();
        int effectiveSize = (size == null || size <= 0) ? 5 : size;
        int effectivePage = (page == null || page < 0) ? 0 : page;
        int fromIndex = Math.min(effectivePage * effectiveSize, items.size());
        int toIndex = Math.min(fromIndex + effectiveSize, items.size());
        return items.subList(fromIndex, toIndex);
    }

    /* === Add === */
    public LandSale addLandSale(LandSale item) {
        validateCommonData(item.getData(), true);
        validateLandUsage(item.getWhatUse());
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getSale().getLand().add(item);
        repository.persist();
        return item;
    }

    public OfficeSale addOfficeSale(OfficeSale item) {
        validateCommonData(item.getData(), true);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getSale().getCommercial().getOffice().add(item);
        repository.persist();
        return item;
    }

    public ShopSale addShopSale(ShopSale item) {
        validateCommonData(item.getData(), true);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getSale().getCommercial().getShop().add(item);
        repository.persist();
        return item;
    }

    public VillaSale addVillaSale(VillaSale item) {
        validateCommonData(item.getData(), true);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getSale().getResidential().getVilla().add(item);
        repository.persist();
        return item;
    }

    public ApartmentSale addApartmentSale(ApartmentSale item) {
        validateCommonData(item.getData(), true);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getSale().getResidential().getApartment().add(item);
        repository.persist();
        return item;
    }

    public LandRent addLandRent(LandRent item) {
        validateCommonData(item.getData(), false);
        validateLandUsage(item.getWhatUse());
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getRent().getLand().add(item);
        repository.persist();
        return item;
    }

    public OfficeRent addOfficeRent(OfficeRent item) {
        validateCommonData(item.getData(), false);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getRent().getCommercial().getOffice().add(item);
        repository.persist();
        return item;
    }

    public ShopRent addShopRent(ShopRent item) {
        validateCommonData(item.getData(), false);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getRent().getCommercial().getShop().add(item);
        repository.persist();
        return item;
    }

    public VillaRent addVillaRent(VillaRent item) {
        validateCommonData(item.getData(), false);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getRent().getResidential().getVilla().add(item);
        repository.persist();
        return item;
    }

    public ApartmentRent addApartmentRent(ApartmentRent item) {
        validateCommonData(item.getData(), false);
        item.setId(UUID.randomUUID().toString());
        RealEstate d = repository.get();
        d.getRent().getResidential().getApartment().add(item);
        repository.persist();
        return item;
    }

    private void validateLandUsage(String whatUse) {
        if (whatUse == null) {
            throw new IllegalArgumentException("whatUse is required for land and must be 'residential' or 'commercial'");
        }
        String v = whatUse.trim().toLowerCase();
        if (!v.equals("residential") && !v.equals("commercial")) {
            throw new IllegalArgumentException("Invalid whatUse for land. Allowed: residential, commercial");
        }
    }

    private void validateCommonData(Object data, boolean isSale) {
        if (data == null) throw new IllegalArgumentException("data is required");
        try {
            var addressF = data.getClass().getDeclaredField("address"); addressF.setAccessible(true);
            var emailF = data.getClass().getDeclaredField("email"); emailF.setAccessible(true);
            var areaF = data.getClass().getDeclaredField("area"); areaF.setAccessible(true);
            var ownerF = data.getClass().getDeclaredField("ownerFullName"); ownerF.setAccessible(true);

            String address = String.valueOf(addressF.get(data));
            String email = String.valueOf(emailF.get(data));
            double area = ((Number) areaF.get(data)).doubleValue();
            String owner = String.valueOf(ownerF.get(data));

            if (address == null || address.trim().isEmpty()) throw new IllegalArgumentException("address is required");
            if (owner == null || owner.trim().isEmpty()) throw new IllegalArgumentException("Owner Full Name is required");
            if (!owner.matches("^[A-Za-z]+\\s[A-Za-z]+$")) throw new IllegalArgumentException("Owner Full Name must be in format 'FirstName LastName' (only letters, exactly one space)");
            if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) throw new IllegalArgumentException("email is invalid");
            if (area <= 0) throw new IllegalArgumentException("area must be greater than 0");

            if (isSale) {
                var priceF = data.getClass().getDeclaredField("fullPrice"); priceF.setAccessible(true);
                double price = ((Number) priceF.get(data)).doubleValue();
                if (price <= 0) throw new IllegalArgumentException("fullPrice must be greater than 0");
            } else {
                var rentF = data.getClass().getDeclaredField("rentPrice"); rentF.setAccessible(true);
                var mortF = data.getClass().getDeclaredField("mortgagePrice"); mortF.setAccessible(true);
                double rent = ((Number) rentF.get(data)).doubleValue();
                double mort = ((Number) mortF.get(data)).doubleValue();
                if (rent <= 0) throw new IllegalArgumentException("rentPrice must be greater than 0");
                if (mort < 0) throw new IllegalArgumentException("mortgagePrice cannot be negative");
            }
        } catch (NoSuchFieldException e) {
            throw new IllegalArgumentException("Invalid data object");
        } catch (ClassCastException e) {
            throw new IllegalArgumentException("Numeric fields must be numbers");
        } catch (NullPointerException e) {
            throw new IllegalArgumentException("All fields are required");
        } catch (IllegalAccessException e) {
            throw new IllegalArgumentException("Validation error");
        }
    }

    /* === Delete === */
    public boolean delete(String ownership, String propertyType, String id) {
        RealEstate d = repository.get();
        boolean removed = false;
        if ("sale".equalsIgnoreCase(ownership)) {
            switch (propertyType.toLowerCase()) {
                case "land" -> removed = d.getSale().getLand().removeIf(x -> id.equals(x.getId()));
                case "office" -> removed = d.getSale().getCommercial().getOffice().removeIf(x -> id.equals(x.getId()));
                case "shop" -> removed = d.getSale().getCommercial().getShop().removeIf(x -> id.equals(x.getId()));
                case "villa" -> removed = d.getSale().getResidential().getVilla().removeIf(x -> id.equals(x.getId()));
                case "apartment" -> removed = d.getSale().getResidential().getApartment().removeIf(x -> id.equals(x.getId()));
                default -> {}
            }
        } else if ("rent".equalsIgnoreCase(ownership)) {
            switch (propertyType.toLowerCase()) {
                case "land" -> removed = d.getRent().getLand().removeIf(x -> id.equals(x.getId()));
                case "office" -> removed = d.getRent().getCommercial().getOffice().removeIf(x -> id.equals(x.getId()));
                case "shop" -> removed = d.getRent().getCommercial().getShop().removeIf(x -> id.equals(x.getId()));
                case "villa" -> removed = d.getRent().getResidential().getVilla().removeIf(x -> id.equals(x.getId()));
                case "apartment" -> removed = d.getRent().getResidential().getApartment().removeIf(x -> id.equals(x.getId()));
                default -> {}
            }
        }
        if (removed) repository.persist();
        return removed;
    }

    /* === Advanced Filter === */
    public List<Object> filter(String ownership, String propertyType, Double minPrice, Double maxPrice, 
                              Double minArea, Double maxArea, Integer minRoomCount, Integer maxRoomCount,
                              Double minYardArea, Double maxYardArea, Integer minFloorCount, Integer maxFloorCount,
                              Double minMortgagePrice, Double maxMortgagePrice) {
        // First get base search results
        List<Object> baseResults = search(ownership, propertyType);
        
        // Apply additional filters
        return baseResults.stream()
            .filter(item -> matchesFilters(item, minPrice, maxPrice, minArea, maxArea, minRoomCount, maxRoomCount,
                                            minYardArea, maxYardArea, minFloorCount, maxFloorCount,
                                            minMortgagePrice, maxMortgagePrice))
            .collect(Collectors.toList());
    }
    
    private boolean matchesFilters(Object item, Double minPrice, Double maxPrice, 
                                 Double minArea, Double maxArea, Integer minRoomCount, Integer maxRoomCount,
                                 Double minYardArea, Double maxYardArea, Integer minFloorCount, Integer maxFloorCount,
                                 Double minMortgagePrice, Double maxMortgagePrice) {
        try {
            // Use reflection to get common fields
            var dataField = item.getClass().getDeclaredField("data");
            dataField.setAccessible(true);
            Object data = dataField.get(item);
            
            // Check area filter
            if (minArea != null || maxArea != null) {
                var areaField = data.getClass().getDeclaredField("area");
                areaField.setAccessible(true);
                double area = (Double) areaField.get(data);
                if (minArea != null && area < minArea) return false;
                if (maxArea != null && area > maxArea) return false;
            }
            
            // Check price filter (fullPrice or rentPrice)
            if (minPrice != null || maxPrice != null) {
                Double price = null;
                try {
                    var fullPriceField = data.getClass().getDeclaredField("fullPrice");
                    fullPriceField.setAccessible(true);
                    price = (Double) fullPriceField.get(data);
                } catch (NoSuchFieldException e) {
                    try {
                        var rentPriceField = data.getClass().getDeclaredField("rentPrice");
                        rentPriceField.setAccessible(true);
                        price = (Double) rentPriceField.get(data);
                    } catch (NoSuchFieldException ignored) {}
                }
                if (price != null) {
                    if (minPrice != null && price < minPrice) return false;
                    if (maxPrice != null && price > maxPrice) return false;
                }
            }

            // Check mortgage filter (rent only)
            if (minMortgagePrice != null || maxMortgagePrice != null) {
                try {
                    var mortgageField = data.getClass().getDeclaredField("mortgagePrice");
                    mortgageField.setAccessible(true);
                    Double mortgage = (Double) mortgageField.get(data);
                    if (mortgage != null) {
                        if (minMortgagePrice != null && mortgage < minMortgagePrice) return false;
                        if (maxMortgagePrice != null && mortgage > maxMortgagePrice) return false;
                    }
                } catch (NoSuchFieldException ignored) {}
            }
            
            // Check room count filter
            if (minRoomCount != null || maxRoomCount != null) {
                try {
                    var roomCountField = item.getClass().getDeclaredField("roomCount");
                    roomCountField.setAccessible(true);
                    Integer roomCount = (Integer) roomCountField.get(item);
                    if (roomCount != null) {
                        if (minRoomCount != null && roomCount < minRoomCount) return false;
                        if (maxRoomCount != null && roomCount > maxRoomCount) return false;
                    }
                } catch (NoSuchFieldException ignored) {
                    // Some properties don't have room count, skip this filter
                }
            }

            // Check yard area (villa)
            if (minYardArea != null || maxYardArea != null) {
                try {
                    var yardAreaField = item.getClass().getDeclaredField("yardArea");
                    yardAreaField.setAccessible(true);
                    Double yardArea = (Double) yardAreaField.get(item);
                    if (yardArea != null) {
                        if (minYardArea != null && yardArea < minYardArea) return false;
                        if (maxYardArea != null && yardArea > maxYardArea) return false;
                    }
                } catch (NoSuchFieldException ignored) {}
            }

            // Check floor count (apartment)
            if (minFloorCount != null || maxFloorCount != null) {
                try {
                    var floorCountField = item.getClass().getDeclaredField("floorCount");
                    floorCountField.setAccessible(true);
                    Integer floorCount = (Integer) floorCountField.get(item);
                    if (floorCount != null) {
                        if (minFloorCount != null && floorCount < minFloorCount) return false;
                        if (maxFloorCount != null && floorCount > maxFloorCount) return false;
                    }
                } catch (NoSuchFieldException ignored) {}
            }
            
            return true;
        } catch (Exception e) {
            // If any reflection fails, include the item
            return true;
        }
    }

    public Map<String, Object> stats(String ownership, String propertyType) {
        List<Object> items = search(ownership, propertyType);
        Double minArea = null, maxArea = null, minPrice = null, maxPrice = null, minYardArea = null, maxYardArea = null;
        Double minMortgagePrice = null, maxMortgagePrice = null;
        Integer minRoom = null, maxRoom = null, minFloor = null, maxFloor = null;

        for (Object item : items) {
            try {
                var dataField = item.getClass().getDeclaredField("data");
                dataField.setAccessible(true);
                Object data = dataField.get(item);

                // area
                try {
                    var areaField = data.getClass().getDeclaredField("area");
                    areaField.setAccessible(true);
                    double v = (Double) areaField.get(data);
                    minArea = minArea == null ? v : Math.min(minArea, v);
                    maxArea = maxArea == null ? v : Math.max(maxArea, v);
                } catch (NoSuchFieldException ignored) {}

                // price (fullPrice or rentPrice)
                Double price = null;
                try {
                    var fp = data.getClass().getDeclaredField("fullPrice");
                    fp.setAccessible(true);
                    price = (Double) fp.get(data);
                } catch (NoSuchFieldException e) {
                    try {
                        var rp = data.getClass().getDeclaredField("rentPrice");
                        rp.setAccessible(true);
                        price = (Double) rp.get(data);
                    } catch (NoSuchFieldException ignored) {}
                }
                if (price != null) {
                    minPrice = minPrice == null ? price : Math.min(minPrice, price);
                    maxPrice = maxPrice == null ? price : Math.max(maxPrice, price);
                }

                // mortgagePrice (only for rent properties)
                if ("rent".equals(ownership)) {
                    try {
                        var mp = data.getClass().getDeclaredField("mortgagePrice");
                        mp.setAccessible(true);
                        Double mortgagePrice = (Double) mp.get(data);
                        if (mortgagePrice != null) {
                            minMortgagePrice = minMortgagePrice == null ? mortgagePrice : Math.min(minMortgagePrice, mortgagePrice);
                            maxMortgagePrice = maxMortgagePrice == null ? mortgagePrice : Math.max(maxMortgagePrice, mortgagePrice);
                        }
                    } catch (NoSuchFieldException ignored) {}
                }

                // roomCount
                try {
                    var rc = item.getClass().getDeclaredField("roomCount");
                    rc.setAccessible(true);
                    Integer v = (Integer) rc.get(item);
                    if (v != null) { minRoom = minRoom == null ? v : Math.min(minRoom, v); maxRoom = maxRoom == null ? v : Math.max(maxRoom, v); }
                } catch (NoSuchFieldException ignored) {}

                // floorCount
                try {
                    var fc = item.getClass().getDeclaredField("floorCount");
                    fc.setAccessible(true);
                    Integer v = (Integer) fc.get(item);
                    if (v != null) { minFloor = minFloor == null ? v : Math.min(minFloor, v); maxFloor = maxFloor == null ? v : Math.max(maxFloor, v); }
                } catch (NoSuchFieldException ignored) {}

                // yardArea
                try {
                    var ya = item.getClass().getDeclaredField("yardArea");
                    ya.setAccessible(true);
                    Double v = (Double) ya.get(item);
                    if (v != null) { minYardArea = minYardArea == null ? v : Math.min(minYardArea, v); maxYardArea = maxYardArea == null ? v : Math.max(maxYardArea, v); }
                } catch (NoSuchFieldException ignored) {}

            } catch (Exception ignored) {}
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("minArea", minArea); result.put("maxArea", maxArea);
        result.put("minPrice", minPrice); result.put("maxPrice", maxPrice);
        result.put("minRoomCount", minRoom); result.put("maxRoomCount", maxRoom);
        result.put("minFloorCount", minFloor); result.put("maxFloorCount", maxFloor);
        result.put("minYardArea", minYardArea); result.put("maxYardArea", maxYardArea);
        result.put("minMortgagePrice", minMortgagePrice); result.put("maxMortgagePrice", maxMortgagePrice);
        return result;
    }
}


