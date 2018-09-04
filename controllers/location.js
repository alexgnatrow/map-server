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
    const userLocations = await Location.find({
      user_id: reqLocations[0].user_id
    });
    let existed = userLocations.map(el => {
      return { lat: el["lat"], lng: el["lng"] };
    });
    console.log("is exist", existed);
    reqLocations.forEach(el => {
      if (existed.includes({ lat: el.lat, lng: el.lng })) return; //reject condition
      const location = new Location(el);
      location.save((err, loc) => {
        if (err) {
          console.log("cannot save location", err.message);
          return next(err);
        }
        console.log("saved ", loc);
        res.send(loc);
      });
    });
  }

  async getUserLocations(req, res, next) {
    const locations = await Location.find({ user_id: req.params.id });
    // console.log("user locations", locations);
    res.send({ locations });
  }

  async update(req, res, next) {
    const location = await Location.findById(req.params.id);
    location
      .update(payload)
      .then((result, model) => {
        res.json({
          message: "success",
          data: result
        });
      })
      .catch(err => {
        next(err);
      });
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
