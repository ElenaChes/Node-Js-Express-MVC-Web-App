/*[ Import ]*/
const { Schema, model } = require("mongoose"); //database access

/*[ Database structure ]*/
const flightSchema = new Schema({
  _id: Schema.Types.ObjectId,
  destination: String,
  origin: String,
  datetime: String,
  price: Number,
  plane: String,
  occupied: Number,
  type: String,
  popularity: Number,
});

/*[ Register in database ]*/
module.exports = model("Flight", flightSchema, "flights");
