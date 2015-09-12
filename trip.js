var Promise = require("bluebird");
var GCM = require('gcm').GCM;
var gcm = new GCM('AIzaSyDkRwEHLWxlGn_Qxz8Zizmn253fsW6KMEo');
ObjectId = require("mongodb").ObjectID,

  exports.create = function(db, email, token, trackeremail, lat, long, cb) {
    //authenticate the user email using google token

    //get the requested tracker regId in the db
    trackerInDB(db, trackeremail).then(function(regIdRes) {
      //insert Trip
      insertTrip(db, email, trackeremail, lat, long, 0).then(function(
        insertTripRes) {
        //send GCM notification
        var message = {
          registration_id: regIdRes, // required
          'message': 'Please follow the trip',
          'tripId': insertTripRes
        };
        console.log(message);
        gcm.send(message, function(err, messageId) {
          //sending push notification
        });
        cb(insertTripRes);
      });
    });

  }

exports.update = function(db, trip_id, lat, long, cb) {
  updateTrip(db, trip_id, lat, long).then(function(results) {
    cb(results);
  });
}

exports.locate = function(db, trip_id, cb) {
  getLocation(db, trip_id).then(function(results) {
    console.log("as" + results);
    cb(results);
  });
}

//get the DeviceId from DB
trackerInDB = function(db, trackeremail) {
  return new Promise(function(resolve, reject) {
    db.collection('users').findOne({
      'email': trackeremail
    }, function(err, item) {
      resolve(item.reg_id);
    });
  });
}

//insert the Trip
insertTrip = function(db, email, trackeremail, lat, long, sequence) {
  return new Promise(function(resolve, reject) {
    //create a trip in mongodb
    db.collection('trip').insert({
      "email": email,
      "tracker": trackeremail,
      "location": [{
        "lat": lat,
        "long": long,
        "time": new Date()
      }]
    }, function(err, docsInserted) {
      resolve(docsInserted.ops[0]._id.valueOf());
    });
  });
}


//update trip
updateTrip = function(db, trip_id, lat, long) {
  return new Promise(function(resolve, reject) {
    db.collection('trip').findOne({
      _id: trip_id
    }, {
      location: 1
    }, function(err, item) {
      var locArr = item.location;
      locArr.push({
        "lat": lat,
        "long": long,
        "time": new Date()
      });
      db.collection('trip').update({
        _id: trip_id
      }, {
        $set: {
          location: locArr
        }
      });
      resolve("Success");
    });
  });
}

//get the current location
getLocation = function(db, trip_id) {
  return new Promise(function(resolve, reject) {
    db.collection('trip').findOne({
      _id: trip_id
    }, {
      location: 1
    }, function(err, item) {
      console.log(err);
      var locArr = item.location;
      console.log("testing", locArr);
      resolve(locArr);
    });
  });
}
