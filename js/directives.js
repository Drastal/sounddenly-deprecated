'use strict';

/* Directives */
angular.module('sounddenly.directives', [])

/**
 * Buttons radio
 **/
.directive('buttonsRadio', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=model',
            options: '=options'
        },
        controller: function($scope) {
            $scope.activate = function(idx) {
                $scope.model = $scope.options[idx];
            };
        },
        template: "<button type='button' class='btn btn-default' " +
            "ng-class='{active: option == model}'" +
            "ng-repeat='option in options' " +
            "ng-click='activate($index)'>{{option}} " +
            "</button>"
    };
});
