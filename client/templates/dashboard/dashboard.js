const timeTable = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'MMM DD, YYYY'
};

function isPickUp(order) {
  if (order.advancedFulfillment.delivered) {
    return true;
  }
  return false;
}

Template.dashboardLocalDelivery.onCreated(function () {
  Session.setDefault('deliveryOrders', []);
});


Template.dashboardLocalDelivery.helpers({
  orders: function () {
    return ReactionCore.Collections.Orders.find();
  },
  deliveryAddress: function (order) {
    const delivery = order.shipping[0].address;
    return delivery.address1
      + delivery.address2
      + '<br>'
      + delivery.city + ', '
      + delivery.region
      + delivery.postal;
  },
  deliveryType: function (order) {
    if (isPickUp(order)) {
      return '<span class="label label-warning">Pickup</span';
    }
    return '<span class="label label-info">Delivery</span';
  },
  whichDate: function (order) {
    if (isPickUp(order)) {
      return moment(order.endTime).calendar(null, timeTable);
    }
    return moment(order.startTime).calendar(null, timeTable);
  },
  isPickUp: function (order) {
    return isPickUp(order);
  },
  deliverySelected: function () {
    return Session.get('deliveryOrders').indexOf(this._id) !== -1;
  },
  deliveriesSelected: function () {
    return Session.get('deliveryOrders').length > 0;
  },
  numberOfOrders: function () {
    return Session.get('deliveryOrders').length;
  },
  deliveryStatus: function () {
    if (this.delivery) {
      return this.delivery.deliveryStatus;
    }
    return 'Ready for Delivery';
  },
  actionableDeliveryStatus: function () {
    return true;
    // let deliveryStatus = this.delivery.deliveryStatus;
    // let actionalbeStatus = ['Ready for Delivery', 'Delivered'];
    // return _.contains(actionalbeStatus, deliveryStatus);
  },
  inTransitLocalDelivery: function () {
    return Orders.find({
      'delivery.deliveryStatus': {
        $in: ['Assigned to Driver', 'Picked Up']
      }
    });
  },
  type: function () {
    if (this.delivery.pickUp) {
      return '<span class="label label-warning">Pickup</span';
    }
    return '<span class="label label-info">Delivery</span';
  },
  driverName: function (userId) {
    return Meteor.users.findOne(userId).username;
  }
});

Template.dashboardLocalDelivery.events({
  'click label .fa-check-square-o, click label .fa-square-o': function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const checked = $(event.currentTarget).parent().prev()[0].checked;
    $(event.currentTarget).parent().prev()[0].checked = !checked;
    const _id = $(event.currentTarget).parent().prev().data('id');
    let selectedOrders = Session.get('deliveryOrders');

    if (!checked) {
      selectedOrders.push(_id);
    } else {
      selectedOrders = _.without(selectedOrders, _id);
    }
    Session.set('deliveryOrders', selectedOrders);
  },
  'click .addDeliveriesToMyQueue': function (event) {
    event.preventDefault();
    const orderIds = Session.get('deliveryOrders');
    Meteor.call('localDelivery/addToMyRoute', orderIds, Meteor.userId());
    Session.set('deliveryOrders', []);
  }
});
