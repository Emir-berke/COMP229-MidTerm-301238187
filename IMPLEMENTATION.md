# IMPLEMENTATION.md

> Fill this out as you implement each endpoint. Keep it brief but specific —
> this is where you show the marker that you understand *why* your code works,
> not just that it runs.

## Student

- **Name:**
- **Student ID:**
- **Section:**
- **Date:**

---

## 1. Environment

- Node version (`node -v`):
- MongoDB (local / Atlas / Docker):
- How you ran the server (`npm start` / `npm run dev`):

---

## 2. Endpoint Checklist

For each endpoint, write **1–2 sentences** on how you implemented it and
what status codes you return for each case.

### GET `/api/items`
- Filters supported:
- Status codes:
- Notes:

### GET `/api/items/mine`
- How you scope to the signed-in user:
- Status codes:
- Notes:

### GET `/api/items/:id`
- How you validate `:id`:
- Status codes (valid id / invalid id / not found):
- Notes:

### POST `/api/items`
- How you set `owner`:
- How validation errors are returned:
- Status codes:
- Notes:

### PUT `/api/items/:id`
- How you check ownership:
- Which fields you allow to be updated:
- Status codes (invalid id / not found / not owner / success):
- Notes:

### DELETE `/api/items/mine`
- Query used:
- Response shape (`deletedCount` / `204`):
- Notes:

### DELETE `/api/items/:id`
- How you check ownership:
- Status codes:
- Notes:

---

## 3. Testing

Describe how you tested (Postman / Thunder Client / curl / REST Client in VS Code).
Attach screenshots in a `screenshots/` folder if your instructor asks for them.

- Tool used:
- Collection file (if any):
- Which scenarios you verified:
  - [ ] Signup / signin happy path
  - [ ] Signin with wrong password → 401
  - [ ] Protected route without token → 401
  - [ ] Create item with missing required field → 400
  - [ ] Create item success → 201
  - [ ] List all + filters (`?type=`, `?category=`)
  - [ ] Get by invalid id → 400
  - [ ] Get by missing id → 404
  - [ ] List mine returns only my items
  - [ ] Update by non-owner → 403
  - [ ] Update by owner → 200
  - [ ] Delete by non-owner → 403
  - [ ] Delete by owner → 200 / 204
  - [ ] Delete /mine empties my list

---

## 4. Known Issues / Things I Would Improve

- …

---

## 5. References

- Mongoose docs:
- Express docs:
- Any Stack Overflow / tutorial links you leaned on:
