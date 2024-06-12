const express = require("express");
const { createServer } = require("http");
const { initMongoConnection } = require("./store");
const { initializeSocketServer } = require("./peer-to-peer/socket");
const port = parseInt(process.env.PORT || "7500");

const app = express();
const server = createServer(app);

initMongoConnection().then(() => {
  initializeSocketServer(server);
});

server.listen(port, () => {
  console.log("Server is running on port: %d", port);
});
