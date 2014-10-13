//TvShows service used for TvShows REST endpoint
angular.module('mean.tvshows').factory("TvShows", ['$resource', function($resource) {
    return $resource('tvshows/:tvshowsId', {
        tvshowsId: '@_id'
    }, {
    	get: {
    		method: 'GET'
    	}, 
		update: {
			method: 'PUT'
        }
    });
}]);
