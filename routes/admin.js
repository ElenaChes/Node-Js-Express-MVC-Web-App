/*[ Import ]*/
const express = require("express");
const adminController = require("../controllers/admin");

//[Initialize router]
const router = express.Router();

//[Route]
router.get("/", adminController.getHome);
router.get("/planes", adminController.getPlanes);
router.post("/updateplane", adminController.postPlaneUpdate);
router.get("/flights", adminController.getFlights);
router.post("/updateflight", adminController.postFlightUpdate);
router.post("/addflight", adminController.postFlightAdd);

/*[ External access ]*/
module.exports = router;
