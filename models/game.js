const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSchema = new Schema(
  {
    details: {
      Name: {
        type: String,
        require: true,
      },
      Developer: {
        type: String,
      },
      Year: {
        type: String,
      },
      Genres: {
        type: String,
      },
    },
    System: {
      CPU: {
        type: String,
      },
      GPU: {
        type: String,
      },
      MEMORY: {
        type: String,
      },
    },
  },
  { collection: "GAMES" }
);

const GAME = mongoose.model("GAME", GameSchema);
module.exports = GAME;
