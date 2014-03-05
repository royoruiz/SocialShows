angular.module('mean.tvshows').filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i] == id) {
        return input[i];
      }
    }
    return null;
  };
});

angular.module('mean.tvshows').filter('getByTitle', function() {
  return function(input, title) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i].title == title) {
        return input[i];
      }
    }
    return null;
  };
});

angular.module('mean.tvshows').filter('getByTitlePrev', function() {
  return function(input, title) {
    //console.log("a");
    var i=0, len=input.length;
    if (title == "previous"){
      //console.log("b");
      //console.log(input);
      return input[input.length-1];
    }
    //console.log("c");
    for (; i<len; i++) {
      //console.log("d");
      if (input[i].title == title) {
        //console.log("e");
        return input[i-1];
      }
    }
    //console.log("f");
    return null;
  };
});

angular.module('mean.tvshows').filter('getByTitleNext', function() {
  return function(input, title, call) {
    //console.log("a");
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i].title == title) {
        if (i+1<len){
          return input[i+1];
        }
      }
    }
    //console.log("b");
    if (call == 1){
      //console.log("c");
      return "_Next_Call";

    }else{
      return null;
    }
  };
});
