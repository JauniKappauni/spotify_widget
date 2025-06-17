const express = require("express");
const cors = require("cors")
const axios = require("axios");
const dotenv = require("dotenv");
const querystring = require("querystring");
dotenv.config();
const app = express();
const port = 8000;
let access_token = "";

const spotifyclientid = process.env.SPOTIFY_CLIENT_ID;
const spotifyclientsecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirecturl = process.env.SPOTIFY_REDIRECT_URL;

app.use(cors());

app.get("/login", (req, res) => {
  const scope = "user-read-currently-playing";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: spotifyclientid,
      scope: scope,
      redirect_uri: redirecturl,
    });
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirecturl,
      client_id: spotifyclientid,
      client_secret: spotifyclientsecret,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  access_token = response.data.access_token;
  res.send("Login successful! API now available");
});

app.get("/api", async (req, res) => {
  if (!access_token) {
    return res.send("No access token! Visit the /login route.");
  }
  const response = await axios.get(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: "Bearer " + access_token },
    }
  );
  if (!response.data) {
    return res.send("No song is currently playing");
  }
  const song = response.data.item;
  res.json({name: song.name, artist: song.artists[0].name, pic: song.album.images[0].url})
})

app.listen(port, () => {
  console.log(`Please visit http://127.0.0.1:${port}/login`);
});