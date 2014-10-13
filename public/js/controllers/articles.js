angular.module('mean.articles').controller('ArticlesController', ['$scope', '$routeParams', '$location', 'Global', 'Articles', 'ArticlesByUser', 'Socials' , function ($scope, $routeParams, $location, Global, Articles, ArticlesByUser, Socials) {
    $scope.global = Global;
    $scope.myfriend = false;

    Socials.get({userId: Global.user._id},function(social) {
            $scope.social = social;
       });

    if (typeof $routeParams.name != "undefined"){
        $scope.indsit = false;

    }else{
        $scope.indsit = true;

    };

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

    $scope.create = function() {
        var article = new Articles({
            title: this.title,
            content: this.content
        });
        article.$save(function(response) {
            $location.path("wall/" + response._id);
        });

        this.title = "";
        this.content = "";
    };

    $scope.add = function() {
        console.log($scope);

        //article_local = {'content': $scope.content, 'title': 'Mis cosas', 'user': Global.user}

        //$scope.articles.push(article_local);

        var article = new Articles({
            title: 'Mis cosas',
            content: $scope.content
        });

        article.$save(function(response) {
            $scope.articles.unshift(response);
            
        });

        $scope.content = "";

    };

    $scope.add_conver = function(art, rep) {
        //console.log(art);
        var article = new Articles({
            title: 'Mis cosas',
            content: rep,
            conversation : art.conversation
        });

        //console.log(article);

        article.$save(function(response) {
            $scope.articles.unshift(response);
            
        });

        return art.showreply = false;
    };

    $scope.addwall_conver = function(art, rep) {
        //console.log("routeParams" + );

        var article = new Articles({
            title: Global.user.name + ' published on ' + $routeParams.name + "'" +'s wall',
            content: rep,
            assign: $routeParams.id,
            conversation : art.conversation
        });

        article.$save(function(response) {
            $scope.articles.unshift(response);
        });

        $scope.content = "";

    };

    $scope.addwall = function() {
        //console.log("routeParams" + $routeParams.name);

        var article = new Articles({
            title: Global.user.name + ' published on ' + $routeParams.name + "'" + 's wall',
            content: $scope.content,
            assign: $routeParams.id
        });

        article.$save(function(response) {
            $scope.articles.unshift(response);
        });

        $scope.content = "";

    };


    $scope.remove = function(article) {
        article.$remove();  

        for (var i in $scope.articles) {
            if ($scope.articles[i] == article) {
                $scope.articles.splice(i, 1);
            }
        }
    };

    $scope.update = function() {
        var article = $scope.article;
        if (!article.updated) {
            article.updated = [];
        }
        article.updated.push(new Date().getTime());

        article.$update(function() {
            $location.path('wall/' + article._id);
        });
    };

    $scope.find = function() {
        
        if (typeof $routeParams.name != "undefined"){

            var mf = false;

            Socials.get({userId: Global.user._id},function(social) {

                for (var i = social.friends.length - 1; i >= 0; i--) {
                    if (social.friends[i] == $routeParams.id){
                        mf = true; 
  
                    }
                };
                $scope.myfriend = mf;
                $scope.social=social;
            
            });    
            
            ArticlesByUser.query({name: $routeParams.name, id: $routeParams.id}, function(articles) {
                //console.log("A");
                var c_ant = "";
                for (var i = 0; i < articles.length; i++) {
                    articles[i].showreply = false;
                    if (articles[i].conversation == c_ant) {
                        articles[i].related = true;
                        articles[i].class_margin = 'ov-margin';
                    }else{
                        articles[i].related = false;
                        c_ant = articles[i].conversation;
                        articles[i].class_margin = '';
                    }
                    articles[i].showreply = false;
                    if (articles[i].creator == articles[i].user){
                        articles[i].propio = true;
                    }else{
                        articles[i].propio = false;
                    }
                };
                //console.log(articles);
                $scope.articles = articles;
                $scope.show_info_user = true;
                $scope.username = $routeParams.name;
                //console.log($scope.articles[0]);

                //$scope.myfriend = $scope.isMyFriend($routeParams.id);

            });
        }else{
            Articles.query(function(articles) {
                //console.log("B");
                //console.log(articles.length);
                var c_ant = "";
                var aux = [];
                var user_init = "";
                
                for (var i = 0; i < articles.length; i++) {                
                    //console.log(articles[i]);
                    if (c_ant == ""){
                        if (articles[i].reply == true) {
                            aux.push(i);
                            
                        }else{
                            c_ant = articles[i].conversation;
                        }
                    }else{
                        if (articles[i].conversation == c_ant) {
                            
                        }else{
                            if (articles[i].reply == true) {
                                aux.push(i);
                                
                            }else{
                                c_ant = articles[i].conversation;
                            }

                        }
                        
                    }

                    //console.log(articles[i].user._id);
                    //console.log(Global.user._id);
                    //console.log(user_init);

                    //if ((articles[i].reply == true) && (articles[i].user._id != Global.user._id) && (user_init != Global.user._id) && (user_init != articles[i].user._id)){}

                }
                //console.log(aux);
                
                for (var i = aux.length - 1; i >= 0; i--) {
                    articles.splice(aux[i],1);
                };
                
                var c_ant = "";
                for (var i = 0; i < articles.length; i++) {
                    articles[i].showreply = false;

                    if (articles[i].conversation == c_ant) {
                        articles[i].related = true;
                        articles[i].class_margin = 'ov-margin';
                    }else{
                        articles[i].related = false;
                        c_ant = articles[i].conversation;
                        articles[i].class_margin = '';
                        user_init = articles[i].user._id;
                        
                    }
   
                    if (articles[i].creator == articles[i].user){
                        articles[i].propio = true;
                    }else{
                        articles[i].propio = false;
                    }
                    //articles[i].showreply = false;
                    //if (aux){ articles.splice(i, 1);console.log('fechoria');}
                };

                $scope.articles = articles;
                $scope.myfriend = false;
                //console.log($scope.articles[0]);
            });
        }

        
    };

    $scope.addfriend = function(id) {
        
        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {
                if (typeof id == "undefined"){
                    id = $routeParams.id;

                }
                social.friends.push(id);

                social.$update(function(){  
                       $location.path('friends/');
                    });
                    
                });

        };

    $scope.removefriend = function() {
        
        var social = Socials.get({
            userId: Global.user._id
        }, function(social) {
            if (typeof id == "undefined"){
                id = $routeParams.id;

            }
            var ind = 0
            for (var i = social.friends.length - 1; i >= 0; i--) {
                if (social.friends[i] == id){ ind = i;}
            };

            social.friends.splice(ind,1);
            
            social.$update(function(){  
 
               $location.path('friends/');
            });
                    
        });

    };

    $scope.showfrmreply = function(article){
        //console.log(article);
        article.class_hide = "ov-hide";
        return article.showreply = true;
    };

    $scope.findOne = function() {
        Articles.get({
            articleId: $routeParams.articleId
        }, function(article) {
            $scope.article = article;
        });
    };
}]);