Template.localDeliverySettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: 'reaction-local-delivery'
    });
  }
});


AutoForm.hooks({
  'local-delivery-update-form': {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add('Local Delivery settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add('Local Delivery settings update failed. ' + error, 'danger');
    }
  }
});
