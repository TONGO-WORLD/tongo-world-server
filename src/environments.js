const { config } = require("dotenv");

config();

module.exports.MONGO_URI = process.env.MONGO_URI;
module.exports.DB = process.env.DB;
