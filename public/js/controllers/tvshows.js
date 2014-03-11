angular.module('mean.tvshows').controller('TvShowsController', ['$scope', '$routeParams', '$location', 'Global', 'TvShows', '$filter', 'Socials', 'Articles', 'Twitter','TvShowsByName', '$modal',  function ($scope, $routeParams, $location, Global, TvShows, $filter, Socials, Articles, Twitter, TvShowsByName, $modal) {
    $scope.global = Global;

    Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
       });

    //$scope.totalPages = 0;
    $scope.customersCount = 0;
    $scope.maxsize = 50;

    $scope.dynamicTooltip = "I don't care about the others, I just want to see my own, motherfucker (this will be an icon, in the future)";

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
        //console.log($scope.justme);
        //if ($scope.filterCriteria.name.length<4) {$scope.filterCriteria.network = '';}
        //console.log($scope.filterCriteria.name);
        return TvShowsByName.query({q_name: $scope.filterCriteria.name, q_network: $scope.filterCriteria.network, q_sorted: $scope.filterCriteria.sortedBy, q_dir: $scope.filterCriteria.sortDir, q_just: $scope.justme}, function (data) {
            
            var x = Math.floor(data.length/$scope.maxsize);
            if (x >  0) { x = x + 1;}
            $scope.totalPages = x;
            $scope.customersCount = data.length;

            //console.log(data);
            //console.log($scope.filterCriteria.pageNumber);
            //console.log(x);
            //console.log(data.length);
            var j=0;
            var k=0;
            if ($scope.filterCriteria.pageNumber > 1){k=$scope.maxsize*$scope.filterCriteria.pageNumber - $scope.maxsize;}
            //console.log(k);
            var term=0;
            if (data.length - k > 50){ term = 50;} else {term=data.length - k;}

            $scope.tvshows = data.splice(k,term);
            var data_new={};
            for (var i = 0; i < $scope.tvshows.length; i++) {
                $scope.tvshows[i].aux=[];
                for (var j1 = 0; j1 < $scope.tvshows[i].Episodelist.length; j1++) {
                    for (var k1 = 0; k1 < $scope.tvshows[i].Episodelist[j1].episode.length; k1++) {
                        data_new={'title': $scope.tvshows[i].Episodelist[j1].no + 'x' + $scope.tvshows[i].Episodelist[j1].episode[k1].seasonnum + ' - ' + $scope.tvshows[i].Episodelist[j1].episode[k1].title, 'key': $scope.tvshows[i].Episodelist[j1].episode[k1].epnum};
                        $scope.tvshows[i].aux.push(data_new);
                        //console.log($scope.tvshows[i].Episodelist[j].no + $scope.tvshows[i].Episodelist[j].episode[k].title);
                    }
                }
                //console.log($scope.tvshows[i].aux);    
            }


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
        //console.log("1");
        if (!tvshow.updated) {
            //console.log("2");
            tvshow.updated = [];
        }

        //tvshow.updated.push(new Date().getTime());
        //console.log(tvshow);

        tvshow.$update(function() {
            //console.log("3");
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

    $scope.watchAll = function(show, social, clave, comp) {

        var crtl = false;
        var temp = [];
        var z=0;
        var ind = 0;
        //console.log("hola1");
        //console.log(comp);
        if (clave){
            for (var j2 = show.Episodelist.length - 1; j2 >= 0; j2--) {
                for (var k2 = show.Episodelist[j2].episode.length - 1; k2 >= 0; k2--) {
                    //console.log(clave);
                    //console.log(show.Episodelist[j2].episode[k2].epnum);
                    if (parseInt(clave)>=parseInt(show.Episodelist[j2].episode[k2].epnum)) {
                        //console.log("entro!");
                        temp[z] = show.Episodelist[j2].episode[k2].epnum;
                        z++;
                    }    
                }
            }  
            //console.log("in");
            //console.log(temp);          
        }else{
            if (comp){
                for (var j3 = show.Episodelist.length - 1; j3 >= 0; j3--) {
                    for (var k3 = show.Episodelist[j3].episode.length - 1; k3 >= 0; k3--) {
                        temp[z] = show.Episodelist[j3].episode[k3].epnum;
                        z++;
                    }
                }                
            }
            //console.log("out");
        }

        
        for (var i = social.watched.length - 1; i >= 0; i--) {
            if (social.watched[i].showid == show.showid) {
                crtl = true;
                ind = i;

            }
        }
        
        if (crtl){
            social.watched[ind].epnum = temp;
            if (comp){
                social.watched[ind].completed = true;
            }else{
                social.watched[ind].completed = false;
            }
            
        } else {
            if (comp){
                social.watched.push({showid: show.showid, epnum: temp, completed: true});
            }else{
                social.watched.push({showid: show.showid, epnum: temp, completed: false});
            }
            
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

  $scope.open = function (tvshow) {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: ModalInstanceCtrl,
      resolve: {
        tvshow: function () {
          return tvshow;
        }
      }
    });

    modalInstance.result.then(function (doc) {
      $scope.selected = doc.clv;
      //console.log("Mi carro" + doc.clv);
      //console.log("Mi carro1" + doc.indicador);
      //console.log(tvshow.name);
      //console.log($scope.social.watched);
      $scope.update(tvshow);
      $scope.watchAll(tvshow, $scope.social, doc.clv, doc.indicador);

    }, function () {
        //cuando cancela!!!
      console.log("selectedItem");
    });
  };      

}]);

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance, tvshow) {

  $scope.tvshow = tvshow;
  //console.log(tvshow);

  $scope.ok = function (key, indcomp) {
    $modalInstance.close({'clv': key, 'indicador': indcomp});
  };


  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};