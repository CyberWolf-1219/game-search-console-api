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

// BACKEND PROCESS FUCNTIONS =======================================
function getCpu(query, projection) {
  return CPU.find(query, projection).exec();
}

function getGpu(query, projection) {
  let result = GPU.find(query, projection).exec();
  return result;
}

function getGames(query = {}, projection = {}, sorting = {}) {
  let result = GAME.find(query, projection).sort(sorting).exec();
  return result;
}

async function searchWithSystem(cpuId, gpuId, memory, sorting = {}) {
  let fullQuery = {
    "SYSTEM_REQUIREMENTS.PROCESSORS": cpuId,
    "SYSTEM_REQUIREMENTS.GRAPHICS": gpuId,
    "SYSTEM_REQUIREMENTS.MEMORY": { $lte: memory },
  };

  let gpuAbsentQuery = {
    "SYSTEM_REQUIREMENTS.PROCESSORS": cpuId,
    "SYSTEM_REQUIREMENTS.MEMORY": { $lte: memory },
  };

  let cpuAbsentQuery = {
    "SYSTEM_REQUIREMENTS.GRAPHICS": gpuId,
    "SYSTEM_REQUIREMENTS.MEMORY": { $lte: memory },
  };

  let games = null;

  try {
    if (cpuId === null) {
      let games = await getGames(cpuAbsentQuery, {}, sorting);
      // console.trace(`SS RESULT: ${games}`);
      return games;
    }

    if (gpuId === null) {
      let games = await getGames(cpuId, {}, sorting);
      // console.trace(`SS RESULT: ${games}`);
      return games;
    }

    let games = await getGames(fullQuery, {}, sorting);
    // console.trace(`SS RESULT: ${games}`);
    return games;
  } catch (error) {
    console.log(error.stack);
  }
}

async function idsToNames(games) {
  let readableGames = [];

  for (game of games) {
    let cpuids = game.SYSTEM_REQUIREMENTS.PROCESSORS;
    let gpuids = game.SYSTEM_REQUIREMENTS.GRAPHICS;

    let cpuNames = [];
    let gpuNames = [];

    for (let cpuid of cpuids) {
      let result = await getCpu(
        { _id: mongoose.Types.ObjectId(cpuid) },
        { MODEL: 1 }
      );
      let name = result[0].MODEL;
      cpuNames.push(name);
    }
    game.SYSTEM_REQUIREMENTS.PROCESSORS = cpuNames;

    for (let gpuid of gpuids) {
      let result = await getGpu(
        { _id: mongoose.Types.ObjectId(gpuid) },
        { NAME: 1 }
      );
      let name = result[0].NAME;
      gpuNames.push(name);
    }
    game.SYSTEM_REQUIREMENTS.GRAPHICS = gpuNames;

    readableGames.push(game);
  }

  return readableGames;
}

// ROUTING =========================================================
//HOME
app.get("/", (req, res) => {
  console.log("[+] NEW REQUEST");

  res.send("<a href='/games'> GAMES</a>");
});

//SEARCH
app.post("/search", async (req, res) => {
  console.log(`[+] NEW SERACH REQUEST...`);
  try {
    const inputCPU = req.body.cpu;
    const inputGPU = req.body.gpu;
    const inputMemory =
      req.body.memory === "" ? 51200 : parseInt(req.body.memory);
    const inputName = req.body.name;
    const inputSorting = req.body.sorting;
    let sorting = {};

    if (inputSorting !== "") {
      if (inputSorting === "NAME") {
        sorting = { "DETAILS.NAME": 1 };
      }
      if (inputSorting === "DEVELOPER") {
        sorting = { "DETAILS.DEVELOPER": 1 };
      }
      if (inputSorting === "YEAR") {
        sorting = { "DETAILS.RELEASE_YEAR": 1 };
      }
    }

    if (
      inputCPU === "" &&
      inputGPU === "" &&
      inputMemory === 51200 &&
      inputName === ""
    ) {
      let result = await getGames({}, {}, sorting);
      let games = await idsToNames(result);
      res.send(games);
      return;
    }

    if (inputName !== "") {
      let query = {
        "DETAILS.NAME": { $regex: new RegExp(inputName), $options: "i" },
      };
      let result = await getGames(query, {}, sorting);
      let games = await idsToNames(result);
      res.send(games);
      return;
    }

    var inputCPUId = null;
    var inputGPUId = null;

    if (inputCPU !== "") {
      let result = await getCpu({ MODEL: inputCPU }, { _id: 1 });
      inputCPUId = result[0]._id.toString();
    }

    if (inputGPU !== "") {
      let result = await getGpu({ NAME: inputGPU }, { _id: 1 });
      inputGPUId = result[0]._id.toString();
    }

    let result = await searchWithSystem(
      inputCPUId,
      inputGPUId,
      inputMemory,
      sorting
    );

    let games = await idsToNames(result);

    res.send(games);
  } catch (error) {
    console.log(`SEARCH FUNC: ${error.stack}`);
    res.status(500).send(null);
  }
});

// SUGESSTION HANDLE
app.post("/search/:type", (req, res) => {
  const type = req.params.type;
  const value = req.body.value;

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
      return;
    }

    if (type === "gpu") {
      GPU.find({ NAME: { $regex: new RegExp(value, "i") } })
        .limit(5)
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          console.log(`FETCH ERROR: ${err}`);
          res.send(err);
        });
      return;
    }

    if (type === "name") {
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
      return;
    }
  } catch (e) {
    console.log(e);
  }
});
