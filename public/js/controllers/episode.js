angular.module('mean.tvshows').controller('Episode', ['$scope', '$routeParams', '$location', 'Global', 'TvShows', '$filter', 'Socials', 'Articles', 'Twitter', function ($scope, $routeParams, $location, Global, TvShows, $filter, Socials, Articles, Twitter) {
    $scope.global = Global;

    Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
       });

    if (Global.user.twitter){ $scope.a_twitter=true;}

    $scope.menu = [{
        "title": "Calendar",
        "link": ""

    }, {
        "title": "Search Your Show",
        "link": "tvshows"
/*    }, {
        "title": "Activity Deck",
        "link": "tvshows"
    }, {
        "title": "Articles",
        "link": "articles"
    }, {
        "title": "Create New Article",
        "link": "articles/create"
*/
    }];   

    $scope.getEpisode = function() {

        TvShows.get({
            tvshowsId: $routeParams.tvshowsId
        }, function(tvshow) {
            $scope.showid = tvshow.showid;
            $scope.name = tvshow.name;
            $scope.idshow = tvshow._id;
            $scope.status = tvshow.status;
            $scope.runtime = tvshow.runtime;
            $scope.total = tvshow.totalseasons;
            $scope.started = tvshow.started;
            $scope.ended = tvshow.ended;
            $scope.airtime = tvshow.airtime;
            $scope.airday = tvshow.airday;
            $scope.network = tvshow.network.text;
            $scope.episode = $filter('getByTitle')(tvshow.Episodelist[$routeParams.season -1].episode, $routeParams.title);
            //console.log("A");
            $scope.h = $scope.geth($scope.episode.screencap);       
            $scope.w = $scope.getw($scope.episode.screencap);
            $scope.h = 200;
            $scope.w = 300;

            $scope.showprev = false;
            $scope.shownext = false;
            if ($scope.episode.seasonnum == "01"){
                //console.log("B");
                if ($routeParams.season - 1 > 0){
                    //console.log("C");
                    $scope.episodeprev = $filter('getByTitlePrev')(tvshow.Episodelist[$routeParams.season -2].episode, "previous"); 
                    $scope.seasonprev = $routeParams.season -1;     
                }else{
                    $scope.showprev = true;
                }
            }else{
                //console.log("D");
                $scope.episodeprev = $filter('getByTitlePrev')(tvshow.Episodelist[$routeParams.season -1].episode, $routeParams.title);
                $scope.seasonprev = $routeParams.season;  
            }
            
            $scope.episodenext = $filter('getByTitleNext')(tvshow.Episodelist[$routeParams.season -1].episode, $routeParams.title, 1);
            //console.log("B");
            if ($scope.episodenext == "_Next_Call"){
                //console.log("C");
                if (typeof tvshow.Episodelist[$routeParams.season] === "undefined"){
                    //console.log("E");
                    $scope.shownext = true;                    
                }else{
                    //console.log("D");
                    //console.log(tvshow.Episodelist[$routeParams.season].episode);
                    //$scope.episodenext = $filter('getByTitleNext')(tvshow.Episodelist[$routeParams.season].episode, $routeParams.title, 2);  
                    $scope.episodenext = tvshow.Episodelist[$routeParams.season].episode[0];
                    $scope.seasonnext = parseInt($routeParams.season) + 1;
               }
                
            }else{
                $scope.seasonnext = $routeParams.season;
            }

            $scope.season = $routeParams.season;
            //console.log($scope.showprev);

        });
        
        Socials.get({
            userId: Global.user._id
        }, function(social) {
            $scope.social = social;

        });

 
    };

    $scope.geth = function(img) {
        var i = new Image();
        i.src = img;
        var h = i.height;
        return h;

    };

    $scope.getw = function(img) {
        var i = new Image();
        i.src = img;
        var w = i.width;
        return w;

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
                var tit = 'I\'ve  watched ' + name + ' - ' + season + 'x' + episode_in.seasonnum + ' - \"' + episode_in.title + '\"';
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
                            var opi = "";
                            if (!opinion){ 
                                opi = "";
                            }else{
                                opi = '- ' + opinion;
                            }
                            var tweet = new Twitter({opinion: tit + ' ' + opi + ' http://app.forillodelroyo.net/#!articles/' + article._id});
                            tweet.$get();
                        } else {
                            console.log("We don't send a tweet because you don't want, remeber that...");
                        }    
                        $location.path('tvshows/'+$routeParams.tvshowsId+'/'+$routeParams.season+'/'+$routeParams.title+'/');
                    });
                    
                });

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