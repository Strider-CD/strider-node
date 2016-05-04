
app.controller('NodeController', ['$scope', function ($scope) {
  $scope.nodeVersions = ['0.10', '0.12', 'lts', 'stable', 'latest', 'whatever', 'custom'];
  $scope.ioVersions = ['stable', 'latest', 'whatever'];
  $scope.saving = false;

  $scope.$watch('config.fork', function (fork) {
    $scope.forkVersions = fork === 'Node.js' ? $scope.nodeVersions : $scope.ioVersions;
  });

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
}]);
