/*[ Import ]*/
const Accountdb = require("../database/account");
const { book } = require("./flights");

/*[ Handle accounts database ]*/
class Account {
  constructor(details, payment) {
    this.id = details.id;
    this.username = details.username;
    this.password = details.password;
    this.IDnumber = payment ? payment.IDnumber : details.IDnumber;
    this.fullName = payment ? payment.fullName : details.fullName;
    this.cardNumber = payment ? payment.cardNumber : details.cardNumber;
  }

  /*[ Modify database ]*/
  //Modify single account in database:
  async modify() {
    try {
      await Accountdb.updateOne(
        { _id: this.id },
        { IDnumber: this.IDnumber, fullName: this.fullName, cardNumber: this.cardNumber }
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /*[ Handling data ]*/
  //Verify account (username&password) exists in database:
  async verify() {
    let account = await Accountdb.findOne({ username: this.username, password: this.password });
    if (account)
      return {
        successful: true,
        user: {
          id: account.id,
          username: this.username,
          permissions: account.permissions,
          IDnumber: account.IDnumber,
          fullName: account.fullName,
          cardNumber: account.cardNumber,
        },
      }; //succeseful login
    return { successful: false }; //couldn't login
  }
  //Process payment using account&flight details:
  static async processPayment(account, flight) {
    const { IDnumber, fullName, cardNumber } = account;
    //process card
    //if(!successeful) return false;

    let successful = await book(flight.id, flight.tickets);
    if (successful) {
      return true;
    }
    return false;
  }
}

/*[ External access ]*/
module.exports = Account;
