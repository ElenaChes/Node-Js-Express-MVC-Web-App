/*[ Import ]*/
const { Schema, model } = require("mongoose"); //database access

/*[ Database structure ]*/
const planeSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  seats: Number,
});

/*[ Register in database ]*/
module.exports = model("Plane", planeSchema, "planes");
