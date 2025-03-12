//npm libraries
import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import queryString from "query-string";


//environment variables 
let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
let redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const app = express();

app.use(cors()); //enable cors
