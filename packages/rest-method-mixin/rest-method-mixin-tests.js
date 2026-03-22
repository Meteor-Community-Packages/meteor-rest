new ValidatedMethod({
  name: 'validated-method',
  mixins: [RestMethodMixin],
  validate: null,
  run() {
    return 5;
  },
  restOptions: {
    url: '/validated-method-custom-url'
  }
});

if (Meteor.isClient) {
  Tinytest.addAsync('RestMethodMixin - restOptions', async function (test) {
    var response = await fetch('/validated-method-custom-url', {
      method: 'POST',
    });
    var data = await response.json();
    test.equal(response.status, 200);
    test.equal(data, 5);
  });
}
