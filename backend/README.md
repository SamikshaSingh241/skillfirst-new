# SkillFirst Backend

This is the backend for the SkillFirst application, using Express and MongoDB.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas.
   - Update `.env` with your MongoDB URI.

3. Seed the database:
   ```
   node seed.js
   ```

4. Start the server:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

The server will run on http://localhost:5000

## API Endpoints

- GET /api/users - Get all users
- POST /api/users - Create a new user