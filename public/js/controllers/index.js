angular.module('mean.system').controller('IndexController', ['$scope', 'Global','TvShowsByDate', function ($scope, Global, TvShowsByDate) {
    $scope.global = Global;

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'prev,next'
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
      
      var aux_start = start.getFullYear() +'-'+ k + '-' + start.getDate();
      var aux_end = end.getFullYear() + '-' + k2 + '-' + end.getDate();
      //console.log(aux_start);
      //console.log(aux_end);
      var events = TvShowsByDate.query({ini: aux_start, fin: aux_end}, function(list){
          //events_a = list;
          //console.log(list);
          //return list;
          //console.log(list);
          callback(list);
        }
      );
      //console.log(events_aux);
      //var events = [];
      //callback(events);
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];

}]);