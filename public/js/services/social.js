//Social service used for Social REST endpoint
angular.module('mean.socials').factory("Socials", ['$resource', function($resource) {
    return  $resource('socials/:userId', {
        userId: '@_id'
    }, { 
		update: {
			method: 'PUT'
        }

    });
}]);
