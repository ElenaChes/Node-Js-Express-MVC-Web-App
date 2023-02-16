/*[ Import ]*/
const Flightdb = require("./database/flight");
const Planedb = require("./database/plane");

/*[Aid functions]*/
//Forces code to wait until condition is met
function waitUntil(condition) {
  const check = (resolve) => {
    if (condition()) resolve();
    else setTimeout((_) => check(resolve), 100);
  };
  return new Promise(check);
}
//Checks if time is in the past
function timePassed(time) {
  const now = new Date();
  var timezone = now.getTimezoneOffset() * 60000;
  var globalTime = new Date(now - timezone).toISOString().slice(0, -8);
  return time < globalTime;
}
//Checks how many empty seats are in the flight
async function emptySeats(flight, next, id) {
  var result = -1;
  if (!flight.plane && flight.occupied === undefined)
    try {
      flight = await Flightdb.findOne({ _id: flight });
    } catch (error) {}
  if (flight.plane && flight.occupied !== undefined) {
    try {
      let plane;
      if (!id) plane = await Planedb.findOne({ _id: flight.plane });
      else plane = await Planedb.findOne({ _id: id });
      if (plane) result = plane.seats - flight.occupied;
    } catch (error) {}
  }
  next();
  return result;
}
//Update fields in object
function offloadFields(fields, object1, object2) {
  //Empty fields:
  if (!object2)
    return fields.forEach((field) => {
      object1[field] = null;
    });
  //Fill fields from array
  if (Array.isArray(object2)) {
    var index = 0;
    return fields.forEach((field) => {
      object1[field] = object2[index++];
    });
  }
  //Fill fields from object
  fields.forEach((field) => {
    object1[field] = object2[field];
  });
}

/*[ External access ]*/
module.exports = { waitUntil, timePassed, emptySeats, offloadFields };
