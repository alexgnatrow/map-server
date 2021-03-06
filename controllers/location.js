const Location = require("../models").Location;

class LocationController {
  async getAll(req, res, next) {
    let locations = [];
    locations = await Location.find();

    if (locations.length >= 0) {
      res.json(locations);
    } else next(404);
  }

  async saveNewLocations(req, res, next) {
    if (!req.body.locations) return next(400);
    const reqLocations = req.body.locations;
    const saved = []; //logs
    const userLocations = await Location.find({
      user_id: reqLocations[0].user_id
    });
    let existed = userLocations.map(el => {
      return { lat: el["lat"], lng: el["lng"] };
    });
    const promises = reqLocations.map(
      el =>
        new Promise((resolve, reject) => {
          // console.log("--->", { lat: el.lat, lng: el.lng });
          const inDB =
            el._id ||
            existed.some(ex => ex.lat === el.lat && ex.lng === el.lng);
          if (inDB) return resolve(); //go to next element
          const location = new Location(el);
          location.save((err, loc) => {
            if (err) {
              console.log("cannot save location", err.message);
              return reject(next(err));
            }
            resolve(saved.push(loc));
          });
        })
    );
    Promise.all(promises).then(e => {
      console.log("saved", saved); //logs
      res.send(saved);
    });
  }

  async getUserLocations(req, res, next) {
    const locations = await Location.find({ user_id: req.params.id });
    // console.log("user locations", locations);
    res.send({ locations });
  }

  async update(req, res, next) {
    if (!req.body) return next();
    const update = req.body;
    const location = await Location.findOneAndUpdate(
      {
        lat: update.lat,
        lng: update.lng,
        user_id: update.user_id
      },
      update,
      e => console.log("update error", e)
    );
    // console.log("location", location, "req data", req.body);
    res.send(location);
  }

  async delete(req, res, next) {
    console.log("req.params", req.params);
    await Location.findByIdAndDelete(
      {
        _id: req.params.id
      },
      (err, deleted) => {
        console.log("deleted", deleted);
        if (err) return next(400);
        res.send(deleted);
      }
    );
  }
}

module.exports = new LocationController();
