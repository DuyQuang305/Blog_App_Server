require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./Modules/routes");

//Connect to DB
db.connect();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

router(app);
app.get("/", function (req, res) {
  res.send("hello");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});
