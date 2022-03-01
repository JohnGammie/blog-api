const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  created: { type: Date, required: true },
  published: { type: Boolean, required: true },
});

module.exports = mongoose.model("Post", PostSchema);
