/*[ Import ]*/
const Flight = require("../models/flights");
const Plane = require("../models/planes");
const fetchflights = require("../models/flights").fetchAll;
const fetchplanes = require("../models/planes").fetchAll;
const { timePassed, emptySeats, waitUntil } = require("../utils");
const perms = "admin";

/*[ Redirect to landing page ]*/
exports.getHome = async (req, res, next) => res.redirect("/");

/*[ Modifying planes ]*/
//Display page:
exports.getPlanes = async (req, res, next) => {
  const sess = req.session;
  if (sess.permissions != perms) return res.redirect("/");
  const planesarr = await fetchplanes();
  res.render(`${perms}/planes`, {
    pageTitle: "Planes",
    path: `/${perms}/planes`,
    user: sess.user.username,
    message: sess.message,
    planes: planesarr,
  });
};
//Handle modifying:
exports.postPlaneUpdate = async (req, res, next) => {
  const sess = req.session;
  const [buttonPress, id] = req.body.submit.split(" ");
  if (buttonPress != "update") return;
  const details = { id: id, seats: req.body.seats };
  const plane = new Plane(details);
  let successful = await plane.modify();
  if (successful) req.session.message = { text: "Plane seats edited successfully!", color: "green" };
  else sess.message = { text: "Encountered an error while updating plane seats.", color: "red" }; //failsave
  res.redirect(req.get("referer"));
};

/*[ Modifying flights ]*/
//Display page:
exports.getFlights = async (req, res, next) => {
  const sess = req.session;
  if (sess.permissions != perms) return res.redirect("/");
  const flightsarr = await fetchflights();
  const planesarr = await fetchplanes();
  res.render(`${perms}/flights`, {
    pageTitle: "Flights",
    path: `/${perms}/flights`,
    user: sess.user.username,
    message: sess.message,
    flights: flightsarr,
    planes: planesarr,
  });
};
//Handle modifying:
exports.postFlightUpdate = async (req, res, next) => {
  const sess = req.session;
  const [buttonPress, id] = req.body.submit.split(" ");
  const details = {
    id: id,
    destination: req.body.destination,
    origin: req.body.origin,
    price: req.body.price,
    plane: req.body.plane,
  };
  if (buttonPress == "update") {
    //Check flight has seats:
    let pause = true;
    let seats = await emptySeats(id, () => (pause = false), details.plane);
    await waitUntil((_) => !pause); //wait for all async functions to finish
    if (seats <= 0) {
      sess.message = { text: "Cannot update to that plane, there are too many occupied seats!", color: "red" };
      return res.redirect(req.get("referer"));
    }

    //Update flight:
    const flight = new Flight(details);
    let successful = await flight.modify();
    if (successful) sess.message = { text: "Flight edited successfully!", color: "green" };
    else sess.message = { text: "Encountered an error while updating flight.", color: "red" }; //failsave
    return res.redirect(req.get("referer"));
  } else if (buttonPress !== "remove") return;
  //Remove flight:
  const flight = new Flight(details);
  let successful = await flight.remove();
  if (successful) sess.message = { text: "Flight removed successfully!", color: "green" };
  else sess.message = { text: "Encountered an error while removing flight.", color: "red" }; //failsave
  res.redirect(req.get("referer"));
};
//Handle adding:
exports.postFlightAdd = async (req, res, next) => {
  const sess = req.session;
  const buttonPress = req.body.submit;
  if (buttonPress !== "add") return;
  //Check valid time:
  const datetime = req.body.datetime;
  if (timePassed(datetime)) {
    req.session.message = { text: "Can't add a flight in the past!", color: "red" };
    return res.redirect(req.get("referer"));
  }
  //Add flight:
  const details = {
    destination: req.body.destination,
    origin: req.body.origin,
    price: req.body.price,
    plane: req.body.plane,
    type: req.body.flighttype,
    datetime: datetime,
  };
  /*const destination = req.body.destination;
  const origin = req.body.origin;
  const price = req.body.price;
  const plane = req.body.plane;
  const type = req.body.flighttype;
  const flight = new Flight(null, destination, origin, price, plane, 0, datetime, type);*/
  const flight = new Flight(details);
  let successful = await flight.new();
  if (successful) sess.message = { text: "Flight added successfully!", color: "green" };
  else sess.message = { text: "Encountered an error while adding flight.", color: "red" }; //failsave
  res.redirect(req.get("referer"));
};
