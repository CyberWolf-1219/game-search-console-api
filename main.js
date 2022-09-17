// EXPRESS MONGOOSE
const express = require("express");
const GAME = require("./models/game");
const CPU = require("./models/cpu");
const GPU = require("./models/gpu");
const cors = require("cors");
const mongoose = require("mongoose");
// APP SET UP ==============================================
const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));
// ==========================================================
mongoose
  .connect("mongodb://0.0.0.0:27017/search-for-games", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log(`[+] DATABASE CONNECTED:${result}`);
    const server = app.listen(1219, "localhost", () => {
      console.log("[+] SERVER STARTED ON PORT: 1219");
    });
  })
  .catch((err) => {
    console.log(`[-] DATABASE CONNECTION FAILED:${err}`);
  });

// ROUTING =========================================================
//HOME
app.get("/", (req, res) => {
  console.log("[+] NEW REQUEST");

  res.send("<a href='/games'> GAMES</a>");
});

//SEARCH
app.post("/search", (req, res) => {
  console.log(`[+] NEW SERACH REQUEST...`);
  const cpu = req.body.cpu;
  const gpu = req.body.gpu;
  const memory = req.body.memory;
  const name = req.body.name;

  if (name !== "") {
    GAME.find({ "DETAILS.NAME": { $regex: new RegExp(name, "i") } })
      .then((searchResult) => {
        res.send(searchResult);
      })
      .catch((dbSearchError) => {
        console.log(dbSearchError);
      });
  } else if (cpu === "" && gpu === "" && memory === "") {
    GAME.find()
      .then((searchResult) => {
        res.send(searchResult);
      })
      .catch((dbSearchError) => {
        res.send(dbSearchError);
      });
  } else {
    GAME.find({
      System: {
        CPU: { $regex: new RegExp(cpu, "i") },
        GPU: { $regex: new RegExp(gpu, "i") },
        MEMORY: memory,
      },
    })
      .then((searchResult) => {
        res.send(searchResult);
      })
      .catch((dbSearchError) => {
        res.send(dbSearchError);
      });
  }
});

// SUGESSTION HANDLE
app.post("/search/:hint", (req, res) => {
  const type = req.params.hint;
  const value = req.body.value;
  console.log(type);
  console.log(value);
  try {
    if (type === "cpu") {
      CPU.find({ MODEL: { $regex: new RegExp(value, "i") } })
        .limit(5)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(`FETCH ERROR: ${err}`);
          res.send(err);
        });
    } else if (type === "gpu") {
      GPU.find({ MODEL: { $regex: new RegExp(value, "i") } })
        .limit(5)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(`FETCH ERROR: ${err}`);
          res.send(err);
        });
    } else if (type === "name") {
      GAME.find({
        "DETAILS.NAME": { $regex: value, $options: "i" },
      })
        .limit(5)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(`FETCH ERROR: ${err}`);
          res.send(err);
        });
    }
  } catch (e) {
    console.log(e);
  }
});
