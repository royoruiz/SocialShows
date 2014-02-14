//TvShows service used for TvShows REST endpoint
angular.module('mean.tvshowsbyname').factory("TvShowsByName", ['$resource', function($resource) {
    return $resource('tvshowsbyname/:tvshowsId', {
        tvshowsId: '@_id', q_name: '@q_name', q_network: '@q_network', q_sorted: '@q_sorted', q_dir: '@q_dir'
    }, {
        get : { method: 'JSONP', isArray: true}, 
		update: {
			method: 'PUT'
        }

    });
}]);