/*[ Import ]*/
const Account = require("../models/accounts");
const { processPayment } = require("../models/accounts");
const { fetchFiltered, sortFiltered } = require("../models/flights");
const { timePassed, emptySeats, waitUntil, offloadFields } = require("../utils");
const perms = "user";

/*[ Redirect to landing page ]*/
exports.getHome = async (req, res, next) => res.redirect("/");

/*[ Choosing flights ]*/
//Display page:
exports.getFlights = async (req, res, next) => {
  const sess = req.session;
  if (sess.permissions != perms) return res.redirect("/");
  const message = sess.message;
  sess.message = { text: "", color: "" };
  const filter = { destination: "", origin: "", minprice: "", maxprice: "", startdatetime: "", enddatetime: "", type: "" };
  res.render(`${perms}/flights`, {
    pageTitle: "Flights",
    path: `/${perms}/flights`,
    user: sess.user.username,
    message: message,
    flights: sess.flights || null,
    filter: sess.filter || filter,
    sort: sess.sort || null,
  });
};
//Handle filtering:
exports.postFlightFilter = async (req, res, next) => {
  const sess = req.session;
  const filter = {
    destination: req.body.destination,
    origin: req.body.origin,
    minprice: req.body.minprice,
    maxprice: req.body.maxprice,
    startdatetime: req.body.startdatetime,
    enddatetime: req.body.enddatetime,
    type: req.body.flighttype,
  };
  const result = await fetchFiltered(filter);
  if (result.successeful) {
    //Flights found
    sess.message = { text: "", color: "" };
    sess.filter = filter;
    sess.flights = result.flightsarr;
    return res.redirect("/user/flights");
  }
  //Couldn't find flights
  sess.message = { text: result.text, color: "red" };
  sess.filter = filter;
  sess.flights = null;
  return res.redirect("/user/flights");
};
//Handle sorting:
exports.postFlightSort = async (req, res, next) => {
  const sess = req.session;
  const details = req.body.sort;
  const flightsarr = sortFiltered(sess.flights, details);
  sess.message = { text: "", color: "" };
  sess.flights = flightsarr;
  sess.sort = details;
  return res.redirect("/user/flights");
};

/*[ Booking flights ]*/
//Handle booking:
exports.postFlightBook = async (req, res, next) => {
  const sess = req.session;
  const [buttonPress, id] = req.body.submit.split(" ");
  if (buttonPress != "book") return;
  const datetime = req.body.datetime;
  //Check flight not deptarted:
  if (timePassed(datetime)) {
    sess.message = { text: "Can't book a flight that's already departed!", color: "red" };
    return res.redirect("/user/flights");
  }
  //Check flight has seats:
  let pause = true;
  let seats = await emptySeats(id, () => (pause = false));
  await waitUntil((_) => !pause); //wait for all async functions to finish
  if (seats <= 0) {
    sess.message = { text: "That flight ran out of seats, sorry!", color: "red" };
    return res.redirect("/user/flights");
  }
  //Flight Details:
  const flight = {
    destination: req.body.destination,
    origin: req.body.origin,
    price: req.body.price,
    datetime: datetime,
    type: req.body.flighttype,
    tickets: req.body.tickets,
    id: id,
  };
  sess.flight = flight;
  sess.message = { text: "", color: "" };
  return res.redirect("/user/payment");
};
//Display page:
exports.getPayment = async (req, res, next) => {
  const sess = req.session;
  if (sess.permissions != perms) return res.redirect("/");
  res.render(`${perms}/payment`, {
    pageTitle: "Payment",
    path: `/${perms}/payment`,
    user: sess.user.username,
    message: sess.message,
    flight: sess.flight,
    IDnumber: sess.IDnumber || "",
    fullName: sess.fullName || "",
    cardNumber: sess.cardNumber || "",
    saveCard: sess.saveCard || "",
  });
};
//Handle payment:
exports.postPayment = async (req, res, next) => {
  const sess = req.session;
  const buttonPress = req.body.submit;
  const { idnumber, fullname, cardnumber, storecard } = req.body;
  offloadFields(["IDnumber", "fullName", "cardNumber", "saveCard"], sess, [idnumber, fullname, cardnumber, storecard]);
  if (buttonPress === "fillcard") {
    //Fill card from database:
    if (sess.user.IDnumber && sess.user.fullName && sess.user.cardNumber) {
      offloadFields(["IDnumber", "fullName", "cardNumber"], sess, sess.user);
      sess.message = { text: "", color: "" };
    } else sess.message = { text: "You don't have a card stored!", color: "red" };
    return res.redirect("/user/payment");
  } else if (buttonPress != "pay") return;
  //Check fields not empty:
  if (!idnumber || !fullname || !cardnumber) {
    sess.message = { text: "Please fill all payment details!", color: "red" };
    return res.redirect("/user/payment");
  }
  //Check valid ID number field:
  if (!parseInt(idnumber, 10) || idnumber.length != 9) {
    sess.message = { text: "ID Number is invalid!", color: "red" };
    return res.redirect("/user/payment");
  }
  //Check valid card number field:
  if (!parseInt(cardnumber, 10) || cardnumber.length != 16) {
    sess.message = { text: "Card Number is invalid!", color: "red" };
    return res.redirect("/user/payment");
  }
  //Check flight not deptarted:
  var flight = sess.flight;
  if (timePassed(flight.datetime)) {
    sess.message = { text: "Can't book a flight that's already departed!", color: "red" };
    return res.redirect("/user/payment");
  }
  //Check flight has seats:
  let pause = true;
  let seats = await emptySeats(flight.id, () => (pause = false));
  await waitUntil((_) => !pause); //wait for all async functions to finish
  if (seats <= 0) {
    sess.message = { text: "That flight ran out of seats, sorry!", color: "red" };
    return res.redirect("/user/payment");
  }
  //Pay for flight:
  let successful = await processPayment(sess.user, flight);
  if (successful) {
    //Paid for flight:
    const account = new Account(sess.user, { IDnumber: idnumber, fullName: fullname, cardNumber: cardnumber });
    if (storecard) {
      //Save payment details
      let saved = await account.modify();
      if (saved) {
        offloadFields(["IDnumber", "fullName", "cardNumber"], sess.user, sess);
        sess.message = { text: "Flight successfully booked! Your payment details were successefuly saved." };
      } else sess.message = { text: "Flight successfully booked! Encountered an error while saving your payment details." }; //failsave
    } else sess.message = { text: "Flight successfully booked! " };
    return res.redirect("/");
  }
  //Payment failed:
  sess.message = { text: "Encountered an error while booking your flight!", color: "" }; //failsave
  return res.redirect("/");
};
