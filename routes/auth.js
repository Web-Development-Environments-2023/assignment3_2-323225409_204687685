var express = require("express");
const app = express();
const port = process.env.PORT || "3000";
app.use(express.json());
var router = express.Router();

const MySql = require("./utils/MySql");
const DButils = require("./utils/DButils");
const bcrypt = require("bcrypt");

router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      // userID: req.body.userID,
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      // profilePic: req.body.profilePic
    }
    let users = [];
    users = await DButils.execQuery("SELECT username from users");

    if (users.find((x) => x.username === user_details.username))
      throw { status: 409, message: "Username taken" };

    // add the new username
    // let hash_password = bcrypt.hashSync(
    //   user_details.password,
    //   parseInt(process.env.bcrypt_saltRounds)
    // );
    await DButils.execQuery(
      `INSERT INTO users (username,firstname,lastname,country,password,email) VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${user_details.password}', '${user_details.email}')`
    );
    // await DButils.execQuery( original
    //   `INSERT INTO users VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
    //   '${user_details.country}', '${user_details.password}', '${user_details.email}', '${user_details.profilePic}')`
    // );
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect1" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];

    // if (!bcrypt.compareSync(req.body.password, user.password)) {original
    if (!(req.body.password)) {
      throw { status: 401, message: "Username or Password incorrect2" };
    }

    // Set cookie
    req.session.user_id = user.user_id;


    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;