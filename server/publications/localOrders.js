Meteor.publish('localOrders', function () {
  shopId = ReactionCore.getShopId();
  const permissions = [
    'admin',
    'owner',
    'dashboard/local-delivery',
    'reaction-local-delivery'
  ];
  if (Roles.userIsInRole(this.userId, permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      shopId: shopId,
      'advancedFulfillment.localDelivery': true,
      'advancedFulfillment.workflow.status': {
        $in: ['orderShipped', 'orderReadyToShip']
      }
    }, {
      fields: {
        'startTime': 1,
        'endTime': 1,
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.returnDate': 1,
        'advancedFulfillment.workflow.status': 1,
        'advancedFulfillment.items._id': 1,
        'advancedFulfillment.items.workflow': 1,
        'advancedFulfillment.arriveBy': 1,
        'advancedFulfillment.shipReturnBy': 1,
        'email': 1,
        'orderNotes': 1,
        'shopifyOrderNumber': 1,
        'shipping.address.phone': 1,
        'history': 1,
        'shipping.address.address1': 1,
        'shipping.address.address2': 1,
        'shipping.address.postal': 1,
        'shipping.address.region': 1,
        'shipping.address.city': 1,
        'shipping.address.fullName': 1,
        'billing.address.fullName': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.delivered': 1,
        'shopifyOrderId': 1,
        'delivery': 1
      }
    });
  }
  return this.ready();
});

// Meteor.publish('localDeliveryOrders', function () {
//   return ReactionCore.Collections.LocalDelivery.find();
// });

Meteor.publish('myLocalDeliveryOrders', function (userId) {
  check(userId, String);
  return ReactionCore.Collections.Orders.find({
    'delivery.delivererId': userId
  });
});

Meteor.publish('getoutfittedEmployees', function () {
  shopId = ReactionCore.getShopId();
  const permissions = [
    'admin',
    'owner',
    'dashboard/local-delivery',
    'reaction-local-delivery'
  ];
  if (Roles.userIsInRole(this.userId, permissions, ReactionCore.getShopId())) {
    // :TODO in the future limit users to users with access to this package
    return  Meteor.users.find({}, {
      fields: {
        username: 1
      }
    });
  }
})
