/*[ Import ]*/
const { Schema, model } = require("mongoose"); //database access

/*[ Database structure ]*/
const accountSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: String,
  password: String,
  permissions: String,
  IDnumber: { type: String, required: false },
  fullName: { type: String, required: false },
  cardNumber: { type: String, required: false },
});

/*[ Register in database ]*/
module.exports = model("Account", accountSchema, "accounts");
