const express = require("express");
const cors = require("cors");
const server = express();

server.use(cors());

server.get("/", (req, res) => {
  res.json("hello");
});

const port = 8080;

server.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server is running on port ${port}`);
  }
});
