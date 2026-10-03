# ShareSphere Deployment

Architecture: Vercel frontend -> Railway Node/Express backend -> Railway MySQL.

Frontend production variable: VITE_API_URL=https://YOUR-BACKEND.onrender.com/api (or your Railway backend URL)/api

Do not commit backend/.env or frontend/.env.
