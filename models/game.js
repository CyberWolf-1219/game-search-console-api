const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSchema = new Schema(
  {
    DETAILS: {
      NAME: {
        type: String,
        require: true,
      },
      DEVELOPER: {
        type: String,
        require: true,
      },
      RELEASE_YEAR: {
        type: String,
        require: true,
      },
      GENRES: {
        type: Array,
        require: true,
      },
      TAGS: {
        type: Array,
        require: true,
      },
    },
    SYSTEM_REQUIREMENTS: {
      PROCESSORS: {
        type: Array,
      },
      GRAPHICS: {
        type: Array,
      },
      MEMORY: {
        type: Number,
      },
      STORAGE: {
        type: Number,
      },
    },
  },
  { collection: "GAMES" }
);

const GAME = mongoose.model("GAME", GameSchema);
module.exports = GAME;
