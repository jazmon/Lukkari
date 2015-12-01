angular.module('lukkari.controllers')
// controller for today view
.controller('TodayCtrl', ['$scope', '$ionicLoading',
  'LocalStorage', '$ionicModal', 'MyDate', 'Lessons', 'ionicMaterialInk',
  'ionicMaterialMotion',
  function($scope, $ionicLoading, LocalStorage, $ionicModal, MyDate,
    Lessons, ionicMaterialInk, ionicMaterialMotion) {
    $scope.groupInfo = {};
    $scope.groupInfo.group = LocalStorage.get('groupName');
    $scope.currentDay = new Date();

    // Show new group modal when no group is set
    $ionicModal.fromTemplateUrl('templates/newgroup.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      if (!$scope.groupInfo.group) {
        // open modal to set group name
        $scope.modal.show();
      }
    });

    $scope.closeGroupName = function() {
      $scope.modal.hide();
    };

    function getAppointments() {
      $ionicLoading.show({
        template: loadingTemplate
      });

      Lessons.getDay({
        day: $scope.currentDay,
        callback: function(response) {
          $ionicLoading.hide();
          // Set Motion
          //ionicMaterialMotion.blinds();
          if (!response.success) {
            console.error('ERROR');
          } else {
            $scope.lessons = response.dayLessons;
          }
        }
      });
    }

    $scope.$on('ngLastRepeat.myList', function(e) {
      ionicMaterialMotion.blinds();
    });

    // sets the group
    $scope.setGroup = function() {
      LocalStorage.set('groupName', $scope.groupInfo.group);
      $scope.modal.hide();

      Lessons.changeGroup({
        groupName: $scope.groupInfo.group,
        callback: function(success) {
          if (success) {
            getAppointments();
          } else {
            console.error('failed to change group name');
          }
        }
      });
    };

    $scope.lessons = [];
    if ($scope.groupInfo.group !== undefined &&
      $scope.groupInfo.group !== null) {
      console.log($scope.groupInfo.group);
      console.log($scope.groupInfo);
      Lessons.changeGroup({
        groupName: $scope.groupInfo.group,
        callback: function(success) {
          if (success) {
            getAppointments();
          } else {
            console.error('failed to change group name');
          }
        }
      });
    }

    // Moves a day forwards/backwards
    $scope.moveDay = function(direction) {
      $scope.currentDay = MyDate.getDayFromDay({
        currentDay: $scope.currentDay,
        offsetDays: direction
      });

      getAppointments();
    };

    // Set Ink
    ionicMaterialInk.displayEffect();
  }
]);
