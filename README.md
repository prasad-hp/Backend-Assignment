# Identity Reconciliation Service

## Overview

Link:  https://bitespeedbackend.linkpc.net/identify

This service is designed to identify and track customer identities across multiple purchases, even if different contact information is used for each purchase. It links different orders made with different contact information to the same person to provide a personalized customer experience.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Axios
- React
- TailwindCSS
- Postman
- Prisma
- npm
- Zod
- TypeScript

## Requirements

### Endpoint

`/identify`

### Method

`HTTP POST`

### Request Body

```json
Request
{
  "email": "string?", // optional
  "phoneNumber": "number?" // optional
}
Response
{
  "contact": {
    "primaryContactId": "number",
    "emails": ["string"], // first element being the email of the primary contact
    "phoneNumbers": ["string"], // first element being the phoneNumber of the primary contact
    "secondaryContactIds": ["number[]"] // array of all Contact IDs that are "secondary"
  }
}
Request
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
Response
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
