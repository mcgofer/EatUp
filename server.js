var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })



mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost/24eventDB');
mongoose.connection.once('open', function() {
    console.log("DB connection established!!!");
}).on('error', function(error) {
    console.log('CONNECTION ERROR:', error);
});

//Require Var

var User = require('./modules/userModule');
var Event = require('./modules/eventModule');
var Place = require('./modules/placeModules');


var app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// get - getting all events
app.get('/events', function(req, res) {
    Event.find().populate('place').exec(function(err, events) {
        if (err) throw err;
        res.send(events)
    });
});


//post - create new event - user section
// app.post('/events/newEvent/newUser', function (req, res) {
//     if (req.body) {
//         console.log(req.body);
//         if (!(User.findOne({userName : req.body.userName}))){
//             var user = new User ({
//                 userName = req.body.userName,
//                 userRating = req.body.userRating,
//                 userBio = req.body.userBio,
//                 participatedEvents = []
//             });
//             user.save(function(err , user) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.send(user._id);
//             });
//         } else {
//         res.send(User._id);
//         }
//     } else{
//         res.send({status: "nok", message: "Nothing received."});
//     }
// });

//post - create new event - place section
// app.post('/events/newEvent/newPlace', function (req, res) {
//     if (req.body) {
//         console.log(req.body);
//
//         var place = new Place({
//             placeName: req.body.placeName,
//             address: req.body.address,
//             phone: req.body.phone,
//             picURL: req.body.picURL,
//             review: req.body.review
//         });
//
//         place.save(function(err , place){
//             if (err) {
//                 throw err;
//             }
//             console.log(place);
//             res.send(place);
//         });
//     } else{
//         res.send({status: "nok", message: "Nothing received."});
//     }
// });

//post - create new event - event section
app.post('/events/newEvent', function(req, res) {
    if (req.body) {
        var place = new Place({
            placeName: req.body.placeName,
            eventCity: req.body.eventCity,
            address: req.body.address,
            phone: req.body.phone,
            picURL: req.body.picURL,
            review: req.body.review
        });

        place.save(function(err, place) {
            if (err) throw err
            var event = new Event({
                userEmail: req.body.userEmail,
                place: place,
                eventDate: req.body.eventDate,
                // eventTime: req.body.eventTime,
                eventName: req.body.eventName,
                eventDesc: req.body.eventDesc,
                maxParticipants: req.body.maxParticipants,
                attendees: []
            });
            event.save(function(err, event) {
                if (err) throw err
                Event.findOne({ _id: event._id }).populate('place').exec(function(err, eventwithPlace) {
                    if (err) throw err
                    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXX ")
                    console.log(eventwithPlace)
                    res.json(eventwithPlace);
                });
            });
        });

    } else {
        res.send({ status: "nok", message: "Nothing received." });
    }


});
//get - get event from DB

//put - add participant to event
app.post('/events/:eventID/user/:userEmail', function(req, res) {
    var eventID = req.param.eventID;
    var userEmail = req.param.userEmail;
    Event.findByIdAndUpdate(eventID, { $push: { attendees: userEmail } }, { new: true }, function(err, specificEvent) {
        if (err) throw err;
        res.send(specificEvent);
    })
});

//404
app.use(function(err, req, res, next) {
    console.error(err.stack)
    throw ("error");
    res.status(404).sendFile(__dirname + '/public/404.html') //we need to create 404 page

})

//500
app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("500 Server Error");

})

//delete - remove event from DB

//------tamplate route 


// app.post('/createvent', (req, res) => {
//     var event = new Event({
//         eventCreator: ,
//         attendees: ,
//         eventDate: ,
//         maxParticipants: ,
//         eventPlace:
//     })
//     event.save(function(err, data) {
//         if (err) throw error;
//         else res.send(data);
//     });
// })



app.listen(process.env.PORT || '8080', function() {
    console.log('connection established on port 8080!');
});