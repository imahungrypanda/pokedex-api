# Pokédex API Testing Guide

This guide provides curl commands to test the Pokédex API endpoints.

## Base URL

For local development:
```
http://localhost:3000
```

## API Endpoints

### 1. Get All Pokémon

Retrieves a list of all Pokémon in the database.

**Endpoint:** `GET /api/v1/pokemon/index`

**curl Command:**
```bash
curl -X GET http://localhost:3000/api/v1/pokemon/index
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "pokemon_id": 25,
    "name": "Pikachu",
    "pokemon_type": "Electric",
    "image_url": "https://example.com/pikachu.png",
    "created_at": "2023-08-15T12:34:56.789Z",
    "updated_at": "2023-08-15T12:34:56.789Z"
  },
  {
    "id": 2,
    "pokemon_id": 1,
    "name": "Bulbasaur",
    "pokemon_type": "Grass/Poison",
    "image_url": "https://example.com/bulbasaur.png",
    "created_at": "2023-08-15T12:35:56.789Z",
    "updated_at": "2023-08-15T12:35:56.789Z"
  }
]
```

---

### 2. Create a New Pokémon

Adds a new Pokémon to the database.

**Endpoint:** `POST /api/v1/pokemon/create`

**Required Parameters:**
- `id` - The Pokémon ID (National Pokédex number)
- `name` - The Pokémon's name

**curl Command:**
```bash
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 25,
    "name": "Pikachu"
  }'
```

**With Form Data:**
```bash
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -d "id=25" \
  -d "name=Pikachu"
```

**Expected Response:**
```json
{
  "id": 1,
  "pokemon_id": 25,
  "name": "Pikachu",
  "pokemon_type": null,
  "image_url": null,
  "created_at": "2023-08-15T12:34:56.789Z",
  "updated_at": "2023-08-15T12:34:56.789Z"
}
```

**More Examples:**
```bash
# Create Charizard
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 6,
    "name": "Charizard"
  }'

# Create Mewtwo
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 150,
    "name": "Mewtwo"
  }'

# Create Eevee
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 133,
    "name": "Eevee"
  }'
```

---

### 3. Delete a Pokémon

Removes a Pokémon from the database by its ID.

**Endpoint:** `DELETE /api/v1/pokemon/:id`

**curl Command:**
```bash
curl -X DELETE http://localhost:3000/api/v1/pokemon/1
```

**Replace `1` with the actual database ID of the Pokémon you want to delete.**

**Expected Response:**
```json
{
  "message": "Pokemon deleted successfully"
}
```

**More Examples:**
```bash
# Delete Pokémon with database ID 5
curl -X DELETE http://localhost:3000/api/v1/pokemon/5

# Delete Pokémon with database ID 10
curl -X DELETE http://localhost:3000/api/v1/pokemon/10
```

---

## Testing Workflow

### 1. Start the Rails Server

```bash
rails server
# or
rails s
```

The server should start on `http://localhost:3000`

### 2. Check Current Pokémon

```bash
curl -X GET http://localhost:3000/api/v1/pokemon/index
```

### 3. Add Some Pokémon

```bash
# Add Pikachu
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{"id": 25, "name": "Pikachu"}'

# Add Bulbasaur
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "name": "Bulbasaur"}'

# Add Squirtle
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{"id": 7, "name": "Squirtle"}'
```

### 4. Verify They Were Added

```bash
curl -X GET http://localhost:3000/api/v1/pokemon/index
```

### 5. Delete a Pokémon

```bash
# Delete the first one (assuming ID is 1)
curl -X DELETE http://localhost:3000/api/v1/pokemon/1
```

### 6. Verify Deletion

```bash
curl -X GET http://localhost:3000/api/v1/pokemon/index
```

---

## Pretty Print JSON Responses

For better readability, pipe the output through `jq` (if installed):

```bash
curl -X GET http://localhost:3000/api/v1/pokemon/index | jq
```

Or use Python:
```bash
curl -X GET http://localhost:3000/api/v1/pokemon/index | python -m json.tool
```

---

## Common Error Responses

### Validation Error (Missing Required Fields)
```json
{
  "errors": ["Name can't be blank", "Pokemon can't be blank"]
}
```

### Duplicate Pokémon
If you try to create a Pokémon with the same `pokemon_id` or `name`:
```json
{
  "errors": ["Pokemon has already been taken", "Name has already been taken"]
}
```

### Not Found (Delete Non-existent Pokémon)
```json
{
  "error": "Pokemon not found"
}
```

---

## Testing with Postman or Insomnia

You can also import these endpoints into Postman or Insomnia:

**Collection Format:**
- GET: `http://localhost:3000/api/v1/pokemon/index`
- POST: `http://localhost:3000/api/v1/pokemon/create` (Body: JSON with `id` and `name`)
- DELETE: `http://localhost:3000/api/v1/pokemon/:id`

---

## Notes

- The API currently uses the parameter name `id` in the POST request, but stores it as `pokemon_id` in the database
- The `image_url` and `pokemon_type` fields are not currently set by the create endpoint
- There is no authentication required for these endpoints (`skip_before_action :verify_authenticity_token`)
- Pagination is not yet implemented for the index endpoint (see TODO in controller)

---

## Quick Reference

```bash
# List all Pokémon
curl http://localhost:3000/api/v1/pokemon/index

# Create Pokémon
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{"id": 25, "name": "Pikachu"}'

# Delete Pokémon (replace 1 with actual ID)
curl -X DELETE http://localhost:3000/api/v1/pokemon/1
```

