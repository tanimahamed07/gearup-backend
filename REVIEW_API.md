# ⭐ Review API Documentation

## Overview

Customers can review gear items after returning them from rental. Reviews include a rating (1-5 stars) and a comment.

---

## 🔒 Business Rules

1. ✅ Customer can only review gear they have **rented and returned**
2. ✅ Order status must be **RETURNED**
3. ✅ Customer can only review each gear item **once**
4. ✅ Rating must be between **1 and 5**
5. ✅ Customer can **update** or **delete** their own reviews

---

## 📋 API Endpoints

### 1. Create Review (After Rental Return)

**POST** `/api/reviews`

Create a review for a gear item after returning it.

**Authentication:** Required (CUSTOMER role)

**Headers:**

```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "gearItemId": "gear_uuid_here",
  "rating": 5,
  "comment": "Excellent tent! Very spacious and easy to set up."
}
```

**Field Validations:**

- `gearItemId`: Required, valid UUID
- `rating`: Required, integer between 1-5
- `comment`: Required, string

**Response (Success):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "id": "review_uuid",
    "rating": 5,
    "comment": "Excellent tent! Very spacious and easy to set up.",
    "customerId": "customer_uuid",
    "gearItemId": "gear_uuid",
    "createdAt": "2026-07-09T10:00:00.000Z",
    "customer": {
      "id": "customer_uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "gear": {
      "id": "gear_uuid",
      "name": "Professional Camping Tent - 4 Person",
      "brand": "Coleman"
    }
  }
}
```

**Error Responses:**

```json
// Not rented or not returned
{
  "success": false,
  "statusCode": 400,
  "message": "You can only review items you have rented and returned"
}

// Already reviewed
{
  "success": false,
  "statusCode": 400,
  "message": "You have already reviewed this item"
}

// Invalid rating
{
  "success": false,
  "statusCode": 400,
  "message": "Rating must be between 1 and 5"
}
```

---

### 2. Get Gear Reviews

**GET** `/api/reviews/gear/:gearId`

Get all reviews for a specific gear item with average rating.

**Authentication:** Not required (Public)

**Example Request:**

```bash
GET /api/reviews/gear/gear_uuid_here
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "review_uuid_1",
        "rating": 5,
        "comment": "Excellent tent! Very spacious and easy to set up.",
        "createdAt": "2026-07-09T10:00:00.000Z",
        "customer": {
          "id": "customer_uuid",
          "name": "John Doe"
        }
      },
      {
        "id": "review_uuid_2",
        "rating": 4,
        "comment": "Good quality but a bit heavy to carry.",
        "createdAt": "2026-07-08T15:30:00.000Z",
        "customer": {
          "id": "customer_uuid_2",
          "name": "Jane Smith"
        }
      }
    ],
    "totalReviews": 2,
    "averageRating": 4.5
  }
}
```

---

### 3. Get My Reviews

**GET** `/api/reviews/my`

Get all reviews created by the authenticated customer.

**Authentication:** Required (CUSTOMER role)

**Headers:**

```
Authorization: Bearer <customer_token>
```

**Example Request:**

```bash
GET /api/reviews/my
Authorization: Bearer customer_token_here
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "My reviews retrieved successfully",
  "data": [
    {
      "id": "review_uuid_1",
      "rating": 5,
      "comment": "Excellent tent!",
      "createdAt": "2026-07-09T10:00:00.000Z",
      "gear": {
        "id": "gear_uuid",
        "name": "Professional Camping Tent - 4 Person",
        "brand": "Coleman"
      }
    },
    {
      "id": "review_uuid_2",
      "rating": 4,
      "comment": "Good backpack, very comfortable.",
      "createdAt": "2026-07-08T14:00:00.000Z",
      "gear": {
        "id": "gear_uuid_2",
        "name": "Hiking Backpack 65L",
        "brand": "Osprey"
      }
    }
  ]
}
```

---

### 4. Update Review

**PUT** `/api/reviews/:id`

Update your own review.

**Authentication:** Required (CUSTOMER role)

**Headers:**

```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)

```json
{
  "rating": 4,
  "comment": "Updated: Good tent but a bit heavy."
}
```

**Example Request:**

```bash
PUT /api/reviews/review_uuid_here
Authorization: Bearer customer_token_here
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated: Good tent but a bit heavy."
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review updated successfully",
  "data": {
    "id": "review_uuid",
    "rating": 4,
    "comment": "Updated: Good tent but a bit heavy.",
    "createdAt": "2026-07-09T10:00:00.000Z",
    "customer": {
      "id": "customer_uuid",
      "name": "John Doe"
    },
    "gear": {
      "id": "gear_uuid",
      "name": "Professional Camping Tent - 4 Person",
      "brand": "Coleman"
    }
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Review not found or you don't have permission to update it"
}
```

---

### 5. Delete Review

**DELETE** `/api/reviews/:id`

Delete your own review.

**Authentication:** Required (CUSTOMER role)

**Headers:**

```
Authorization: Bearer <customer_token>
```

**Example Request:**

```bash
DELETE /api/reviews/review_uuid_here
Authorization: Bearer customer_token_here
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review deleted successfully",
  "data": null
}
```

**Error Response:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Review not found or you don't have permission to delete it"
}
```

---

## 🔧 Testing with cURL

### Create Review

```bash
curl -X POST http://localhost:5001/api/reviews \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gearItemId": "GEAR_UUID",
    "rating": 5,
    "comment": "Excellent gear! Highly recommended."
  }'
```

### Get Gear Reviews (Public)

```bash
curl -X GET http://localhost:5001/api/reviews/gear/GEAR_UUID
```

### Get My Reviews

```bash
curl -X GET http://localhost:5001/api/reviews/my \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

### Update Review

```bash
curl -X PUT http://localhost:5001/api/reviews/REVIEW_UUID \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated review text"
  }'
```

### Delete Review

```bash
curl -X DELETE http://localhost:5001/api/reviews/REVIEW_UUID \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

---

## 📊 Complete Review Flow

### Step 1: Customer Rents Gear

```
POST /api/rentals
→ Order created (status: PLACED)
```

### Step 2: Customer Pays

```
POST /api/payments/create
→ Payment completed
→ Order status: CONFIRMED
```

### Step 3: Provider Marks as Picked Up

```
PATCH /api/rentals/provider/:orderId
Body: { "status": "PICKED_UP" }
```

### Step 4: Customer Returns Gear

```
PATCH /api/rentals/provider/:orderId
Body: { "status": "RETURNED" }
```

### Step 5: Customer Writes Review ✅

```
POST /api/reviews
Body: {
  "gearItemId": "gear_uuid",
  "rating": 5,
  "comment": "Great experience!"
}
```

---

## 🎯 Integration with Gear API

When fetching gear details, you can also fetch its reviews:

```bash
# Get gear details
GET /api/gear/:gearId

# Get gear reviews
GET /api/reviews/gear/:gearId
```

You can combine both on frontend to show gear with reviews.

---

## 🔒 Security Features

- ✅ Only CUSTOMER role can create/update/delete reviews
- ✅ Customer can only review gear they've rented and returned
- ✅ Customer can only update/delete their own reviews
- ✅ One review per gear per customer
- ✅ Rating validation (1-5)

---

## 📝 Database Schema

```prisma
model Review {
  id      String @id @default(uuid())
  comment String
  rating  Int // 1 to 5

  customerId String
  customer   User   @relation(fields: [customerId], references: [id])

  gearItemId String
  gear       GearItem @relation(fields: [gearItemId], references: [id])

  createdAt DateTime @default(now())
}
```

---

## 🎉 Summary

| Method | Endpoint                    | Auth     | Description                  |
| ------ | --------------------------- | -------- | ---------------------------- |
| POST   | `/api/reviews`              | Customer | Create review (after return) |
| GET    | `/api/reviews/gear/:gearId` | Public   | Get gear reviews             |
| GET    | `/api/reviews/my`           | Customer | Get my reviews               |
| PUT    | `/api/reviews/:id`          | Customer | Update my review             |
| DELETE | `/api/reviews/:id`          | Customer | Delete my review             |

**Features:**
✅ Create review after rental return
✅ Get gear reviews with average rating
✅ Update/delete own reviews
✅ One review per gear per customer
✅ Rating validation (1-5 stars)

Happy reviewing! ⭐
