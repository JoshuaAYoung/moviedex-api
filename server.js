require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const PORT = 1234;
const movies = require("./movieList.js");
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization").split(" ")[1];

  if (!authToken || authToken !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});

app.get("/movie", (req, res) => {
  let results = movies;
  const { genre, country, avg_vote } = req.query;

  if (country) {
    if (typeof country !== "string") {
      res.status(402).send("country must be a string");
    }

    results = results.filter(movie =>
      movie.country.toLowerCase().includes(country)
    );
  }

  if (genre) {
    results = results.filter(movie =>
      movie.genre.toLowerCase().includes(genre)
    );
  }

  if (avg_vote) {
    let parsedVote = parseInt(avg_vote);

    if (isNaN(parsedVote)) {
      return res.status(400).send("please enter a number");
    }

    if (parsedVote < 0 || parsedVote > 10) {
      return res.status(404).send("average vote out of range");
    }
    results = results.filter(movie => movie.avg_vote >= parsedVote);
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log("running");
});
