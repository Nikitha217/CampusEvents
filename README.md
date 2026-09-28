# 🎓 Eventora – College Campus Event Management System

Eventora is a web-based **College Campus Event Management System** designed to simplify the process of creating, managing, discovering, and registering for college events.

The system provides separate functionalities for **Students, Coordinators, and Administrators**, making campus event management more organized, efficient, and user-friendly.

---

## 🚀 Features

### 👨‍🎓 Student

* Create and manage a student account
* Browse available campus events
* View detailed event information
* Register for events
* Make event payments through multiple payment options
* View registered events
* Track registration status
* Access and download event certificates

### 👩‍💼 Event Coordinator

* Create and manage events
* Submit events for admin approval
* View created events
* Manage event details
* Track event registrations

### 🛡️ Admin

* Admin dashboard
* View pending events
* Review submitted events
* Approve or manage events
* Manage users and campus events

---

## 🛠️ Technologies Used

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* React Router
* Context API

### Backend

* Java 17
* Spring Boot
* Spring Web
* Spring Data
* REST APIs
* JWT Authentication

### Databases

* **MySQL** – User accounts, roles, and authentication-related data
* **MongoDB** – Events, registrations, and event-related data

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman
* MySQL
* MongoDB

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │ Student / Coordinator│
                    │       / Admin       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │ • Authentication    │
                    │ • Dashboards        │
                    │ • Events            │
                    │ • Registration      │
                    │ • Certificates     │
                    └──────────┬──────────┘
                               │
                         REST API + JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │                     │
                    │ • Authentication   │
                    │ • Event Management  │
                    │ • Registration      │
                    │ • Role Management   │
                    └───────┬─────┬───────┘
                            │     │
                  ┌─────────┘     └─────────┐
                  ▼                         ▼
          ┌───────────────┐         ┌───────────────┐
          │    MySQL      │         │   MongoDB     │
          │               │         │               │
          │ Users & Roles │         │ Events &      │
          │               │         │ Registrations │
          └───────────────┘         └───────────────┘
```

---

## 📂 Project Structure

```text
Eventora/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── campusevents/
│   │       │           └── events/
│   │       │               ├── controller/
│   │       │               ├── service/
│   │       │               ├── repository/
│   │       │               ├── model/
│   │       │               └── config/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   └── ...
│
└── README.md
```

---

## 🔐 Authentication & Authorization

Eventora uses **JWT-based authentication** to secure the application.

After successful login, the user receives a JWT token that is used to authenticate API requests.

Role-based access control ensures that users can access only the features relevant to their role.

```text
Student       → Browse & Register for Events
Coordinator   → Create & Manage Events
Admin         → Approve & Manage Events
```

---

## 🔄 Event Approval Workflow

```text
Coordinator
     │
     │ Create Event
     ▼
   PENDING
     │
     │ Admin Review
     ▼
 ┌─────────────┐
 │             │
 ▼             ▼
APPROVED     REJECTED
 │
 ▼
Visible to Students
 │
 ▼
Student Registration
```

---

## 💳 Event Registration & Payment

Students can register for events through the application.

The registration flow includes:

1. Browse available events
2. Select an event
3. View event details
4. Choose a payment method
5. Complete registration
6. View registration under **My Registrations**
7. Access the certificate after the event

Supported payment options in the interface include:

* Google Pay
* PhonePe
* Paytm
* Card

---

## 📜 Certificates

After participating in an event, students can access their event certificates through the application.

The certificate functionality helps maintain a digital record of student participation in campus activities.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Eventora.git
cd Eventora
```

---

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Make sure **Java 17** and **Maven** are installed.

Configure the required database and application properties in:

```text
src/main/resources/application.properties
```

Then run:

```bash
mvn spring-boot:run
```

The backend will start on the configured Spring Boot port.

---

### 3. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the URL shown in the terminal.

---

## 🔑 Environment Configuration

For security, sensitive credentials should **not** be committed to GitHub.

Example configuration:

```properties
# JWT
jwt.secret=YOUR_JWT_SECRET
jwt.expiration=YOUR_JWT_EXPIRATION

# MySQL
spring.datasource.url=YOUR_MYSQL_URL
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# MongoDB
spring.data.mongodb.uri=YOUR_MONGODB_URI
```

> **Important:** Never upload passwords, API keys, JWT secrets, or database credentials to GitHub.

---

## 🔗 Important API Endpoints

### Authentication

```http
POST /api/auth/signup
```

```http
POST /api/auth/login
```

### Events

```http
GET /events/pending
```

```http
PUT /events/{id}/approve
```

Additional event and registration endpoints are available through the Spring Boot REST API.

---

## 🧪 Testing

The APIs can be tested using tools such as **Postman**.

Recommended testing flow:

```text
Signup
  ↓
Login
  ↓
Receive JWT
  ↓
Create / Fetch Events
  ↓
Approve Event
  ↓
Register for Event
```

---

## 🎯 Project Objectives

* Digitize college event management
* Reduce manual event registration processes
* Provide role-based access for different users
* Simplify event approval and management
* Provide students with a centralized event platform
* Maintain digital registration and certificate records

---

## 🌟 Future Enhancements

* Real payment gateway integration
* Email and SMS notifications
* QR-code based event attendance
* Automated certificate generation
* Event analytics and reports
* Push notifications
* Mobile application
* Advanced event recommendation system

---

## 📌 Project Status

🚧 **Active Development**

Eventora is an academic project developed to demonstrate full-stack web development, REST API development, authentication, database integration, and role-based access control.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
