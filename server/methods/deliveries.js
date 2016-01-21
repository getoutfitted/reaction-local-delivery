function isPickUp(order) {
  if (order.advancedFulfillment.delivered) {
    return true;
  }
  return false;
}

Meteor.methods({
  'localDelivery/addToMyRoute': function (orderIds, userId) {
    check(orderIds, [String]);
    check(userId, String);
    _.each(orderIds, function (orderId) {
      let coordinates = {};
      const order = Orders.findOne(orderId);
      if (order.advancedFulfillment.workflow.status === 'orderReadyToShip') {
        Meteor.call(
          'advancedFulfillment/updateOrderWorkflow',
          order._id,
          userId,
          order.advancedFulfillment.workflow.status
        );
      }
      const shopifyOrder = ShopifyOrders.findOne({
        shopifyOrderNumber: order.shopifyOrderNumber
      });
      const orderAddress = order.shipping[0].address;
      const shopifyAddress = shopifyOrder.information.shipping_address;
      if (orderAddress.address1 === shopifyAddress.address1
        && orderAddress.address2 === shopifyAddress.address2
        && orderAddress.city === shopifyAddress.city
        && orderAddress.postal === shopifyAddress.zip
        && orderAddress.region === shopifyAddress.province_code) {
        coordinates.longitude = shopifyAddress.longitude;
        coordinates.latitude = shopifyAddress.latitude;
      } else {
        const settings = ReactionCore.Collections.Packages.findOne({
          name: 'reaction-local-delivery'
        }).settings;
        let token;
        if (settings) {
          token = settings.google.key;
        }
        let result = HTTP.get('https://maps.googleapis.com/maps/api/geocode/json?'
          + 'address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&'
          + 'key=' + token
        );
        // need to replace with actual coordinates
        coordinates.longitude = -77.03238901390978;
        coordinates.latitude = 38.913188059745586;
      }

      let address = orderAddress.address1 + ' '
        + orderAddress.address2 + ' '
        + orderAddress.city + ' '
        + orderAddress.region + ', '
        + orderAddress.postal;

      let color = '#7FBEDE';
      let symbol = 'clothing-store';
      if (isPickUp(order)) {
        color = '#E0AC4D';
        symbol = 'shop';
      }

      let geoJson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        },
        properties: {
          'title': '#' + order.shopifyOrderNumber,
          'marker-symbol': symbol,
          'description': address,
          'marker-color': color
        }
      };

      Orders.update({
        _id: order._id
      }, {
        $set: {
          'delivery.delivererId': userId,
          'delivery.deliveryStatus': 'Assigned to Driver',
          'delivery.deliveryDate': new Date(),
          'delivery.pickUp': isPickUp(order),
          'delivery.geoJson': geoJson,
          'delivery.location': address
        }
      });
    });
  },
  'localDelivery/updateLocalDelivery': function (order, userId) {
    check(order, Object);
    check(userId, String);
    if (order.delivery.pickUp) {
      Orders.update({
        _id: order._id
      }, {
        $set: {
          'delivery.pickUp': true,
          'delivery.deliveryStatus': 'Picked Up',
          'delivery.geoJson.properties.marker-symbol': 'shop',
          'delivery.geoJson.properties.marker-color': '#E0AC4D'
        }
      });
    } else {
      Orders.update({
        _id: order._id
      }, {
        $set: {
          'delivery.pickUp': true,
          'delivery.deliveryStatus': 'Delivered',
          'delivery.geoJson.properties.marker-symbol': 'shop',
          'delivery.geoJson.properties.marker-color': '#E0AC4D'
        }
      });
      Meteor.call('localDelivery/orderDelivered', order._id, userId);
    }
  },
  'localDelivery/orderDelivered': function (orderId, userId) {
    check(orderId, Number);
    check(userId, String);
    let history = {
      event: 'orderDelivered',
      userId: userId,
      updatedAt: new Date()
    };

    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.delivered': true
      },
      $addToSet: {
        history: history
      }
    });
  }
});
