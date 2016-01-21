function isPickUp(order) {
  if (order.advancedFulfillment.delivered) {
    return true;
  }
  return false;
}

Meteor.methods({
  'localDeliveries/addToMyRoute': function (orderIds, userId) {
    check(orderIds, [String]);
    check(userId, String);
    _.each(orderIds, function (orderId) {
      let coordinates = {};
      const order = Orders.findOne(orderId);
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
        let token; //Needs to be mapbox key
        let result = HTTP.get('https://api.mapbox.com/geocoding/v5/mapbox.places/200+queen+street.json?proximity=-66.1,45.3&access_token=' + token);
        console.log('we shouldnt be here');
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

      LocalDelivery.update({
        shopifyOrderNumber: order.shopifyOrderNumber
      }, {
        $set: {
          delivererId: userId,
          deliveryStatus: 'Assigned to Driver',
          deliveryDate: new Date(),
          pickUp: isPickUp(order),
          geoJson: geoJson,
          location: address
        }
      }, {
        upsert: true
      });
    });
  },
  'localDeliver/updateLocalDelivery': function (localOrder, userId) {
    check(localOrder, Object);
    check(userId, String);
    if (localOrder.pickUp) {
      LocalDelivery.update({
        _id: localOrder._id
      }, {
        $set: {
          'pickUp': true,
          'deliveryStatus': 'Picked Up',
          'geoJson.properties.marker-symbol': 'shop',
          'geoJson.properties.marker-color': '#E0AC4D'
        }
      });
    } else {
      LocalDelivery.update({
        _id: localOrder._id
      }, {
        $set: {
          'pickUp': true,
          'deliveryStatus': 'Delivered',
          'geoJson.properties.marker-symbol': 'shop',
          'geoJson.properties.marker-color': '#E0AC4D'
        }
      });
      Meteor.call('advancedFulfillment/localShippingIniated', localOrder.shopifyOrderNumber, userId);
    }
  }
});
