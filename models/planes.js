/*[ Import ]*/
const Planedb = require("../database/plane");

/*[ Handle planes database ]*/
class Plane {
  constructor(details) {
    this.id = details.id;
    this.seats = details.seats;
    this.name = details.name;
  }

  /*[ Modify database ]*/
  //Modify single plane in database:
  async modify() {
    try {
      await Planedb.updateOne({ _id: this.id }, { seats: this.seats });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /*[ Get from database ]*/
  //Fetch all planes:
  static async fetchAll() {
    let planesdb = await Planedb.find({});
    return planesdb;
  }
}

/*[ External access ]*/
module.exports = Plane;
