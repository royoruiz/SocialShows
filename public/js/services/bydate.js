//TvShows service used for TvShows REST endpoint
angular.module('mean.tvshowsbydate').factory("TvShowsByDate", ['$resource', function($resource) {
    return $resource('tvshowsbydate', {
        ini: '@ini', fin: '@fin'
    }, {
        get : { method: 'JSONP', isArray: true}, 
		update: {
			method: 'PUT'
        }

    });
}]);
