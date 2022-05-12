const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const user = require("./router/index.js");
// const SERVER_ADDRESS= `${process.env.SERVER}`;
// const SERVER_PORT=`${process.env.PORT}`
const SERVER_ADDRESS= `http://0.0.0.0`;
const SERVER_PORT=`3000`
app.use(
  cors({
    origin: [`${SERVER_ADDRESS}:${SERVER_PORT}`],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/user", user);
app.listen(SERVER_PORT, () => {
  console.log(
    `User server running on :: ${SERVER_ADDRESS}:${SERVER_PORT}`
  );
});
