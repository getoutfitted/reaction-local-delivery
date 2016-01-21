Router.route('dashboard/local-delivery', {
  controller: ShopAdminController,
  path: '/dashboard/local-delivery',
  template: 'dashboardLocalDelivery',
  subscriptions: function () {
    this.subscribe('localDeliveryOrders');
    return this.subscribe('localOrders');
  }
});

Router.route('dashboard/my-route', {
  controller: ShopAdminController,
  template: 'myRoute',
  name: 'myRoute',
  subscriptions: function () {
    return this.subscribe('myLocalDeliveryOrders', Meteor.userId());
  }
});

