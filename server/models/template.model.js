const mongoose = require("mongoose");
const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateName: {
      type: String,
      required: true,
      default: "New Template 0",
    },
    title: {
      value: {
        type: String,
        required: true,
        default: "Enter your text here",
      },
      fontSize: {
        type: String,
        enum: ["sm", "md", "lg"],
        required: true,
        default: "md",
      },
      textColor: {
        type: String,
        required: true,
        default: "#000000",
      },
      alignment: {
        type: String,
        enum: ["left", "right", "center"],
        required: true,
        default: "left",
      },
    },
    context: {
      value: {
        type: String,
        required: true,
        default: "Enter your text here",
      },
      fontSize: {
        type: String,
        enum: ["sm", "md", "lg"],
        required: true,
        default: "md",
      },
      textColor: {
        type: String,
        required: true,
        default: "#000000",
      },
      alignment: {
        type: String,
        enum: ["left", "right", "center"],
        required: true,
        default: "left",
      },
    },
    footer: {
      value: {
        type: String,
        required: true,
        default: "Enter your text here",
      },
      fontSize: {
        type: String,
        enum: ["sm", "md", "lg"],
        required: true,
        default: "md",
      },
      textColor: {
        type: String,
        required: true,
        default: "#000000",
      },
      alignment: {
        type: String,
        enum: ["left", "right", "center"],
        required: true,
        default: "left",
      },
    },
    imageUrl: [
      {
        type: String,
        required: false,
      },
    ],
    logoUrl: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
