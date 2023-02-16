/*[ Import ]*/
const mongoose = require("mongoose");
const Flightdb = require("../database/flight");
const { waitUntil, timePassed, emptySeats } = require("../utils");

/*[ Handle flights database ]*/
class Flight {
  constructor(details) {
    this.id = details.id;
    this.destination = details.destination;
    this.origin = details.origin;
    this.price = details.price;
    this.plane = details.plane;
    this.occupied = details.occupied;
    this.datetime = details.datetime;
    this.type = details.type;
  }

  /*[ Modify database ]*/
  //Modify single flight in database:
  async modify() {
    try {
      await Flightdb.updateOne(
        { _id: this.id },
        { destination: this.destination, origin: this.origin, price: this.price, plane: this.plane, occupied: this.occupied }
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  //Remove single flight from database:
  async remove() {
    try {
      console.log(this);
      await Flightdb.deleteOne({ _id: this.id });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  //Add new flight to database:
  async new() {
    try {
      await Flightdb.create({
        _id: mongoose.Types.ObjectId(),
        destination: this.destination,
        origin: this.origin,
        price: this.price,
        plane: this.plane,
        occupied: 0,
        datetime: this.datetime,
        type: this.type,
        popularity: 0,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /*[ Get from database ]*/
  //Fetch all flights:
  static async fetchAll() {
    let flightsdb = await Flightdb.find({});
    return flightsdb;
  }
  //Fetch filtered flights:
  static async fetchFiltered(filter) {
    let flightsdb;
    //Filter according to origin, destination, flight type:
    if (filter.destination)
      flightsdb = await Flightdb.find({ destination: filter.destination, origin: filter.origin, type: filter.type });
    else flightsdb = await Flightdb.find({ origin: filter.origin, type: filter.type });
    if (!flightsdb || flightsdb.length === 0) return { successful: false, text: "No flights found." };
    //Prepare to filter according to other fields:
    var queue = flightsdb.length;
    var filteredflights = [];
    for (var flight of flightsdb) {
      if (timePassed(flight.datetime)) {
        queue--;
        continue; //skip flight if it already departed
      }
      let hasSeats = await emptySeats(flight, () => queue--);
      if (hasSeats <= 0) continue; //skip flight if it has no empty seats
      var tempflight = {
        id: flight.id,
        destination: flight.destination,
        origin: flight.origin,
        datetime: flight.datetime,
        price: flight.price,
        plane: flight.plane,
        occupied: flight.occupied,
        type: flight.type,
        popularity: flight.popularity,
        emptyseats: hasSeats,
      };
      //Filter according to time range & time range:
      if (
        ((filter.startdatetime && flight.datetime >= filter.startdatetime) || !filter.startdatetime) &&
        ((filter.enddatetime && flight.datetime <= filter.enddatetime) || !filter.enddatetime) &&
        ((filter.minprice && flight.price >= filter.minprice) || !filter.minprice) &&
        ((filter.maxprice && flight.price <= filter.maxprice) || !filter.maxprice)
      )
        filteredflights.push(tempflight);
    }
    await waitUntil((_) => queue === 0); //wait for all async functions to finish
    if (!filteredflights || filteredflights.length === 0) return { successful: false, text: "No flights found." };
    return { successeful: true, flightsarr: filteredflights };
  }
  //Find and modify single flight in database:
  static async book(id, tickets) {
    try {
      let flight = await Flightdb.findOne({ _id: id });
      await Flightdb.updateOne({ _id: id }, { occupied: +flight.occupied + +tickets, popularity: +flight.popularity + +1 });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /*[ Handling data ]*/
  //Sort flights:
  static sortFiltered(flights, sortcondition) {
    try {
      //prettier-ignore
      switch (sortcondition) {
        case "priceinc":  //Price increase:
          return flights.sort(function (a, b) {
            if (a.price < b.price) return -1;
            if (a.price > b.price) return 1;
            return 0;
          });
        case "pricedec":  //Price decrease:
          return flights.sort(function (a, b) {
            if (a.price > b.price) return -1;
            if (a.price < b.price) return 1;
            return 0;
          });
        case "popular":  //Popularity:
          return flights.sort(function (a, b) {
            if (a.popularity > b.popularity) return -1;
            if (a.popularity < b.popularity) return 1;
            return 0;
          });
        case "country":  //Country (alphabetical):
          return flights.sort(function (a, b) {
            if (a.destination < b.destination) return -1;
            if (a.destination > b.destination) return 1;
            return 0;
          });
        default: return flights;
      }
    } catch (error) {
      return flights;
    }
  }
}

/*[ External access ]*/
module.exports = Flight;
