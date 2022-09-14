const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GpuSchema = new Schema({}, { collection: "GPUs" });

const GPU = mongoose.model("GPU", GpuSchema);
module.exports = GPU;
