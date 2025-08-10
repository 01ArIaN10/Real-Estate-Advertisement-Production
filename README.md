# Real Estate Advertisement System

Welcome to the Real Estate Advertisement System - a comprehensive web application for managing real estate properties with advanced search, filtering, and management capabilities.

## 🏗️ Project Structure

```
Real-estate-advertisement/
├── frontend/          # React.js frontend application
├── server/           # Spring Boot backend API
├── nginx/            # Nginx configuration
├── data/             # Data storage
└── docker-compose.yml # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system

### Running the Application

1. **Clone the repository** (if not already done)
2. **Navigate to the project directory**
3. **Start all services with Docker:**

```bash
docker compose up -d --build
```

This command will:
- Build and start the Spring Boot backend server
- Build and start the React frontend application
- Configure Nginx as a reverse proxy
- Set up all necessary networking between services

### Accessing the Application

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **API Documentation:** http://localhost:8080/api/

## 📚 Documentation

- **Complete API Documentation:** [server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)
- **Backend Code:** Located in `/server` directory
- **Frontend Code:** Located in `/frontend` directory

## 🛠️ Technology Stack

### Backend
- **Java 17** with Spring Boot
- **RESTful API** with comprehensive endpoints
- **JSON file-based** data persistence
- **Advanced filtering and search** capabilities
- **Input validation** and error handling

### Frontend
- **React.js** with modern hooks
- **Material-UI** components for enhanced UX
- **Responsive design** with dark/light theme support
- **Real-time search and filtering**
- **Pagination** and data management

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **Docker Compose** for orchestration

## 🎯 Features

- ✅ **Property Management** - Create, read, update, delete properties
- ✅ **Advanced Search** - Keyword-based search across all fields
- ✅ **Smart Filtering** - Multi-criteria filtering with range sliders
- ✅ **Pagination** - Efficient data loading and navigation
- ✅ **Responsive UI** - Works on desktop and mobile devices
- ✅ **Theme Support** - Light and dark mode
- ✅ **Real-time Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error messages and status codes

## 📊 Property Types Supported

### Sale Properties
- Land (residential/commercial)
- Office (commercial)
- Shop (commercial)
- Villa (residential)
- Apartment (residential)

### Rent Properties
- Land (residential/commercial)
- Office (commercial)
- Shop (commercial)
- Villa (residential)
- Apartment (residential)

## 🔧 Development

### Backend Development
The backend is a Spring Boot application located in the `/server` directory. It provides:
- RESTful API endpoints
- Data validation and error handling
- File-based data persistence
- Advanced search and filtering logic

### Frontend Development
The frontend is a React.js application located in the `/frontend` directory. It features:
- Modern React hooks and functional components
- Material-UI for consistent design
- Responsive layout and theming
- Real-time data synchronization

## 📝 API Documentation

For detailed API documentation, including all endpoints, request/response formats, and examples, please refer to:

**[server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)**

## 👨‍💻 Developer Information

**Developer:** Arian (Amirmohammad Parchami)  
**Student Number:** 4030711313  
**Course:** Persian Gulf University Java Course

---

**Developed By Arian**
