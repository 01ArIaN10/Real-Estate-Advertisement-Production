package com.example.realestate.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Models aligned to the provided JSON schema.
 * We use lists to store multiple properties under each category.
 */
public class RealEstateModels {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RealEstate {
        private Sale sale = new Sale();
        private Rent rent = new Rent();
    }

    /* ==== Common leaf data objects ==== */

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleData {
        private String address;
        private String email;
        private double area;
        private double fullPrice;
        private String ownerFullName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RentData {
        private String address;
        private String email;
        private double area;
        private double rentPrice;
        private double mortgagePrice;
        private String ownerFullName;
    }

    /* ==== Sale branch ==== */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Sale {
        private List<LandSale> land = new ArrayList<>();
        private CommercialSale commercial = new CommercialSale();
        private ResidentialSale residential = new ResidentialSale();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommercialSale {
        private List<OfficeSale> office = new ArrayList<>();
        private List<ShopSale> shop = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResidentialSale {
        private List<VillaSale> villa = new ArrayList<>();
        private List<ApartmentSale> apartment = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandSale {
        private String id; // generated UUID
        private String whatUse;
        private SaleData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfficeSale {
        private String id;
        private int roomCount;
        private SaleData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopSale {
        private String id;
        private int roomCount; // Similar to office for simplicity
        private SaleData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VillaSale {
        private String id;
        private double yardArea;
        private SaleData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApartmentSale {
        private String id;
        private int floorCount;
        private int roomCount;
        private SaleData data;
    }

    /* ==== Rent branch ==== */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Rent {
        private List<LandRent> land = new ArrayList<>();
        private CommercialRent commercial = new CommercialRent();
        private ResidentialRent residential = new ResidentialRent();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommercialRent {
        private List<OfficeRent> office = new ArrayList<>();
        private List<ShopRent> shop = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResidentialRent {
        private List<VillaRent> villa = new ArrayList<>();
        private List<ApartmentRent> apartment = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandRent {
        private String id;
        private String whatUse;
        private RentData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfficeRent {
        private String id;
        private int roomCount;
        private RentData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopRent {
        private String id;
        private int roomCount; // Similar to office for simplicity
        private RentData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VillaRent {
        private String id;
        private double yardArea;
        private RentData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApartmentRent {
        private String id;
        private int floorCount;
        private int roomCount;
        private RentData data;
    }

    /**
     * Simple DTOs for searching and filtering.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SearchRequest {
        private String ownership; // "sale" or "rent"
        private String propertyType; // "land", "office", "villa", "apartment"
    }
}


