/*[ Automatically open website when app is launched ] (true/false)*/
const autoOpen = true;

/*[ Imports ]*/
//Framework:
const express = require("express");
var session = require("express-session");
//Database:
const mongoose = require("mongoose");
require("dotenv").config(); //enables environment variables
const process = require("process");
const { DB } = process.env; //load db password from environment variables
//Aid:
const path = require("path");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error.js"); //handle errors
const open = require("open"); //open page automatically when app launches
const { waitUntil } = require("./utils.js");
//Info:
const port = 3000;
const url = `http://localhost:${port}/`;
const info = `\u001b[2;36mInfo:\u001b[0m `; //info console color
const error = `\u001b[2;31mError:\u001b[0m `; //error console color
const urlColor = `\u001b[2;32m${url}\u001b[0m`; //url console color
const endMsg = `\t\u001b[2;30mpress Ctrl+C to exit\u001b[0m`;
const appLaunch = info + `\tLaunching app...`;
const appReady = info + `\tApp launched at ` + urlColor;
const appClose = info + `\tApp closed.`;
const dbConnecting = info + `\tConnecting to database...`;
const dbConnected = info + `\tDatabase connected.`;
const dbError =
  error + `\tEncountered an error while connecting to database! Make sure that you stored your MongoDB connection string in .env`;

/*[ Initialize app ]*/
console.log(appLaunch);
const app = express();
app.set("view engine", "ejs"); //define engine
app.set("views", "views"); //define views location

/*[ Connect to database ]*/
let connected = null;
(async () => {
  mongoose.set("strictQuery", true); //force to follow schema
  console.log(dbConnecting);
  try {
    await mongoose.connect(DB).then(() => {
      connected = true;
      console.log(dbConnected);
    });
  } catch (error) {
    connected = false;
    console.log(error);
  }
})();

/*[ Session support ]*/
app.use(session({ resave: false, saveUninitialized: false, secret: "session secret" }));

/*[ Define routes ]*/
const visitorRoutes = require("./routes/visitor");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

/*[ Define aid tools ]*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //define public folder
app.use("/images", express.static(path.join(__dirname, "public/images")));

/*[ Define paths to routes ]*/
app.use(visitorRoutes); //landing page
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use(errorController.get404Page); //error page

/*[ Launch app ]*/
(async () => {
  await waitUntil((_) => connected != null); //wait for all async functions to finish
  if (!connected) return console.log(dbError); //don't launch if connection failed
  //Launch:
  app.listen(port);
  if (autoOpen) open(url);
  else console.log(appReady);
  process.stdout.write(endMsg);
})();

/*[ Process events ]*/
process.on("SIGINT", (signal, code) => process.exit(128 + signal));
process.on("exit", (code) => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log(appClose);
});
