angular.module('mean.publicusers').controller('UserPublicController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.islink = function(){
        if (Global.user.twitter){
          return true;
        } else {
          return false;
        }
    };

}]);