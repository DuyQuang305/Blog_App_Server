const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Blogs = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    postImage: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blogs", Blogs);
