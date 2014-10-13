angular.module('mean.friends').controller('FriendsController', ['$scope', '$routeParams', '$location', 'Global', 'Socials', 'Articles', 'Friends', function ($scope, $routeParams, $location, Global, Socials, Articles, Friends) {
    $scope.global = Global;

    Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
       });

    $scope.menu = [{
        "title": "Wall",
        "link": "wall"
    }, {
        "title": "Calendar",
        "link": ""

    }, {
        "title": "Shows Pending",
        "link": "list"
    }, {
        "title": "Search Your Show",
        "link": "tvshows"
    }, {
        "title": "Friends",
        "link": "friends"
    }];   

    $scope.search = function (){
        return Friends.query({q_user: $scope.name}, function(data){

            for (var i = data.length - 1; i >= 0; i--) {
                data[i].myfriend = false;
                for (var j = $scope.social.friends.length - 1; j >= 0; j--) {
                    if ($scope.social.friends[j] == data[i]._id){
                        data[i].myfriend = true;        
                    }
                };
            };
            $scope.friends = data;
        });
    };

    $scope.addfriend = function(friend) {
        
        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {

            social.friends.push(friend._id);

            social.$update(function(){  
 
               $location.path('friends/');
            });
                    
        });

    };

    $scope.removefriend = function(friend) {
        
        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {
            var ind = 0
            for (var i = social.friends.length - 1; i >= 0; i--) {
                if (social.friends[i] == friend._id){ ind = i;}
            };

            social.friends.splice(ind,1);
            
            social.$update(function(){  
 
               $location.path('friends/');
            });
                    
        });

    };

    $scope.find = function (){
        Socials.get({userId: Global.user._id},function(social) {
            return Friends.query({q_friends: social.friends}, function(data){
                               
                for (var i = data.length - 1; i >= 0; i--) {
                    data[i].myfriend = true;
                };

                $scope.friends = data;
            });
       });


    };
}]);