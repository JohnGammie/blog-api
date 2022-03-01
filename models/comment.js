const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  created: { type: Date, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);
