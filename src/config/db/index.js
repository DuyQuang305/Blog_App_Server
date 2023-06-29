const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Blog");
    console.log("Connect successfully!!");
  } catch (e) {
    console.log("Connect failure!!" + e.message);
  }
}

module.exports = { connect };
