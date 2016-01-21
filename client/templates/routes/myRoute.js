Meteor.startup(function () {
  Mapbox.load();
});
Template.myRoute.onRendered(function () {
  Session.setDefault('mapCenter', [39.6286407, -106.0475974]);
  let info = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-local-delivery'
  });

  let myDeliveries = LocalDelivery.find({
    delivererId: Meteor.userId()
  }).fetch();
  let geoJson = _.map(myDeliveries, function (delivery) {
    return delivery.geoJson;
  });
  this.autorun(function () {
    if (Mapbox.loaded()) {
      L.mapbox.accessToken = info.settings.mapbox.key;
      let map = L.mapbox.map('map', info.settings.mapbox.id)
      .setView(Session.get('mapCenter'), 10)
      .featureLayer.setGeoJSON(geoJson);
    }
  });
});

Template.myRoute.helpers({
  myDeliveries: function () {
    const userId = Meteor.userId();
    return LocalDelivery.find({
      delivererId: userId
    });
  },
  isPickUp: function () {
    if (this.pickUp) {
      return 'Pick Up';
    }
    return 'Delivery';
  },
  deliverButtonColor: function () {
    if (this.pickUp) {
      return 'warning';
    }
    return 'info';
  }
});

Template.myRoute.events({
  'click .deliveryUpdate': function (event) {
    event.preventDefault();
    const localOrder = this;
    const userId = Meteor.userId();
    Meteor.call('localDeliver/updateLocalDelivery', localOrder, userId);
  }
});
