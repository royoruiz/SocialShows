angular.module('mean.tvshows').controller('TvShowsController', ['$scope', '$routeParams', '$location', 'Global', 'TvShows', '$filter', 'Socials', 'Articles', 'Twitter','TvShowsByName',  function ($scope, $routeParams, $location, Global, TvShows, $filter, Socials, Articles, Twitter, TvShowsByName) {
    $scope.global = Global;

    Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
       });

    //$scope.totalPages = 0;
    $scope.customersCount = 0;
    $scope.maxsize = 50;

    if (Global.user.twitter){ $scope.a_twitter=true;}

    $scope.headers = [
    {
        title: 'Order',
        value: 'order'
    },
    {
        title: 'Name',
        value: 'name'
    },    
    {
        title: 'Network',
        value: 'network'
    },
    {
        title: 'Populate',
        value: 'populate'
    },
    {
        title: 'Actions',
        value: 'actions'
    }];   

    //default criteria that will be sent to the server
    $scope.filterCriteria = {
        pageNumber: 1,
        sortDir: 'desc',
        sortedBy: 'populate'
    };

    //called when navigate to another page in the pagination
    $scope.selectPage = function (page) {
        $scope.filterCriteria.pageNumber = page;
        $scope.fetchResult();
    };

    //The function that is responsible of fetching the result from the server and setting the grid to the new result
    $scope.fetchResult = function () {
        //console.log('fetcj');
        //if ($scope.filterCriteria.name.length<4) {$scope.filterCriteria.network = '';}
        //console.log($scope.filterCriteria.name);
        return TvShowsByName.query({q_name: $scope.filterCriteria.name, q_network: $scope.filterCriteria.network, q_sorted: $scope.filterCriteria.sortedBy, q_dir: $scope.filterCriteria.sortDir}, function (data) {
            
            var x = Math.floor(data.length/$scope.maxsize);
            if (x >  0) { x = x + 1;}
            $scope.totalPages = x;
            $scope.customersCount = data.length;

            //console.log(data);
            console.log($scope.filterCriteria.pageNumber);
            console.log(x);
            console.log(data.length);
            var j=0;
            var k=0;
            if ($scope.filterCriteria.pageNumber > 1){k=$scope.maxsize*$scope.filterCriteria.pageNumber - $scope.maxsize;}
            console.log(k);
            var term=0;
            if (data.length - k > 50){ term = 50;} else {term=data.length - k;}

            $scope.tvshows = data.splice(k,term);  

        }, function () {
            //console.log('2');
            $scope.tvshows = [];
            $scope.totalPages = 0;
            $scope.customersCount = 0;
            })
        ;
    };

   //Will be called when filtering the grid, will reset the page number to one
    $scope.filterResult = function () {

        $scope.filterCriteria.pageNumber = 1;
        $scope.fetchResult({}, function () {
        //The request fires correctly but sometimes the ui doesn't update, that's a fix
            $scope.filterCriteria.pageNumber = 1;
        });
    };
 
    //call back function that we passed to our custom directive sortBy, will be called when clicking on any field to sort
    $scope.onSort = function (sortedBy, sortDir) {
        $scope.filterCriteria.sortDir = sortDir;
        $scope.filterCriteria.sortedBy = sortedBy;
        $scope.filterCriteria.pageNumber = 1;
        $scope.fetchResult({}, function () {
        //The request fires correctly but sometimes the ui doesn't update, that's a fix
            $scope.filterCriteria.pageNumber = 1;
        });
    };
 
    //manually select a page to trigger an ajax request to populate the grid on page load
    $scope.selectPage(1);
     

    $scope.find = function() {
        TvShows.query(function(tvshows) {
            $scope.tvshows = tvshows;
        });

        Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
        });        
    };


    $scope.update = function(tvshow) {
        //var tvshows = tvshow;
        console.log("1");
        if (!tvshow.updated) {
            console.log("2");
            tvshow.updated = [];
        }

        //tvshow.updated.push(new Date().getTime());
        console.log(tvshow);

        tvshow.$update(function() {
            console.log("3");
            $location.path('tvshows/');
        });
    };

    $scope.remove = function(tvshow) {
        tvshow.$remove();  

        $location.path('tvshows/');
    };

    $scope.isFollowing = function(tvshow) {
        var respons = $filter('getById')(tvshow.users, Global.user._id);
        return respons;

    };   

    $scope.isWatchAll = function(tvshow,social) {
        var respons = $scope.isFollowing(tvshow);
        if (respons){
            for (var i = social.watched.length - 1; i >= 0; i--) {
                if (social.watched[i].showid == tvshow.showid) {
                    if (social.watched[i].completed){
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }

    };   


    $scope.getEpisode = function() {

        TvShows.get({
            tvshowsId: $routeParams.tvshowsId
        }, function(tvshow) {
            $scope.showid = tvshow.showid;
            $scope.name = tvshow.name;
            $scope.idshow = tvshow._id;
            $scope.episode = $filter('getByTitle')(tvshow.Episodelist[$routeParams.season -1].episode, $routeParams.title);
            $scope.season = $routeParams.season;


        });
        
        Socials.get({
            userId: Global.user._id
        }, function(social) {
            $scope.social = social;

        });

 
    };

    $scope.findOne = function() {
        TvShows.get({
            tvshowsId: $routeParams.tvshowsId
        }, function(tvshow) {
            $scope.tvshow = tvshow;
        });
    };

    $scope.watch = function(showid_in, epnum_in, episode_in, season, opinion, name) {
        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {

                var crtl = false;
                for (var i = social.watched.length - 1; i >= 0; i--) {

                    if (social.watched[i].showid == showid_in){
                        social.watched[i].epnum.push(epnum_in);
                        crtl = true;
                    }
                }

                if (!crtl) {
                    social.watched.push({showid: showid_in, epnum: [epnum_in], completed: false});
                }
                //social.watched.push({showid: showid_in, epnum: epnum_in});
                //var tit = Global.user.username + ' check ' + season + 'x' + episode_in.seasonnum + ' - \"' + episode_in.title + '\" -';
                var tit = 'I\'ve  watched ' + name + ' - ' + season + 'x' + episode_in.seasonnum + ' - \"' + episode_in.title + '\" -';
                social.$update(function(){  
                    var article = new Articles({
                        title: tit,
                        content: opinion
                    });
                    article.$save(function(response) {
                        /*
                        var tweet = new Twitter({opinion: opinion});
                        tweet.$update(function(){
                            console.log('hola');
                            console.log(response);        
                        });
                        */
                        if (Global.user.twitter && $scope.a_twitter){
                            var tweet = new Twitter({opinion: tit + ' ' + opinion + ' http://www.mytvshows.com/#!articles/' + article._id});
                            tweet.$get();
                        } else {
                            console.log("We don't send a tweet because you don't want, remeber that...");
                        }    
                        $location.path('tvshows/'+$routeParams.tvshowsId+'/'+$routeParams.season+'/'+$routeParams.title+'/');
                    });
                    
                });

            });

    };

    $scope.watchAll = function(show, social) {

        var crtl = false;
        var temp = [];
        var z=0;
        var ind = 0;
        for (var j = show.Episodelist.length - 1; j >= 0; j--) {
            for (var k = show.Episodelist[j].episode.length - 1; k >= 0; k--) {
                temp[z] = show.Episodelist[j].episode[k].epnum;
                z++;
            }
        }
        
        for (var i = social.watched.length - 1; i >= 0; i--) {
            if (social.watched[i].showid == show.showid) {
                crtl = true;
                ind = i;

            }
        }
        
        if (crtl){
            social.watched[ind].epnum = temp;
            social.watched[ind].completed = true;
        } else {
            social.watched.push({showid: show.showid, epnum: temp, completed: true});
        }
        
        social.$update(function(){
            $location.path('tvshows/');
        });

    };    

    $scope.unwatch = function(showid_in, epnum_in) {
        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {

                for (var i = social.watched.length - 1; i >= 0; i--) {
                    if (social.watched[i].showid == showid_in){
                        var ind = 0;
                        for (var j = social.watched[i].epnum.length - 1; j >= 0; j--) {
                            if (social.watched[i].epnum[j] == epnum_in) {
                                ind = j;
                            }
                        }

                        social.watched[i].epnum.splice(ind, 1);
                    }

                }

                //var ind = social.watched[{showid: showid_in, epnum: epnum_in}];
                
                social.$update(function(){  

                    $location.path('tvshows/'+$routeParams.tvshowsId+'/'+$routeParams.season+'/'+$routeParams.title+'/');
                });

            });

    };

    $scope.unwatchAll = function(show, social) {

        var crtl = false;
        var ind = 0;

        for (var i = social.watched.length - 1; i >= 0; i--) {
            if (social.watched[i].showid == show.showid) {
                crtl = true;
                ind = i;
            }
        }        
        
        social.watched.splice(ind,1);
        
        social.$update(function(){
            $location.path('tvshows/');
        });

    };   

    $scope.isWatchTV = function(showid_in, epnum_in) {
        var responsw = false;
        for (var i = $scope.social.watched.length - 1; i >= 0; i--) {

            if ($scope.social.watched[i].showid == showid_in){
                for (var j = $scope.social.watched[i].epnum.length - 1; j >= 0; j--) {
                    if ($scope.social.watched[i].epnum[j] == epnum_in){
                        responsw = true;
                    }

                }
                
            }

        }
        return responsw;       

    };  

}]);