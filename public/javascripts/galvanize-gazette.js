var app = angular.module('galvanizeGazette', ['ui.router']);

app.config(["$httpProvider", "$stateProvider", "$urlRouterProvider", "$locationProvider",
    function ($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: '../templates/home.html',
                controller: 'homeCtrl'
            })
            .state('story', {
                url: '/story/:id',
                templateUrl: '../templates/story.html',
                controller: 'storyCtrl'
            });

        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');
    }]);

app.controller('homeCtrl', ["$scope", "$http", function ($scope, $http) {

    // Fetch all the stories
    $http({
        method: "GET",
        url: '/api/v1/stories'
    }).then(function (response) {
        $scope.stories = response.data || [];
    });

    // Add Story Form hidden by default
    $scope.storyForm = false;

    // Initialize Story object on scope
    $scope.newStory = $scope.newStory || {};

    $scope.addStory = function () {
        $http({
            method: "POST",
            url: '/api/v1/stories',
            data: $scope.newStory
        }).then(function (response) {
            // Update stories in scope with new story
            $scope.stories.push(response.data);

            // Reset newStory object
            $scope.newStory = {};

            // Hide newStory form
            $scope.storyForm = false;
        });
    }
}]);

app.controller('storyCtrl', [
    "$scope",
    "$state",
    "$http",
    "$stateParams",
    function ($scope, $state, $http, $stateParams) {

        // Word-count algorithm
        $scope.countWords = function () {
            $scope.wordCount = $scope.opinions.reduce(function (counter, opinion) {
                console.log("Opinion:");
                console.log(opinion.opinion);

                opinion.opinion.toLowerCase().trim().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '').split(" ").forEach(function (word, index, arr) {
                    console.log(word);
                    if (
                        word == "the"||
                        word == "a"  ||
                        word == "i"  ||
                        word == "of" ||
                        word == "it" ||
                        word == "not"
                    ) {
                        return counter;
                    }
                    counter[word] == undefined ? counter[word] = 1 : counter[word] += 1;
                });
                return counter;
            }, {});
        };

        // Fetch the story from $stateParams & get resource from API
        $http({
            method: "GET",
            url: "/api/v1/stories/" + $stateParams.id,
        }).then( function (response) {
            console.log(response.data);
            $scope.story = response.data;

            // Fetch opinions for the story
            return $http({
                method: "GET",
                url: "/api/v1/opinions/" + response.data._id,
            });
        }).then(function (response) {
            console.log("Opinions from this artice: ");
            console.log(response.data);

            // Bind the opinions to scope
            $scope.opinions = response.data;

            // Perform the word-count algorithm
            $scope.countWords();
            console.log($scope.wordCount);
        });


        // Handles CREATE op for new opinions
        $scope.saveOpinion = function () {
            $http({
                method: "POST",
                url: "/api/v1/opinions",
                data: {
                    opinion: $scope.newOpinion,
                    story_id: $scope.story._id
                }
            }).then(function (response) {
                console.log("Opinion returned from API after insertion: ");
                console.log(response.data);

                // Push the opinion into scope.
                $scope.opinions.push(response.data);

                // Reset the opinion textarea
                $scope.newOpinion = "";

                // Run the word count again
                $scope.countWords();
            });
        }




}]);