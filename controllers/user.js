const bCrypt = require("bcrypt");
const User = require("../models").User;
const Location = require("../models").Location;
const checkPassword = require(".././helpers/passHelper");
const saltRounds = 10;

class UserController {
  async getAll(req, res, next) {
    let users = [];
    users = await User.find();
    if (users.length >= 0) {
      res.json(users);
    } else next(404);
  }

  async check(req, res, next) {
    const user = await User.find(e => {});
    const location = await Location.find(err => {
    });

    res.send({ users: user, locs: location });
  }

  async login(req, res, next) {
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) {
      next(404);
    } else {
      checkPassword(req.body.password, user.password, (e, result) => {
        if (result) return res.status(200).send({ login: true, user: user });

        res.sendStatus(401);
      });
    }
  }

  async update(req, res, next) {
    const user = await User.findOneAndUpdate(
      {
        email: req.body.email
      },
      req.body,
      (err, updated) => {
        if (err) console.log("could not update user", err);
        return;
      }
    );
    if (!user) {
      next(404);
    } else {
      console.log("user updated", user);
    }
  }

  async register(req, res, next) {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.sendStatus(400);
    const isExist = await User.findOne({ email: email });
    if (isExist) return res.sendStatus(418);

    const encrypted = await bCrypt.hash(password, saltRounds);
    const user = await new User({
      email: email,
      name: name,
      password: encrypted
    });
    console.log("user", user);
    user.save(err => {
      if (err) {
        return next(err);
      }
      res.send(true);
    });
  }

  async delete(req, res, next) {
    const changes = await User.findByIdAndDelete(
      req.params.id,
      (err, deleted) => {
        if (err) return next(err);
        res.send({ deleted, msg: "Deleted successfully!" });
      }
    );
  }
}

module.exports = new UserController();
