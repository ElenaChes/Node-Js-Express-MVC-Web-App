/*[ Import ]*/
const express = require("express");
const visitorController = require("../controllers/visitor");

//[Initialize router]
const router = express.Router();

//[Route]
router.get("/", visitorController.getHome);
router.get("/login", visitorController.getLogin);
router.post("/login", visitorController.postLogin);
router.get("/logout", visitorController.getLogout);

/*[ External access ]*/
module.exports = router;
