const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CpuSchema = new Schema(
  {
    MODEL: {
      type: String,
      required: true,
    },
    FREQUENCY: {
      type: String,
      required: true,
    },
    CORES: { type: String },
    THREADS: { type: String },
  },
  { collection: "CPUs" }
);

const CPU = mongoose.model("CPU", CpuSchema);
module.exports = CPU;
