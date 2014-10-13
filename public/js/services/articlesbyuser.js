//Articles service used for articles REST endpoint
angular.module('mean.articles').factory("ArticlesByUser", ['$resource', function($resource) {
    return $resource('wall/:name', {
        name: '@name', id: '@id'
    }, {
    	get : { method: 'JSONP', isArray: true}, 
        update: {
            method: 'PUT'
        }
    });
}]);