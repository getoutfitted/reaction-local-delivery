localDeliveryController = ShopController.extend({
  onBeforeAction: function () {
    const advancedFulfillment = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-advanced-fulfillment'
    });
    if (!advancedFulfillment.enabled) {
      this.render('notFound');
    } else {
      if (!ReactionCore.hasPermission(['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'])) {
        this.render("layoutHeader", {
          to: "layoutHeader"
        });
        this.render("layoutFooter", {
          to: "layoutFooter"
        });
        this.render("unauthorized");
      } else {
        this.next();
      }
    }
  }
});

Router.route('dashboard/local-delivery', {
  controller: localDeliveryController,
  path: '/dashboard/local-delivery',
  template: 'dashboardLocalDelivery',
  subscriptions: function () {
    this.subscribe('getoutfittedEmployees');
    this.subscribe('localDeliveryOrders');
    return this.subscribe('localOrders');
  }
});

Router.route('dashboard/my-route', {
  controller: localDeliveryController,
  template: 'myRoute',
  name: 'myRoute',
  subscriptions: function () {
    return this.subscribe('myLocalDeliveryOrders', Meteor.userId());
  }
});

