//TvShows service used for TvShows REST endpoint
angular.module('mean.list').factory("List", ['$resource', function($resource) {
    return $resource('list/', {
        }, {
        get : { method: 'JSONP', isArray: true}

    });
}]);