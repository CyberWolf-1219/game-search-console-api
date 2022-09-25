const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GpuSchema = new Schema(
  {
    NAME: {
      type: String,
    },
    MEMORY: {
      type: String,
    },
  },
  { collection: "GPUs" }
);

const GPU = mongoose.model("GPU", GpuSchema);
module.exports = GPU;
