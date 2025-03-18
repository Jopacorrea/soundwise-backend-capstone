// // server.js
// // npm libraries
// import axios from "axios";
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import queryString from "query-string";

// // local libraries
// import appleMusicRouter from "./routes/apple-music-route.js";
// import appleAuthMiddleware from "./middleware/apple-auth.js";
// import generateAppleToken from "./utils/generateAppleToken.js";
// import spotifyRouterFactory from "./routes/spotify-route.js";

// console.log(generateAppleToken());

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8888;

// app.use(cors({
//   origin: "http://localhost:5173", // Allow your frontend to access the backend
//   credentials: true
// }));

// app.use(express.json());

// // Generate Apple JWT Token
// const appleToken = generateAppleToken();

// // Middleware to handle Apple Music authentication
// app.use("/apple", appleAuthMiddleware);

// // Load Routes
// app.use("/apple", appleMusicRouter);
// app.use("/spotify", spotifyRouterFactory());

// // 🔹 **Spotify Authentication - Redirect to Spotify Login**
// app.get("/login", (req, res) => {
//   const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${queryString.stringify(
//     {
//       client_id: process.env.SPOTIFY_CLIENT_ID,
//       response_type: "code",
//       redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
//       scope: "user-library-read user-read-private user-read-email",
//     }
//   )}`;

//   res.redirect(spotifyAuthUrl);
// });

// // 🔹 **Spotify OAuth Callback**
// app.get("/callback", async (req, res) => {
//   const code = req.query.code || null;
//   if (!code) {
//     return res.status(400).send("Authorization code not provided.");
//   }

//   console.log("Authorization code received:", code);

//   try {
//     const response = await axios.post(
//       "https://accounts.spotify.com/api/token",
//       queryString.stringify({
//         code: code,
//         redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
//         grant_type: "authorization_code",
//       }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: `Basic ${Buffer.from(
//             `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
//           ).toString("base64")}`,
//         },
//       }
//     );

//     const { access_token, refresh_token, expires_in } = response.data;
//     console.log("Access Token:", access_token);

//     // Store tokens temporarily for the session
//     global.spotifyTokens = { access_token, refresh_token };

//     // Redirect to frontend with the access token in the URL
//     res.redirect(`http://localhost:5173/auth?access_token=${access_token}`);  // Modify this URL based on your frontend route
//   } catch (error) {
//     console.error(
//       "Error exchanging token:",
//       error.response?.data || error.message
//     );
//     res.status(500).send("Failed to authenticate");
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

// server.js

// npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";

// local libraries
import appleMusicRouter from "./routes/apple-music-route.js"; // Route for Apple Music API
import appleAuthMiddleware from "./middleware/apple-auth.js"; // Apple Auth Middleware
import generateAppleToken from "./utils/generateAppleToken.js"; // Function to generate Apple Music JWT token
import spotifyRouterFactory from "./routes/spotify-route.js"; // Spotify Routes

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware setup
app.use(cors({
  origin: "http://localhost:5173",  // Ensure this is your React frontend URL
  credentials: true  // Allow credentials for session-based cookies
}));

app.use(express.json());  // Parse JSON bodies

// Generate Apple JWT Token
const appleToken = generateAppleToken();
console.log("Apple Music Developer Token:", appleToken);

// Middleware for Apple Music authentication
app.use("/apple", appleAuthMiddleware);  // This will authenticate users for Apple Music

// Load Routes
app.use("/apple", appleMusicRouter); // Define Apple Music routes
app.use("/spotify", spotifyRouterFactory()); // Define Spotify routes

// 🔹 **Spotify Authentication - Redirect to Spotify Login**
app.get("/spotify/login", (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${queryString.stringify(
    {
      client_id: process.env.SPOTIFY_CLIENT_ID, // Spotify client ID from .env
      response_type: "code",  // Get authorization code
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI, // Callback URL
      scope: "user-library-read user-read-private user-read-email", // Permissions
    }
  )}`;

  res.redirect(spotifyAuthUrl); // Redirect to Spotify login page
});

// 🔹 **Spotify OAuth Callback**
app.get("/spotify/callback", async (req, res) => {
  const code = req.query.code || null;  // Get authorization code from query params
  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  console.log("Authorization code received:", code);

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      queryString.stringify({
        code: code,  // Authorization code
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,  // Callback URL
        grant_type: "authorization_code",  // Grant type for exchange
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`  // Encode client ID and secret
          ).toString("base64")}`,  // Base64-encoded credentials
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log("Access Token:", access_token);

    // Store tokens temporarily (you can store them in a session or database in production)
    global.spotifyTokens = { access_token, refresh_token };

    // Redirect to frontend with access token in URL
    res.redirect(`http://localhost:5173/auth?access_token=${access_token}`);
  } catch (error) {
    console.error("Error exchanging token:", error.response?.data || error.message);
    res.status(500).send("Failed to authenticate with Spotify");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});