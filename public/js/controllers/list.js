angular.module('mean.list').controller('ListController', ['$scope', '$routeParams', '$location', 'Global', '$filter', 'Socials', 'List', 'Articles', 'Twitter', 'TvShows', function ($scope, $routeParams, $location, Global, $filter, Socials, List, Articles, Twitter, TvShows) {
    $scope.global = Global;

    Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
       });

    if (Global.user.twitter){ $scope.a_twitter=true;}

    $scope.total = 0;

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

    //The function that is responsible of fetching the result from the server and setting the grid to the new result
    $scope.getList = function () {

        return List.query({}, function (shows) { 
            var show = {};
            var shows_temp = [];
            var shows_ended = [];
            var shows_returning = [];
            var sum = 0;
            var d = new Date();
            var d2 = new Date();
            var varclass = "";
            for (var i = shows.length - 1; i >= 0; i--) {
                s_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].no;
                e_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].seasonnum;
                t_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].title;
                en_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].epnum;
                date_prev = shows[i].Episodelist[shows[i].Episodelist.length - 1].episode[shows[i].Episodelist[shows[i].Episodelist.length - 1].episode.length - 1].airdate;
                sum = 0;
                for (var j = shows[i].Episodelist.length - 1; j >= 0; j--) {

                    var k = shows[i].Episodelist[j].episode.length - 1;
                    sum = sum + k + 1;
                    var aux = false;
                    var aux_skip =false;

                    for (var k = shows[i].Episodelist[j].episode.length - 1; k >= 0; k--) {
                    
                        aux = $scope.iswatched(shows[i].showid, shows[i].Episodelist[j].episode[k].epnum);
                        aux_skip = $scope.isskiped(shows[i].showid, shows[i].Episodelist[j].episode[k].epnum);
                        if (!aux_skip){

                            if (!aux && parseInt(shows[i].Episodelist[j].episode[k].epnum) < parseInt(en_prev)){
                            
                                s_prev = shows[i].Episodelist[j].no;
                                e_prev = shows[i].Episodelist[j].episode[k].seasonnum;
                                t_prev = shows[i].Episodelist[j].episode[k].title;
                                en_prev = shows[i].Episodelist[j].episode[k].epnum;
                                date_prev = shows[i].Episodelist[j].episode[k].airdate;

                            }
                        }

                    };

                };

                if ($scope.total == sum) {
                    switch(shows[i].status){
                        case "Ended":
                        case "Canceled":
                        case "Never Aired":
                        case "Pilot Rejected":
                        case "Canceled/Ended":
                            show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': '', 'epnum': en_prev , 'title': 'No more episodes left.', 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': false, 'class': 'show-list-ended'};
                            shows_ended.push(show);
                            break;
                        case "Returning Series":
                        case "On Hiatus":
                        case "Final Season":
                        case "TBD/On The Bubble":
                            show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': '', 'epnum': en_prev , 'title': 'No more episodes left.', 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': false, 'class': 'show-list-no-more'};
                            shows_returning.push(show);
                            break;         
                        default:
                            d2 = new Date(date_prev.substring(0, 4), parseInt(date_prev.substring(5, 7))-1, date_prev.substring(8, 10));
                            if (d2 > d){
                                varclass = 'show-list-future';                                

                            }else{
                                varclass = 'show-list-past';
                            }
                            show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': true , 'class': varclass};
                            shows_temp.push(show);
                            break;                        
                    }


                }else{
                    d2 = new Date(date_prev.substring(0, 4), parseInt(date_prev.substring(5, 7))-1, date_prev.substring(8, 10));
                    if (d2 > d){
                        varclass = 'show-list-future';

                    }else{
                        varclass = 'show-list-past';
                    }
                    show = {'id': shows[i]._id, 'showid': shows[i].showid, 'name': shows[i].name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': true, 'class': varclass}    
                    shows_temp.push(show);
                }

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

            for (var i = 0; i < shows_ended.length - 1; i++) {
                for (var j = 0; j < shows_ended.length - 1; j++){
                    if (shows_ended[j].airdate > shows_ended[j+1].airdate){
                        comp = shows_ended[j];
                        shows_ended[j] = shows_ended[j+1];
                        shows_ended[j+1] = comp;

                    }
                }
                
            };

            for (var i = 0; i < shows_returning.length - 1; i++) {
                for (var j = 0; j < shows_returning.length - 1; j++){
                    if (shows_returning[j].airdate > shows_returning[j+1].airdate){
                        comp = shows_returning[j];
                        shows_returning[j] = shows_returning[j+1];
                        shows_returning[j+1] = comp;

                    }
                }
                
            };

            for (var i = 0; i < shows_returning.length; i++) {
                shows_temp.push(shows_returning[i]);
            };

            for (var i = 0; i < shows_ended.length; i++) {
                shows_temp.push(shows_ended[i]);
            };

            $scope.shows = shows_temp;

        }, function () {
            //You don't follow any show

            })
        ;
    };

    $scope.iswatched = function(showid_in, epnum_in) {
        var responsw = false;
        for (var i = $scope.social.watched.length - 1; i >= 0; i--) {

            if ($scope.social.watched[i].showid == showid_in){
                $scope.total = $scope.social.watched[i].epnum.length;
                for (var j = $scope.social.watched[i].epnum.length - 1; j >= 0; j--) {
                    if ($scope.social.watched[i].epnum[j] == epnum_in){
                        responsw = true;
                    }

                }
                
            }

        }
        return responsw;       

    };

    $scope.isskiped = function(showid_in, epnum_in, array) {
        var responsw = false;
        var vector_skip = [];
        if (array instanceof Array){
            vector_skip = array;
        }else{
            vector_skip = $scope.social.skiped;
        }
        //console.log(vector_skip);
        for (var i = vector_skip.length - 1; i >= 0; i--) {

            if (vector_skip[i].showid == showid_in){
                $scope.total += vector_skip[i].epnum.length;
                for (var j = vector_skip[i].epnum.length - 1; j >= 0; j--) {
                    if (vector_skip[i].epnum[j] == epnum_in){
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

    $scope.skip = function(showid_in, epnum_in, episode_in, season, name){

        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {

                var crtl = false;
                for (var i = social.skiped.length - 1; i >= 0; i--) {

                    if (social.skiped[i].showid == showid_in){
                        social.skiped[i].epnum.push(epnum_in);
                        crtl = true;
                    }
                }

                if (!crtl) {
                    social.skiped.push({showid: showid_in, epnum: [epnum_in], completed: false});
                }
                
                social.$update(function(){  
                    var id_show = 0;
                    // eliminarlo de la lista
                    for (var i = $scope.shows.length - 1; i >= 0; i--) {
                        if ($scope.shows[i].showid == showid_in){
                            id_show = $scope.shows[i].id;
                            $scope.shows.splice(i,1);
                        }
                    };
                    // buscar el show
                    TvShows.get({
                        tvshowsId: id_show
                    }, function(tvshow) { 
                        var skip_aux = false;
                        var skip_aux_skip =false;
                        var show = {};
                        var shows_temp = [];
                        var shows_ended = [];
                        var shows_returning = [];
                        shows_temp = $scope.shows;
                        var sum = 0;
                        var d = new Date();
                        var d2 = new Date();
                        s_prev = tvshow.Episodelist[tvshow.Episodelist.length - 1].no;
                        e_prev = tvshow.Episodelist[tvshow.Episodelist.length - 1].episode[tvshow.Episodelist[tvshow.Episodelist.length - 1].episode.length - 1].seasonnum;
                        t_prev = tvshow.Episodelist[tvshow.Episodelist.length - 1].episode[tvshow.Episodelist[tvshow.Episodelist.length - 1].episode.length - 1].title;
                        en_prev = tvshow.Episodelist[tvshow.Episodelist.length - 1].episode[tvshow.Episodelist[tvshow.Episodelist.length - 1].episode.length - 1].epnum;
                        date_prev = tvshow.Episodelist[tvshow.Episodelist.length - 1].episode[tvshow.Episodelist[tvshow.Episodelist.length - 1].episode.length - 1].airdate;
                        sum = 0;

                        for (var i = tvshow.Episodelist.length - 1; i >= 0; i--) {
                            var k = tvshow.Episodelist[i].episode.length - 1;
                            sum = sum + k + 1;
                            for (var j = tvshow.Episodelist[i].episode.length - 1; j >= 0; j--) {
                    // revisar watched y skip
                                skip_aux = $scope.iswatched(tvshow.showid, tvshow.Episodelist[i].episode[j].epnum);
                                skip_aux_skip = $scope.isskiped(tvshow.showid, tvshow.Episodelist[i].episode[j].epnum, social.skiped);    
                                if (!skip_aux_skip){

                                    if (!skip_aux && parseInt(tvshow.Episodelist[i].episode[j].epnum) < parseInt(en_prev)){
                                    
                                        s_prev = tvshow.Episodelist[i].no;
                                        e_prev = tvshow.Episodelist[i].episode[j].seasonnum;
                                        t_prev = tvshow.Episodelist[i].episode[j].title;
                                        en_prev = tvshow.Episodelist[i].episode[j].epnum;
                                        date_prev = tvshow.Episodelist[i].episode[j].airdate;

                                    }
                                }
                            };
                        };
                    // añadirlo a la lista

                        if ($scope.total == sum) {
                            switch(tvshow.status){
                                case "Ended":
                                case "Canceled":
                                case "Never Aired":
                                case "Pilot Rejected":
                                case "Canceled/Ended":
                                    show = {'id': tvshow._id, 'showid': tvshow.showid, 'name': tvshow.name, 'epi': '', 'epnum': en_prev , 'title': 'No more episodes left.', 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': false, 'class': 'show-list-ended'};
                                    shows_ended.push(show);
                                    break;
                                case "Returning Series":
                                case "On Hiatus":
                                case "Final Season":
                                case "TBD/On The Bubble":
                                    show = {'id': tvshow._id, 'showid': tvshow.showid, 'name': tvshow.name, 'epi': '', 'epnum': en_prev , 'title': 'No more episodes left.', 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': false, 'class': 'show-list-no-more'};
                                    shows_returning.push(show);
                                    break;         
                                default:
                                    d2 = new Date(date_prev.substring(0, 4), parseInt(date_prev.substring(5, 7))-1, date_prev.substring(8, 10));
                                    if (d2 > d){
                                        varclass = 'show-list-future';                                

                                    }else{
                                        varclass = 'show-list-past';
                                    }
                                    show = {'id': tvshow._id, 'showid': tvshow.showid, 'name': tvshow.name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': true , 'class': varclass};
                                    shows_temp.push(show);
                                    break;                        
                            }


                        }else{
                            d2 = new Date(date_prev.substring(0, 4), parseInt(date_prev.substring(5, 7))-1, date_prev.substring(8, 10));
                            if (d2 > d){
                                varclass = 'show-list-future';

                            }else{
                                varclass = 'show-list-past';
                            }
                            show = {'id': tvshow._id, 'showid': tvshow.showid, 'name': tvshow.name, 'epi': s_prev+'x'+e_prev, 'epnum': en_prev , 'title': t_prev, 'season': s_prev, 'episode': e_prev, 'airdate': date_prev, 'showbtn': false, 'sf': false, 'lnk': true, 'class': varclass}    
                            shows_temp.push(show);
                        }
                    // ordenarla
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
                        for (var i = 0; i < shows_returning.length; i++) {
                            shows_temp.push(shows_returning[i]);
                        };

                        for (var i = 0; i < shows_ended.length; i++) {
                            shows_temp.push(shows_ended[i]);
                        };

                        $scope.shows = shows_temp;

                    });
                    
                    //$location.path('list/');
                    
                });

            });
     };

    $scope.watch = function(showid_in, epnum_in, episode_in, season, opinion, name, a_twitter) {
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
                
                var tit = 'I\'ve  watched ' + name + ' - ' + season + 'x' + episode_in.episode + ' - \"' + episode_in.title + '\"';
                social.$update(function(){  
                    var article = new Articles({
                        title: tit,
                        content: opinion,
                        show: true
                    });
                    article.$save(function(response) {

                        if (Global.user.twitter && a_twitter){
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
