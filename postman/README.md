# WhiteStone Farm API - Postman Collection

## Files in this folder:

| File | Description |
|------|-------------|
| Whitestone-API-Collection.json | All API endpoints with JWT authentication |
| Whitestone-API-Environment.json | Development environment (localhost:5500) |
| Whitestone-API-Environment-Production.json | Production environment |

## How to Import:

1. **Open Postman**
2. **Import Collection:**
   - Click **Import** → Upload Whitestone-API-Collection.json
3. **Import Environment:**
   - Click **Import** → Upload Whitestone-API-Environment.json
4. **Select Environment:**
   - Click the environment dropdown (top right)
   - Select **"WhiteStone API - Development"**

## How to Use:

1. **Login** - Send the Login request to get a token
2. **Token is auto-saved** to collection variables
3. **All other requests** automatically include the token in Authorization header
4. **Change port** - Update the aseUrl variable in the environment

## Authentication:

- All routes except /api/auth/login, /api/auth/register, and /api/health require a valid JWT token
- Token is sent as: Authorization: Bearer <token>
- Token expires after 24 hours

## Quick Test:

1. Login with: dmin / Admin123!
2. Try the **"Get All Employees"** request
3. Should return employee data

## Environment Variables:

| Variable | Description |
|----------|-------------|
| aseUrl | API base URL (http://localhost:5500) |
| port | Server port |
| 	oken | JWT token (auto-set on login) |
| dminUsername | Admin username |
| dminPassword | Admin password |
