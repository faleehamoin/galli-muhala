Events = new Mongo.Collection('Events');

function getLocation() {
  // Get current latitude and longitudes
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
}

function showPosition(position) {
    // Global variables for use in Google Maps constructor
    gLati = position.coords.latitude;
    gLongi = position.coords.longitude;
}

if (Meteor.isClient) {

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Router.route("/", function(){
    this.render("home");
  });

  Router.route("/events/now", function(){
    this.render("ongoingEvents");
  });

  Template.addForm.created = function() {
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('events', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event){
        Session.set("lat", event.latLng.lat());
        Session.set("lng", event.latLng.lng());

        var marker = new google.maps.Marker({
          position: event.latLng,
          map: map.instance
        });
      });

    });
  };

  Router.route("/events/add", function(){
    this.render("addEvents", {data: {
      MapOptions: function() {
        getLocation();
        if (GoogleMaps.loaded()){
          return {
            center: new google.maps.LatLng(gLati, gLongi),
            zoom: 12
          }
        }
      }
    }});
  });

  Router.route("/leaderboards", function(){
    this.render("leaderboard");
  });

  Template.addForm.events({
    'submit form': function (e) {
      e.preventDefault();
      name = e.target.eventName.value;
      date = e.target.eventDate.value;
      time = e.target.eventTime.value;
      description = e.target.description.value;
      requirements = e.target.requirements.value;

      Events.insert({
        name: name,
        owner: Meteor.userId(),
        username: Meteor.user().username,
        date: date,
        dateCreated: new Date(),
        time: time,
        description: description,
        requirements: requirements,
        lat: Session.get("lat"),
        lng: Session.get("lng")
      });

      e.target.eventName.value = "";
      e.target.eventDate.value = "";
      e.target.eventTime.value = "";
      e.target.description.value = "";
      e.target.requirements.value = "";
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {

}
