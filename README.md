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
* Download Postman Collection URL: [Postman Collection](https://bit.ly/4dbT8ce)

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
* ```users``` - Fields mentioned at Data Model section
* ```blocked-users```
    * ```id - UUID``` Unique ID for document(not mandatory)
    * ```blockedByUserId - UUID```  ID of the user who initiated the block
    * ```blockedUserId - UUID``` ID of the Blocked User
    * ```blockedUserName - String``` Name of the Blocked User
    * ```blockedUserSurname - String``` Surname of the Blocked User
    * ```blockedUserUsername - String``` Username of the Blocked User
    * ```blockedAt - Number(Epoch)``` 

    #### Note: 
    * ##### There are two ways to keep track of blocked users:
        1. Store blocked user IDs directly within each user's document: This means each user has a list of IDs of users they've blocked. However, if a user blocks many people, this list can become very long, making the user document too large.
        2. Create a separate collection for blocked user relationships: Here, each document stores information about two users: the blocker and the blocked user. This approach is better for handling a large number of blocked users as it prevents individual user documents from becoming too big.
        
    * I chose the second method because it can handle a large number of blocked users without causing performance issues.
    * Retrieving blocked user information by directly referencing user IDs in the ```users``` collection would necessitate multiple database ```aggregation lookups```, potentially impacting performance.

#### 5. Caching
* In-memory caching was selected due to its immediate accessibility and reduced setup overhead compared to alternatives like Redis or file-based caching.
* Implemented an Data Caching strategy within the NestJS framework, configuring a 5-second expiration time and a maximum cache capacity of 1000 items.

#### 6. Error Handling
* Implemented a robust error handling mechanism using try-catch blocks to gracefully manage unexpected exceptions and prevent application crashes.

#### 7. Testing
* Comprehensive Jest test cases were written to ensure the correct behavior of all controller functions, verifying expected outputs and error handling scenarios.
