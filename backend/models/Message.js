const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel;
