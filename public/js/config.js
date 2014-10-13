window.app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        //$httpProvider.defaults.headers.common['X-Requested-With'] = undefined;
    }
]);

//Setting up route
window.app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/tvshows', {
            templateUrl: 'views/tvshows/list.html'
        }).
        when('/tvshows/:tvshowsId', {
            templateUrl: 'views/tvshows/view.html'
        }).
        when('/tvshows/:tvshowsId/:season/:title', {
            templateUrl: 'views/tvshows/episode.html'
        }).
        when('/wall', {
            templateUrl: 'views/articles/list.html'
        }).
        when('/wall/:name/:id', {
            templateUrl: 'views/articles/list.html'
        }).
        when('/wall/create', {
            templateUrl: 'views/articles/create.html'
        }).
        when('/wall/:articleId/edit', {
            templateUrl: 'views/articles/edit.html'
        }).
        when('/wall/:articleId', {
            templateUrl: 'views/articles/view.html'
        }).
        when('/list', {
            templateUrl: 'views/list/list.html'
        }).
        when('/mypanel/:userId', {
            templateUrl: 'views/users/mypanel.html'
        }).
        when('/friends', {
            templateUrl: 'views/users/friends.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);