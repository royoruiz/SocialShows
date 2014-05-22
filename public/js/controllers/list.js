angular.module('mean.list').controller('ListController', ['$scope', '$routeParams', '$location', 'Global', '$filter', 'Socials', 'List', 'Articles', 'Twitter', function ($scope, $routeParams, $location, Global, $filter, Socials, List, Articles, Twitter) {
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
    }, {
        "title": "Shows Pending",
        "link": "list"
/*
    }, {
        "title": "Articles",
        "link": "articles"
    }, {
        "title": "Create New Article",
        "link": "articles/create"
*/
    }];    

    //The function that is responsible of fetching the result from the server and setting the grid to the new result
    $scope.getList = function () {

        return List.query({}, function (shows) { 
            var show = {};
            var shows_temp = [];
            var sum = 0;
            for (var i = shows.length - 1; i >= 0; i--) {
                s_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].no;
                e_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].seasonnum;
                t_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].title;
                en_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].epnum;
                date_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].airdate;
                for (var j = shows[i].Episodelist.length - 1; j >= 0; j--) {

                    var k = shows[i].Episodelist[j].episode.length - 1;

                    var aux = false;

                    while (k>=0 && !aux){

                        aux = $scope.iswatched(shows[i].showid, shows[i].Episodelist[j].episode[k].epnum);

                        if (!aux && parseInt(shows[i].Episodelist[j].episode[k].epnum) < parseInt(en_prev)){

                            s_prev = shows[i].Episodelist[j].no;
                            e_prev = shows[i].Episodelist[j].episode[k].seasonnum;
                            t_prev = shows[i].Episodelist[j].episode[k].title;
                            en_prev = shows[i].Episodelist[j].episode[k].epnum;
                            date_prev = shows[i].Episodelist[j].episode[k].airdate;

                        }
                        k--;
                    }

                };
                show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false}    
                shows_temp.push(show);
                

            };

            var comp = {};
            for (var i = 0; i < shows_temp.length - 1; i++) {
                for (var j = 0; j < shows_temp.length - 1; j++){
                    if (shows_temp[j].airdate > shows_temp[j+1].airdate){
                        comp = shows_temp[j];
                        shows_temp[j] = shows_temp[j+1];
                        shows_temp[j+1] = comp;

                    }
                }
                
            };

            var shows_fill = []
            comp = {};
            for (var i = 0; i < shows_temp.length - 1; i++) {
                shows_fill.push(shows_temp[i]);
                //shows_fill.push(comp);
            };

            $scope.shows = shows_fill;


        }, function () {
            //You don't follow any show

            })
        ;
    };

    $scope.iswatched = function(showid_in, epnum_in) {
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

    $scope.showform = function(show){
        show.showbtn = false;
        return show.sf = true;
    }

    $scope.hover = function(show) {
        // Shows/hides the delete button on hover

      return show.showbtn = true;
    };

    $scope.leave = function(show) {
        // Shows/hides the delete button on hover
        show.sf = false;
      return show.showbtn = false;
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

                var tit = 'I\'ve  watched ' + name + ' - ' + season + 'x' + episode_in.seasonnum + ' - \"' + episode_in.title + '\"';
                social.$update(function(){  
                    var article = new Articles({
                        title: tit,
                        content: opinion
                    });
                    article.$save(function(response) {

                        if (Global.user.twitter && $scope.a_twitter){
                            var opi = "";
                            if (!opinion){ 
                                opi = "";
                            }else{
                                opi = '- ' + opinion;
                            }
                            var tweet = new Twitter({opinion: tit + ' ' + opi + ' http://www.showity.tv/#!articles/' + article._id});
                            tweet.$get();
                        } else {
                            console.log("We don't send a tweet because you don't want, remeber that...");
                        }    
                        $location.path('list/');
                    });
                    
                });

            });

    };
}]);
