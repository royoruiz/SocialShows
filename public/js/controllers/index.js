angular.module('mean.system').controller('IndexController', ['$scope', 'Global','TvShowsByDate','Socials', function ($scope, Global, TvShowsByDate, Socials) {
    $scope.global = Global;

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

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        firstDay: 1,
        buttonText: {
          prev: '',
          next: ''
        },
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        dayClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    //TvShowsByDate.get({month: m}, function(list){
    //    console.log(list);
    //  }
    //);


    /* event source that pulls from google.com */
    $scope.eventSource = {
        /*
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event', // an option!
            currentTimezone: 'America/Chicago' // an option!
        */
            
    };

    $scope.events = [
    ];

    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      //var millisecondOffset = 14 * 24 * 60 * 60 * 1000;
      var m = new Date(start).getMonth();
      //var aux = new Date();
      //aux.setTime(start.getTime() + millisecondOffset);
      
      var z = start.getMonth() + 1;
      if (z<10) {k = '0' + z;} else {k = z;}

      var z2 = end.getMonth() + 1;
      if (z2<10) {k2 = '0' + z2;} else {k2 = z2;}

      var d = start.getDate();
      if (d<10) {day = '0' + d;} else {day = d;}
      
      var d2 = end.getDate();
      if (d2<10) {day2 = '0' + d2;} else {day2 = d2;}      
      
      var aux_start = start.getFullYear() +'-'+ k + '-' + day;
      var aux_end = end.getFullYear() + '-' + k2 + '-' + day2;
      //console.log(aux_start);
      //console.log(aux_end);
      var events = TvShowsByDate.query({ini: aux_start, fin: aux_end}, function(list){
          //events_a = list;
          //console.log(list);
          //return list;
          //console.log(list);
          if ($scope.global.user){
            var social = Socials.get({userId: Global.user._id},function(social) {
              //console.log("1");
              //console.log(social.watched);
              //console.log(list);
              var list_aux=[];
              var remove = false;
              for (var l = list.length - 1; l >= 0; l--) {
                remove = false;
                for (var w = social.watched.length - 1; w >= 0; w--) {
                  if (social.watched[w].showid == list[l].dat1){
                    for (var e = social.watched[w].epnum.length - 1; e >= 0; e--) {
                      if (social.watched[w].epnum[e] == list[l].dat2){
                        remove = true;
                      }
                    }
                  }  
                }
                if (!remove){list_aux.push(list[l]);}
              }
              //console.log(list_aux);
              list = [];
              list = list_aux;
              callback(list);
            });
          }else{
            console.log("error");
          }
          //console.log("aqui");
          //console.log(list);
          //callback(list);
        }
      );
      //console.log(events_aux);
      //var events = [];
      //callback(events);
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];

}]);