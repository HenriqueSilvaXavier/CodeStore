
# 📘 API Reference

This Node.js API uses **Express** and **SQLite** to handle user authentication, product management, and favorites.

---

## 🔐 Authentication Middleware

### `authenticate(req, res, next)`

Protects routes by validating the JWT token sent via the `Authorization` header.

---

## 👤 User Endpoints

### **POST /signup**

Registers a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Responses:**
- `201 Created`: `{ message, token }`
- `400 Bad Request`: Validation errors
- `500 Internal Server Error`: Database or hashing error

---

### **POST /login**

Logs in a user and returns a JWT token.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Responses:**
- `200 OK`: `{ message, token }`
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Database error

---

### **GET /current-user**

Returns the logged-in user's data.  
**Requires authentication.**

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

### **GET /users**

Returns all users.  
**Requires authentication.**

**Response:**
```json
[
  { "id": 1, "name": "John Doe", "email": "john@example.com" },
  ...
]
```

---

## 📦 Product Endpoints

### **GET /products**

Returns a list of all products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Product A",
    "description": "...",
    "image": "url",
    "price": 19.99,
    "promotion": false,
    "category": "Books"
  }
]
```

---

### **POST /products**

Creates a new product.

**Body:**
```json
{
  "name": "Product A",
  "description": "Excellent product",
  "image": "url",
  "price": 19.99,
  "promotion": false,
  "category": "Books"
}
```

**Response:**
```json
{ "id": 1 }
```

---

### **PATCH /products/:id**

Partially updates a product.

**Body (example):**
```json
{ "price": 14.99 }
```

**Response:**
```json
{ "message": "Product updated successfully" }
```

---

## ❤️ Favorites Endpoints

### **POST /favorites**

Adds a product from the logged-in user's favorites.  
**Requires authentication.**

**Body:**
```json
{ "productId": 1 }
```

**Response (add):**
```json
{ "message": "Product added to favorites" }
```

---

### **DELETE /favorites/:productId**

Removes a product from the user's favorites.  
**Requires authentication.**

**Response:**
```json
{ "message": "Favorite removed successfully" }
```

---

### **GET /favorites**

Returns only the product IDs of the logged-in user's favorites.  
**Requires authentication.**

**Response:**
```json
[
  { "userId": 1, "productId": 2 },
  ...
]
```

---

### **GET /favorites/:userId**

Returns complete data of a user's favorite products.

**Response:**
```json
[
  {
    "favorite_id": 1,
    "id": 2,
    "name": "Product A",
    "description": "...",
    "image": "url",
    "price": 19.99,
    "promotion": false,
    "category": "Books"
  }
]
```