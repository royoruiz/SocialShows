angular.module('mean.tvshows').directive('sortby', function () {
  return {
    templateUrl: 'views/tvshows/sortby.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      sortdir: '=',
      sortedby: '=',
      sortvalue: '@',
      onsort: '='
    },
    link: function (scope, element, attrs) {
      scope.sort = function () {
        if (scope.sortedby == scope.sortvalue)
          scope.sortdir = scope.sortdir == 'asc' ? 'desc' : 'asc';
        else {
          scope.sortedby = scope.sortvalue;
          scope.sortdir = 'asc';
        }
        scope.onsort(scope.sortedby, scope.sortdir);
      };
    }
  };
});

angular.module('mean.tvshows').directive('onBlurChange', function ($parse) {
  return function (scope, element, attr) {
    //var fn = $parse(attr['onBlurChange']);
    var fn = $parse(attr.onBlurChange);
    var hasChanged = false;
    element.on('change', function (event) {
      hasChanged = true;
    });
 
    element.on('blur', function (event) {
      if (hasChanged) {
        scope.$apply(function () {
          fn(scope, {$event: event});
        });
        hasChanged = false;
      }
    });
  };
});

angular.module('mean.tvshows').directive('onEnterBlur', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        element.blur();
        event.preventDefault();
      }
    });
  };
});