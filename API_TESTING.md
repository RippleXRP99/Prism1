# PRISM API Testing

This file contains examples of how to test the PRISM API endpoints using curl or any HTTP client.

## Prerequisites

Make sure the API server is running:
```bash
npm run dev:api
# or
npm run dev
```

## Authentication Endpoints

### 1. Register a new user
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testcreator",
    "email": "creator@test.com",
    "password": "password123",
    "displayName": "Test Creator",
    "isCreator": true
  }'
```

### 2. Register a regular user
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "user@test.com",
    "password": "password123",
    "displayName": "Test User",
    "isCreator": false
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### 4. Get profile (authenticated)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## User Endpoints

### 1. Get users list
```bash
curl -X GET "http://localhost:3001/api/users?page=1&limit=10"
```

### 2. Search users
```bash
curl -X GET "http://localhost:3001/api/users?search=creator"
```

### 3. Get user by ID
```bash
curl -X GET http://localhost:3001/api/users/USER_ID_HERE
```

### 4. Update user profile (authenticated)
```bash
curl -X PUT http://localhost:3001/api/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Creator Name",
    "bio": "This is my updated bio"
  }'
```

## Content Endpoints

### 1. Create content (creators only)
```bash
curl -X POST http://localhost:3001/api/content \
  -H "Authorization: Bearer YOUR_CREATOR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Video",
    "description": "This is a test video",
    "type": "video",
    "category": "entertainment",
    "tags": ["test", "demo", "first"],
    "isPremium": false
  }'
```

### 2. Get content list
```bash
curl -X GET "http://localhost:3001/api/content?page=1&limit=10"
```

### 3. Search content
```bash
curl -X GET "http://localhost:3001/api/content?search=video"
```

### 4. Filter by category
```bash
curl -X GET "http://localhost:3001/api/content?category=entertainment"
```

### 5. Get creator's content
```bash
curl -X GET "http://localhost:3001/api/content?creatorId=CREATOR_USER_ID"
```

### 6. Get content by ID
```bash
curl -X GET http://localhost:3001/api/content/CONTENT_ID_HERE
```

### 7. Update content (creator only)
```bash
curl -X PUT http://localhost:3001/api/content/CONTENT_ID_HERE \
  -H "Authorization: Bearer YOUR_CREATOR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Video Title",
    "description": "Updated description",
    "status": "published"
  }'
```

### 8. Delete content (creator only)
```bash
curl -X DELETE http://localhost:3001/api/content/CONTENT_ID_HERE \
  -H "Authorization: Bearer YOUR_CREATOR_JWT_TOKEN_HERE"
```

## System Endpoints

### Health Check
```bash
curl -X GET http://localhost:3001/health
```

### API Information
```bash
curl -X GET http://localhost:3001/api
```

## Example Testing Flow

1. **Register a creator account**
2. **Login and save the JWT token**
3. **Create some content**
4. **Publish the content** (update status to "published")
5. **Register a regular user**
6. **Browse content as the user**
7. **View specific content** (this will increment view count)

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2025-01-23T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": null,
  "timestamp": "2025-01-23T12:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "timestamp": "2025-01-23T12:00:00.000Z"
}
```

## Notes

- Replace `YOUR_JWT_TOKEN_HERE` with actual JWT tokens from login responses
- Replace `USER_ID_HERE` and `CONTENT_ID_HERE` with actual MongoDB ObjectIds
- The API server runs on port 3001 by default
- All POST/PUT requests require `Content-Type: application/json` header
- Protected endpoints require `Authorization: Bearer <token>` header
