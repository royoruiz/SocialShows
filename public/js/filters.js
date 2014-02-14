angular.module('mean.tvshows').filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i] == id) {
        return input[i];
      }
    }
    return null;
  };
});

angular.module('mean.tvshows').filter('getByTitle', function() {
  return function(input, title) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i].title == title) {
        return input[i];
      }
    }
    return null;
  };
});

