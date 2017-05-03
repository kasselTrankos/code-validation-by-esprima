'use strict';
CNT.ngModule.factory('categorizationFulfillmentCPModel', ['T3_HTTPService', function(T3_HTTPService) {

	var URL_GETCUSTOMERPROBLEMREPORT = 'services/CPResolutionQuery/getCustomerProblemReport';
	var URL_GETFULFILLMENTCUSTOMERPROBLEMDATABYCP = 'services/CPQuery/getFulfillmentCustomerProblemDataByCP';

	var categorizationFulfillmentCPModel = {};

	categorizationFulfillmentCPModel.getCustomerProblemReport = function(GetCustomerProblemReport_IN) {
		var resultadoPeticion = T3_HTTPService.post(URL_GETCUSTOMERPROBLEMREPORT, GetCustomerProblemReport_IN, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		return resultadoPeticion;
	};

	categorizationFulfillmentCPModel.getFulfillmentCustomerProblemDataByCP = function(GetFulfillmentCustomerProblemDataByCP_IN) {
		var resultadoPeticion = T3_HTTPService.post(URL_GETFULFILLMENTCUSTOMERPROBLEMDATABYCP, GetFulfillmentCustomerProblemDataByCP_IN, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		return resultadoPeticion;
	};

	return categorizationFulfillmentCPModel;

}]);