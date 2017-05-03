'use strict';
CNT.ngModule.factory('categorizationFulfillmentCPService', ['$q', 'categorizationFulfillmentCPModel',
	function($q, categorizationFulfillmentCPModel) {

		var categorizationFulfillmentCPService = {};

		categorizationFulfillmentCPService.initialData = null;

		var previousData = {
			'view': {},
			'functionality': {},
			'data': {}
		};

		categorizationFulfillmentCPService.getPreviousView = function() {
			return previousData.view;
		};

		categorizationFulfillmentCPService.getPreviousFunctionality = function() {
			return previousData.functionality;
		};

		categorizationFulfillmentCPService.getPreviousData = function() {
			return previousData.data;
		};

		categorizationFulfillmentCPService.setPreviousData = function(view, functionality, data) {
			previousData = {
				'view': view,
				'functionality': functionality,
				'data': data
			};
		};

        /*Este servicio consigue el detalle de la CO y COI que están ya relacionados con un problema de provisión o que se quieren relacionar con un problema nuevo. Dará servicio a las funcionalidades de apertura, modificación, consulta y análisis, por lo que tendrá varios modos de consulta que se indicarán con la variable action*/
		categorizationFulfillmentCPService.getFulfillmentCustomerProblemDataByCP = function(GetFulfillmentCustomerProblemDataByCP_IN) {
			var deferred = $q.defer();
			categorizationFulfillmentCPModel.getFulfillmentCustomerProblemDataByCP(GetFulfillmentCustomerProblemDataByCP_IN).success(function(data) {
				deferred.resolve(
					data);
			}).error(function(data, status) {
				deferred.reject(crearObjetoError(data,
					status));
			});
			return deferred.promise;
		};

        /* Permite obtener datos básicos de un Problema de Cliente que permiten construir el resumen de un problema:
            - número de problema y versión
            - Tipología de problema
            - fecha inicio, fecha objetivo y fecha fin
            - clase y procede / no procede
            - tipo de entrada
            - estado y situación (valor calculado)
            - posible origen del problema
            - Customer o FeedBackContact que tiene el problema
            - Fecha de cambio de situación a estado 5 Pendiente
            - Indicador de si existen documentos adjuntos al CustomerProblem*/

		categorizationFulfillmentCPService.getCustomerProblemReport = function(GetCustomerProblemReport_IN) {
			var deferred = $q.defer();
			categorizationFulfillmentCPModel.getCustomerProblemReport(GetCustomerProblemReport_IN).success(function(data) {
				deferred.resolve(data);
			}).error(function(data, status) {
				deferred.reject(crearObjetoError(data, status));
			});
			return deferred.promise;
		};

		function crearObjetoError(data, status) {
			var errorObj;
			if (status === 500) {
				if ((data.errorDescription !== undefined) && (data.errorDescription !== null)) {
					errorObj = {
						code: 500,
						mensaje1: data.errorDescription,
						mensaje2: data.errorId,
						mensaje3: data.context
					};
				} else {
					errorObj = {
						code: status
					};
				}
			} else {
				errorObj = {
					code: status
				};
			}
			return errorObj;
		}

		return categorizationFulfillmentCPService;
	}
]);