# Real Estate API Documentation

## Overview

Welcome to the Real Estate API - a comprehensive REST API for managing real estate advertisements. This API supports both sale and rental properties with advanced filtering, search, and pagination capabilities.

**Developer:** Arian (Amirmohammad Parchami)  
**Student Number:** 4030711313  
**Course:** Persian Gulf University Java Course

## Base URL

```
http://localhost:8080
```

## Authentication

Currently, this API does not require authentication.

## Response Format

All responses are returned in JSON format with the following structure:

```json
{
  "message": "Success message",
  "data": {...},
  "status": "success"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive message:

```json
{
  "message": "Invalid value 'abc' for field 'price'. Expected Integer"
}
```

## Endpoints

### 1. API Information

#### GET `/api/`

Returns comprehensive API information including statistics and available routes.

**Response:**
```json
{
  "message": "Welcome to the Real Estate API",
  "developedBy": "Arian",
  "officialName": "Amirmohammad Parchami",
  "studentNumber": "4030711313",
  "description": "This project was developed for the Persian Gulf University Java course.",
  "routes": [...],
  "statistics": {
    "sale": {
      "land": 2,
      "office": 1,
      "shop": 0,
      "villa": 3,
      "apartment": 5,
      "total": 11
    },
    "rent": {
      "land": 1,
      "office": 2,
      "shop": 1,
      "villa": 2,
      "apartment": 4,
      "total": 10
    },
    "overall": {
      "totalProperties": 21,
      "saleProperties": 11,
      "rentProperties": 10
    },
    "byPropertyType": {
      "land": 3,
      "office": 3,
      "shop": 1,
      "villa": 5,
      "apartment": 9
    }
  },
  "footer": "Developed By Arian"
}
```

### 2. Data Retrieval

#### GET `/api/v1/real-estate`

Retrieves all real estate data organized by ownership and property type.

**Response:**
```json
{
  "sale": {
    "land": [...],
    "commercial": {
      "office": [...],
      "shop": [...]
    },
    "residential": {
      "villa": [...],
      "apartment": [...]
    }
  },
  "rent": {
    "land": [...],
    "commercial": {
      "office": [...],
      "shop": [...]
    },
    "residential": {
      "villa": [...],
      "apartment": [...]
    }
  }
}
```

### 3. Search & Filtering

#### GET `/api/v1/real-estate/search`

Search properties by ownership and property type with pagination.

**Parameters:**
- `ownership` (required): `sale` or `rent`
- `propertyType` (required): `land`, `office`, `shop`, `villa`, or `apartment`
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 5)

**Example:**
```
GET /api/v1/real-estate/search?ownership=sale&propertyType=apartment&page=0&size=10
```

#### GET `/api/v1/real-estate/search/keyword`

Search across all properties using keyword matching.

**Parameters:**
- `keyword` (required): Search term
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 5)

**Example:**
```
GET /api/v1/real-estate/search/keyword?keyword=Tehran&page=0&size=10
```

**Searchable Fields:**
- Property ID
- Owner name
- Address
- Email
- Usage type
- Room count
- Floor count
- Yard area
- Price

#### GET `/api/v1/real-estate/filter`

Advanced filtering with multiple criteria and pagination.

**Parameters:**
- `ownership` (required): `sale` or `rent`
- `propertyType` (required): `land`, `office`, `shop`, `villa`, or `apartment`
- `minPrice` / `maxPrice` (optional): Price range
- `minArea` / `maxArea` (optional): Area range in m²
- `minRoomCount` / `maxRoomCount` (optional): Room count range (office, apartment, shop)
- `minYardArea` / `maxYardArea` (optional): Yard area range (villa)
- `minFloorCount` / `maxFloorCount` (optional): Floor count range (apartment)
- `minMortgagePrice` / `maxMortgagePrice` (optional): Mortgage price range (rent only)
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 5)

**Example:**
```
GET /api/v1/real-estate/filter?ownership=rent&propertyType=apartment&minPrice=1000&maxPrice=5000&minArea=50&maxArea=200&page=0&size=10
```

#### GET `/api/v1/real-estate/stats`

Get statistical bounds for filterable fields.

**Parameters:**
- `ownership` (required): `sale` or `rent`
- `propertyType` (required): `land`, `office`, `shop`, `villa`, or `apartment`

**Response:**
```json
{
  "minArea": 50.0,
  "maxArea": 500.0,
  "minPrice": 1000.0,
  "maxPrice": 100000.0,
  "minRoomCount": 1,
  "maxRoomCount": 5,
  "minFloorCount": 1,
  "maxFloorCount": 20,
  "minYardArea": 100.0,
  "maxYardArea": 1000.0,
  "minMortgagePrice": 0.0,
  "maxMortgagePrice": 50000.0
}
```

### 4. Property Creation

#### POST `/api/v1/real-estate/sale/land`

Create a new land sale property.

**Request Body:**
```json
{
  "whatUse": "residential",
  "data": {
    "address": "123 Main St",
    "email": "owner@example.com",
    "area": 500.0,
    "fullPrice": 100000.0,
    "ownerFullName": "John Doe"
  }
}
```

#### POST `/api/v1/real-estate/sale/commercial/office`

Create a new office sale property.

**Request Body:**
```json
{
  "roomCount": 5,
  "data": {
    "address": "456 Business Ave",
    "email": "owner@example.com",
    "area": 200.0,
    "fullPrice": 500000.0,
    "ownerFullName": "Jane Smith"
  }
}
```

#### POST `/api/v1/real-estate/sale/commercial/shop`

Create a new shop sale property.

**Request Body:**
```json
{
  "roomCount": 3,
  "data": {
    "address": "789 Shopping St",
    "email": "owner@example.com",
    "area": 150.0,
    "fullPrice": 300000.0,
    "ownerFullName": "Bob Johnson"
  }
}
```

#### POST `/api/v1/real-estate/sale/residential/villa`

Create a new villa sale property.

**Request Body:**
```json
{
  "yardArea": 300.0,
  "data": {
    "address": "321 Luxury Blvd",
    "email": "owner@example.com",
    "area": 400.0,
    "fullPrice": 800000.0,
    "ownerFullName": "Alice Brown"
  }
}
```

#### POST `/api/v1/real-estate/sale/residential/apartment`

Create a new apartment sale property.

**Request Body:**
```json
{
  "floorCount": 15,
  "roomCount": 3,
  "data": {
    "address": "654 High Rise Ave",
    "email": "owner@example.com",
    "area": 120.0,
    "fullPrice": 250000.0,
    "ownerFullName": "Charlie Wilson"
  }
}
```

#### POST `/api/v1/real-estate/rent/land`

Create a new land rental property.

**Request Body:**
```json
{
  "whatUse": "commercial",
  "data": {
    "address": "987 Industrial Rd",
    "email": "owner@example.com",
    "area": 1000.0,
    "rentPrice": 5000.0,
    "mortgagePrice": 10000.0,
    "ownerFullName": "David Lee"
  }
}
```

#### POST `/api/v1/real-estate/rent/commercial/office`

Create a new office rental property.

**Request Body:**
```json
{
  "roomCount": 4,
  "data": {
    "address": "147 Corporate Dr",
    "email": "owner@example.com",
    "area": 180.0,
    "rentPrice": 3000.0,
    "mortgagePrice": 5000.0,
    "ownerFullName": "Eva Garcia"
  }
}
```

#### POST `/api/v1/real-estate/rent/commercial/shop`

Create a new shop rental property.

**Request Body:**
```json
{
  "roomCount": 2,
  "data": {
    "address": "258 Retail St",
    "email": "owner@example.com",
    "area": 100.0,
    "rentPrice": 2000.0,
    "mortgagePrice": 3000.0,
    "ownerFullName": "Frank Miller"
  }
}
```

#### POST `/api/v1/real-estate/rent/residential/villa`

Create a new villa rental property.

**Request Body:**
```json
{
  "yardArea": 250.0,
  "data": {
    "address": "369 Premium Ln",
    "email": "owner@example.com",
    "area": 350.0,
    "rentPrice": 4000.0,
    "mortgagePrice": 8000.0,
    "ownerFullName": "Grace Taylor"
  }
}
```

#### POST `/api/v1/real-estate/rent/residential/apartment`

Create a new apartment rental property.

**Request Body:**
```json
{
  "floorCount": 12,
  "roomCount": 2,
  "data": {
    "address": "741 Urban Ave",
    "email": "owner@example.com",
    "area": 90.0,
    "rentPrice": 1500.0,
    "mortgagePrice": 2000.0,
    "ownerFullName": "Henry Davis"
  }
}
```

### 5. Property Deletion

#### DELETE `/api/v1/real-estate/{ownership}/{propertyType}/{id}`

Delete a property by its ID.

**Parameters:**
- `ownership`: `sale` or `rent`
- `propertyType`: `land`, `office`, `shop`, `villa`, or `apartment`
- `id`: Property ID

**Example:**
```
DELETE /api/v1/real-estate/sale/apartment/abc123def456
```

**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

## Data Models

### Common Data Fields

All properties include these common fields:

```json
{
  "address": "string (required)",
  "email": "string (required, valid email format)",
  "area": "number (required, > 0)",
  "ownerFullName": "string (required, format: 'FirstName LastName')"
}
```

### Sale Properties

Sale properties include:
- `fullPrice`: number (required, > 0)

### Rent Properties

Rent properties include:
- `rentPrice`: number (required, > 0)
- `mortgagePrice`: number (required, >= 0)

### Property-Specific Fields

- **Land**: `whatUse` (required): `residential` or `commercial`
- **Office**: `roomCount` (required): integer
- **Shop**: `roomCount` (required): integer
- **Villa**: `yardArea` (required): number
- **Apartment**: `floorCount` (required): integer, `roomCount` (required): integer

## Validation Rules

### Email Validation
- Must be a valid email format
- Example: `user@example.com`

### Owner Full Name Validation
- Must be in format: "FirstName LastName"
- Only letters allowed (no numbers or special characters)
- Exactly one space between first and last name

### Numeric Field Validation
- `area`, `fullPrice`, `rentPrice`: Must be greater than 0
- `mortgagePrice`: Must be greater than or equal to 0
- `roomCount`, `floorCount`: Must be positive integers

## Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (0-based, default: 0)
- `size`: Number of items per page (default: 5)

**Example Response:**
```json
[
  {
    "id": "abc123def456",
    "data": {...},
    "roomCount": 3,
    "floorCount": 10
  },
  ...
]
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation error |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## Rate Limiting

Currently, no rate limiting is implemented.

## CORS

CORS is enabled for all origins to support frontend integration.

## Data Persistence

Data is persisted to a JSON file (`data/realestate.json`) and automatically loaded on application startup.

## Examples

### Complete Workflow Example

1. **Get API Information:**
   ```
   GET /api/
   ```

2. **Create a Property:**
   ```
   POST /api/v1/real-estate/sale/apartment
   Content-Type: application/json
   
   {
     "floorCount": 10,
     "roomCount": 3,
     "data": {
       "address": "123 Main Street",
       "email": "owner@example.com",
       "area": 120.0,
       "fullPrice": 250000.0,
       "ownerFullName": "John Doe"
     }
   }
   ```

3. **Search Properties:**
   ```
   GET /api/v1/real-estate/search?ownership=sale&propertyType=apartment&page=0&size=10
   ```

4. **Filter Properties:**
   ```
   GET /api/v1/real-estate/filter?ownership=sale&propertyType=apartment&minPrice=200000&maxPrice=300000&minArea=100&maxArea=150&page=0&size=10
   ```

5. **Delete Property:**
   ```
   DELETE /api/v1/real-estate/sale/apartment/abc123def456
   ```

## Support

For questions or issues, please refer to the project documentation or contact the developer.

---

**Developed By Arian**  
*Amirmohammad Parchami*  
*Student Number: 4030711313*
