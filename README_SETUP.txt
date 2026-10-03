ShareSphere Final Full-Stack Setup

1. Backend
   cd backend
   npm install
   Create backend/.env from .env.example and put your MySQL password.
   npm run dev

2. Frontend (second terminal)
   cd frontend
   npm install
   npm run dev

3. Open http://localhost:5173

Demo accounts (these are real rows in the existing database):
   Arjun: arjun@gmail.com / password123
   Divya: divya@gmail.com / password123

Authentication:
   - New passwords are stored as secure scrypt hashes.
   - Existing plaintext project passwords are transparently migrated to a hash after a successful login.
   - The Login/Register screen includes a Show password checkbox.

The app connects to the existing sharesphere MySQL database.
Do NOT rerun ShareSphere.sql unless you intentionally want to reset the database.

Final UX additions:
   - Start dates cannot be before today; end dates cannot be before start dates.
   - Return date cannot be before issue date and cannot be a future date.
   - Success messages appear in green and API/validation errors appear in red.
   - Submitted feedback and damage reports remain visible under the returned transaction.
