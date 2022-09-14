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
app.post("/search", async (req, res) => {
  console.log(`[+] NEW SERACH REQUEST: ${req.body}`);
  await GAME.find()
    .then((result) => {
      res.send(result);
      console.log(`[+] SENDING A GAME LIST`);
    })
    .catch((err) => {
      res.send(err);
      console.log(`[-] SOMETHING WENT WRONG IN DATA SEARCH: ${err}`);
    });
});

// SUGESSTION HANDLE
app.post("/search/:cpu", async (req, res) => {
  const type = req.params.cpu;
  try {
    if (type === "cpu") {
      await CPU.find({ MODEL: { $regex: new RegExp(req.body.value, "i") } })
        .limit(5)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(`FETCH ERROR: ${err}`);
          res.send(err);
        });
    } else if (type === "gpu") {
      await GPU.find({ MODEL: { $regex: new RegExp(req.body.value, "i") } })
        .limit(5)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(`FETCH ERROR: ${err}`);
          res.send(err);
        });
    } else if (type === "name") {
      await GAME.find({ MODEL: { $regex: new RegExp(req.body.value, "i") } })
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
