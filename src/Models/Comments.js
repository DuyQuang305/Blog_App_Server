const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Comment = new Schema({
  blogId: { type: Schema.Types.ObjectId, ref: "Blogs", required: true },
  content: { type: String, require: true },
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
});

module.exports = mongoose.model("Comment", Comment);
