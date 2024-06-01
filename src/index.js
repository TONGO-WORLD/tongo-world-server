const express = require("express");
const port = parseInt(process.env.PORT || "7500");

const app = express();

app.listen(port, () => {
  console.log("Server is running on port: %d", port);
});