// npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";
import * as jwt from "jsonwebtoken";
import fs from "fs";

const app = express();

// Environment variables
dotenv.config();
const PORT = process.env.PORT || 8000;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Enable CORS
app.use(cors());

// Step 1: Redirect to Spotify's authorization page
app.get("/login", (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?${queryString.stringify({
      client_id: client_id,
      response_type: "code",
      redirect_uri: redirect_uri,
      scope: "user-library-read user-read-private user-read-email",
    })}`
  );
});

app.get("/callback", async (req, res) => {
  console.log("Callback route hit!");

  const code = req.query.code || null;

  console.log("Authorization code received:", code); // Log the authorization code

  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  // Request options to exchange the authorization code for an access token
  const authOptions = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${client_id}:${client_secret}`
      ).toString("base64")}`,
    },
    data: queryString.stringify({
      code: code,
      redirect_uri: redirect_uri, // This should be the same as registered in your dashboard
      grant_type: "authorization_code",
    }),
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
  };

  try {
    // Request the access token from Spotify
    const response = await axios(authOptions);
    const { access_token } = response.data;

    console.log("Access token received:", access_token); // Log the access token

    // Fetch the user profile using the access token
    const userOptions = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      method: "GET",
      url: "https://api.spotify.com/v1/me", // Endpoint to get user profile info
    };

    const userResponse = await axios(userOptions);
    const user = userResponse.data;

    // Send the user data to the client
    res.send(user);
  } catch (error) {
    console.error("Error during token exchange:", error.response || error);
    res.status(500).send("Failed to authenticate");
  }
});

//do carinha -- apple
const private_key = fs.readFileSync("apple_private_key.p8").toString();
const team_id = "";
const key_id = "";
const token = jwt.sign({}, private_key, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: team_id,
  header: {
    alg: "ES256",
    kid: key_id,
  },
});

const token_key = "";

app.get("/token", function (req, res) {
  if (req.query.key === token_key) {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ token: token }));
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

//do carinha
