const express = require("express");
const cors = require("cors");
const connectDB = require("./storage/database");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8888;

//app configurations
app.use(express.json());

app.use(bodyParser.json());

app.use(cors());

app.use(express.urlencoded({ extended: false }));

//route.
const mpesa = require("./routes/index");

//listening to a specific route
app.use("/mpesa", mpesa);

// index route
app.get("/", (req, res) => {
  res.send("Welcome to the Mpesa API");
});

//listening to a port.

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI).then(() => {
      console.log("Database connected successfully");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

start();
