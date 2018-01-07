export function initialize(/* appInstance */) {
  // appInstance.inject('route', 'foo', 'service:foo');

  // console.log(Ember.$);
  // console.log(Ember.$.cloudinary);

  Ember.$.cloudinary.config({ cloud_name: 'esm-test', secure: true});
}

export default {
  initialize
};
