const express = require("express");
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
  res.send("Login successful! You now can visit the /current route.");
});

app.get("/current", async (req, res) => {
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
  res.send(
    `
    <div>
    <p>Current song: ${song.name}</p>
    <p>Artist: ${song.artists[0].name}</p>
    <img src=${song.album.images[0].url} width="300"/>
    </div>
    `
  );
});

app.listen(port, () => {
  console.log(`Please visit http://127.0.0.1:${port}/login`);
});