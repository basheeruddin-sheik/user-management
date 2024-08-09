# User Management Microservice

This NestJS microservice provides a set of APIs for managing users, including CRUD operations, searching, and blocking functionality.

## Features
* CRUD operations for user data (Create, Read, Update, Delete)
* Search users by username and/or age range
* Block and unblock users
* Caching for frequently accessed data

## Technologies
* NestJS: JavaScript framework for building scalable microservices
* Database: MongoDB

## Dependecies
* mongodb
* moment (Time format)
* jsonwebtoken (Authentication)
* uuid (Universal Unique ID)
* cache-manager (Caching)
* swagger (API Documentation)
* zod (Request validation)


## Installation
1. Clone this repository:
   ```
   git clone <git_repository_url>
   ```
2. Install dependencies:
    ```
    npm install
    ```
3. Run Service
    ```
    npm run start:dev
    ```

## API Endpoints
1. UserController
    * ```/users/create - POST``` Create a new user
    * ```/users/getById/:id - GET``` Get a User by ID
    * ```/users/search - GET``` Search for users by username and/or age range
    * ```/users/:id - UPDATE``` Update a user by ID
    * ```/users/:id - DELETE``` Delete a user by ID

2. BlockController
    * ```/users/block/:id``` Block a user
    * ```/users/unblock/:id``` Unblock a user

3. AuthController
    * ```/auth/token - POST``` Get Token By User ID

### Note: 
* Refere ```Swagger API Documention``` at route: ```{{domain}}/api```
* Download Postman Collection URL: [Postman Collection](https://google.com)

## Implementation
#### 1. Authentication & Authorization
* Implemented an API endpoint for generating JSON Web Tokens (JWTs) to authenticate & authorize users.
* Created an authorization layer by setting a middleware to protect API access.

#### 2. Request Validation(Pipes)
* Implemented robust input validation for API requests using Zod schemas within NestJS pipes.

#### 3. Data Model
- ##### Public Information (Can be retrieved by anyone)
    * ```id - UUID``` Unique ID
    * ```name - String``` Name of the User
    * ```surname - String``` Surname of the User
    * ```username - String``` Username of the User
    * ```birthdate - Number(Epoch)``` User's Date of Birth

- ##### Private Information (Self retrieval)
    * ```password - String(Hash)``` User's Password
    * ```preferredLanguages - Array of String``` User selected languages
    * ```passwordLastUpdated - Number(Epoch)``` When was the password recently updated
    * ```themePreference - String``` Dark/Light
    * ```metaInfo - Object``` 
        * ```createdAt - Number``` When was the User created
        * ```updatedAt - Number``` When was the User recently updated
        * ```deletedAt - Number``` When was the User deleted
    * ```isDeleted - Boolean``` To indicate account is deleted or not(For soft delete)

#### 4. Mongo Collections
