## Project Overview
**Taipei Day Trip** is a travel e-commerce platform that enables users to explore Taipei attractions, book itineraries, and process online payments seamlessly.</br>
Demo: https://daytrip.yunn.space

## Main Features
**✴︎ Attraction Search**</br>
Supports keyword-based fuzzy search and MRT station-based filtering, with incremental data loading to optimize performance.

**✴︎ User Management & Booking System**</br>
Provides user registration and authentication to access booking functionality and order history management.

**✴︎ Secure Payment** **Processing**</br>
Enables users to complete transactions through an integrated online payment system.

## Technical Highlights
**◆ Third-party Payment Integration** </br>
Integrated TapPay API to provide secure online payment processing.

**◆ Government Data ETL**</br>
Parsed government-provided JSON datasets using Python, performed data validation and normalization, and inserted records into MySQL.

**◆ JWT Authentication**</br>
Implemented a JWT-based authentication system to manage user sessions and secure API endpoints.

**◆ Database Optimization**</br>
Applied MySQL connection pooling to reduce latency and enhance performance under high concurrency.

## Tech Stack
### Frontend
⦁ JavaScript (ES6)</br>
⦁ HTML</br>
⦁ CSS</br>
⦁ RWD</br>

### Backend
⦁ Python / FastAPI</br>
⦁ RESTful API</br>
⦁ JWT authentication</br>
⦁ TapPay API

### Database
⦁ MySQL (AWS RDS)</br>

### Deployment
⦁ Docker & Docker Compose</br>
⦁ Nginx Reverse Proxy</br>
⦁ AWS EC2
