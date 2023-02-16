/*[ Import ]*/
const Account = require("../models/accounts");
const { offloadFields } = require("../utils");

/*[Display landing page per user type]*/
exports.getHome = async (req, res, next) => {
  var sess = req.session;
  //Clear hidden forms:
  const message = sess.message;
  sess.message = { text: "", color: "" };
  offloadFields(["flights", "flight", "filter", "sort", "IDnumber", "fullName", "cardNumber", "saveCard"], sess, null);
  var page;
  //prettier-ignore
  switch (sess.permissions) {
    case "admin": page = "admin/home"; break;
    case "user": page = "user/home"; break;
    default: page = "visitor/home"; break;
  }
  //Load page:
  res.render(page, {
    pageTitle: "Home",
    path: "/",
    user: sess.user ? sess.user.username : null,
    message: message,
  });
};

/*[ Login ]*/
//Display page:
exports.getLogin = (req, res, next) => {
  const sess = req.session;
  res.render("visitor/login", {
    pageTitle: "Login",
    path: "/login",
    user: sess.user ? sess.user.username : null,
    message: sess.message,
  });
};
//Handle login:
exports.postLogin = async (req, res, next) => {
  const buttonPress = req.body.submit;
  if (buttonPress === "back") return this.getHome(req, res, next);
  const details = { username: req.body.username, password: req.body.password };
  const account = new Account(details);
  let { successful, user } = await account.verify();
  const sess = req.session;
  if (successful) {
    //Login:
    sess.message = { text: "", color: "" };
    sess.permissions = user.permissions;
    sess.user = user;
    return res.redirect("/");
  }
  //Couldn't login:
  sess.message = { text: "Wrong username or password!", color: "red" };
  res.redirect("/login");
};
//Handle logout:
exports.getLogout = (req, res, next) => {
  var sess = req.session;
  sess.message = { text: "", color: "" };
  sess.permissions = "";
  offloadFields(["user", "flights", "flight", "filter", "sort", "IDnumber", "fullName", "cardNumber", "saveCard"], sess, null);
  res.redirect("/");
};
