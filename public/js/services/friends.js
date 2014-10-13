//TvShows service used for TvShows REST endpoint
angular.module('mean.friends').factory("Friends", ['$resource', function($resource) {
    return $resource('friends/:userId', {
        userId: '@_id', q_user: '@q_user', q_friends: '@q_friends'
    }, {
        get : { method: 'JSONP', isArray: true}, 
		update: {
			method: 'PUT'
        }

    });
}]);