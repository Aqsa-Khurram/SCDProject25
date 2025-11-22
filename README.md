# SCD-25 Node App

## Description
SCD-25 Node App is a simple REST API application that allows users to store and retrieve vault records.  
It uses **Node.js** for the backend and **MongoDB** for persistent storage.  
The application is fully **dockerized** using Docker Compose, making it easy to run without installing Node.js or MongoDB locally.

## Features
- Create and fetch vault records via REST API.
- MongoDB integration for storing data.
- Docker Compose orchestrates the backend and database.
- Easy setup with environment variables.

## Technologies
- Node.js
- Express
- MongoDB
- Mongoose
- Docker & Docker Compose

## Requirements
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- (Optional) Node.js & npm if running without Docker

## Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd SCD-25-NodeApp
```

### 2. Environment Variables
Create a `.env` file at the root of your project:
```
PORT=3000
MONGO_URI=mongodb://mongo:27017/vaultDB
```

### 3. Running the Application with Docker Compose
```bash
docker-compose up --build
```
- The backend will be available at `http://localhost:3000`.  
- MongoDB runs in a separate container.  

### 4. Testing the API
#### Create a Vault Record
```bash
curl -X POST http://localhost:3000/vault \
-H "Content-Type: application/json" \
-d '{"id":1,"name":"Test"}'
```

#### Fetch Vault Records
```bash
curl http://localhost:3000/vault
```

### 5. Important Notes
- Running `docker-compose down -v` will **delete all MongoDB data** because it removes the volume.  
- To persist data, avoid removing the volume, or map a host directory for MongoDB storage.  
- Ensure the backend is using the correct environment variables (`MONGO_URI` and `PORT`).


## Troubleshooting
- Ensure no other service is using the same port (`3000`).  

## License
Author: Aqsa Khurram  
