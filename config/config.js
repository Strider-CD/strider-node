app.controller('NodeController', [
  '$scope',
  function ($scope) {
    $scope.nodeVersions = [
      '14',
      '12',
      '10',
      'lts',
      'stable',
      'latest',
      'whatever',
      'custom',
    ];
    $scope.saving = false;

    $scope.$watch('configs[branch.name].node.config', function (value) {
      $scope.config = value;
    });

    $scope.save = function () {
      $scope.saving = true;
      $scope.pluginConfig('node', $scope.config, function () {
        $scope.saving = false;
      });
    };

    $scope.removeGlobal = function (index) {
      $scope.config.globals.splice(index, 1);
      $scope.save();
    };

    $scope.addGlobal = function () {
      if (!$scope.config.globals) $scope.config.globals = [];
      $scope.config.globals.push($scope.new_package);
      $scope.new_package = '';
      $scope.save();
    };
  },
]);
