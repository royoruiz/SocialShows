//Twitter service used for twitter REST endpoint
angular.module('mean.twitter').factory("Twitter", ['$resource', function($resource) {
    return $resource('twitter/tweet', {status: '@opinion'}, { 
		update: {
			method: 'POST'
        }

    });
}]);
