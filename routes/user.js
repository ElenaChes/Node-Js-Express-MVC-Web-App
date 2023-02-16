/*[ Import ]*/
const express = require("express");
const userController = require("../controllers/user");

//[Initialize router]
const router = express.Router();

//[Route]
router.get("/", userController.getHome);
router.get("/flights", userController.getFlights);
router.post("/filterflights", userController.postFlightFilter);
router.post("/sortflights", userController.postFlightSort);
router.post("/flightbook", userController.postFlightBook);
router.get("/payment", userController.getPayment);
router.post("/paymentdetails", userController.postPayment);

/*[ External access ]*/
module.exports = router;
