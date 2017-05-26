'use strict';

CNT.ngModule.controller('categorizationFulfillmentCPController', [
    '$scope', '$q', '$log', 'PopupService', 'gettextCatalog', 'categorizationFulfillmentCPService',
    'T3_CommunicationService', 'T3_CabeceraPresentacionService', '$state', 'T3_TrazaService',
    '$stateParams', 'T3_StateService', '$parse', '$filter', 'categorizationFulfillmentCPConstant',
    function($scope, $q, $log, PopupService, gettextCatalog, categorizationFulfillmentCPService,
        T3_CommunicationService, T3_CabeceraPresentacionService, $state, T3_TrazaService,
        $stateParams, T3_StateService, $parse, $filter, categorizationFulfillmentCPConstant) {

        $scope.init = function() {

            /*Objeto que guarda los datos utilizados por el usuario*/
            $scope.categorizationFulfillmentCPView = categorizationFulfillmentCPService.getPreviousView();

            /*objeto que contiene los datos necesarios para el correcto funcionalmiento del cgt*/
            $scope.categorizationFulfillmentCPFunctionality = categorizationFulfillmentCPService.getPreviousFunctionality();

            /*objeto en el que guardamos los datos traidos del back*/
            $scope.categorizationFulfillmentCPData = categorizationFulfillmentCPService.getPreviousData();

            $scope.loadMultilanguage();
            /* Subscribe a la función de Multiidioma*/
            T3_CommunicationService.subscribe($scope, "AlertLanguageChanged", $scope.loadMultilanguage);
            T3_CommunicationService.subscribe($scope, "AlertLanguageChanged", $scope.loadMultilanguageNew);
            T3_StateService.init($scope, categorizationFulfillmentCPService, {
                CGT_CategorizationFulfillmentCP_IN: $scope.cgtCategorizationFulfillmentCPIn || $stateParams.cgtCategorizationFulfillmentCPIn
            });

            //Cagamos datos iniciales
            $scope.getSubscribes();
            $scope.cargarDatosInicio();

            // Llamada al CGT-ShowPartyRoleHeader
            $scope.cgtShowPartyRoleHeader();
        };

        /*función que carga el multidioma*/
        $scope.loadMultilanguage = function() {
            T3_CabeceraPresentacionService.resolveTranslationsCG('categorizationFulfillmentCP', gettextCatalog.currentLanguage).then(function() {
                $scope.iniciamosWizard();
            });
        };

        /*Metodo donde iniciamos las variables para el wizard*/
        $scope.iniciamosWizard = function() {
            T3_CommunicationService.subscribe($scope, "AlertLanguageChanged", $scope.loadMultilanguageNew);
            T3_CommunicationService.subscribe($scope, "EGT_ShowCustomerOrderHistoryOH", $scope.loadMultilanguageNew);
            T3_CommunicationService.subscribe($scope, "EGT_ShowCustomerOrderHistoryOH", $scope.loadMultilanguageNew);
            $scope.categorizationFulfillmentCPFunctionality.pasos = [{
                "name": gettextCatalog.getString('categorizationFulfillmentCP-wizard-paso1'),
                "desc": gettextCatalog.getString('categorizationFulfillmentCP-wizard-descripcion1')
            }, {
                "name": gettextCatalog.getString('categorizationFulfillmentCP-wizard-paso2'),
                "desc": gettextCatalog.getString('categorizationFulfillmentCP-wizard-descripcion2')
            }];

            $scope.categorizationFulfillmentCPFunctionality.paso = 1;
        };

        /*Metodo donde instanciamos todos los susbcribes del cgt*/
        $scope.getSubscribes = function() {
            // PASO 7.1
            T3_CommunicationService.subscribe($scope, 'EGT_ShowCustomerOrderHistoryOH', function(event, data) {

                if (data.length > 0) {
                    $scope.categorizationFulfillmentCPView.disabledContinuar = false;
                } else {
                    $scope.categorizationFulfillmentCPView.disabledContinuar = true;
                }

                $scope.EGT_ShowCustomerOrderHistory_OUT = data;
            });
        };

        /*Metodo en el que instanciamos todos los datos inciales*/
        $scope.cargarDatosInicio = function() {
            $scope.categorizationFulfillmentCPFunctionality.APERTURA = categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.OPEN;
            $scope.categorizationFulfillmentCPFunctionality.REAPERTURA = categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.REOPEN;
            $scope.categorizationFulfillmentCPFunctionality.MODIFY = categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.MODIFICATION;
            $scope.categorizationFulfillmentCPFunctionality.cPTaskType = $scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id;

            // CASO: Apertura
            if ($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.OPEN) {
                // PASO 1.1
                $scope.cgtShowCustomerOrderHistory();
            }

            //CASO: Reapertura
            else if($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.REOPEN) {
                if(!$scope.checkCustomerOrder($scope.CGT_CategorizationFulfillmentCP_IN)) {
                    $scope.getFulfillmentCustomerProblemDataByCP();
                }
                else {
                    $scope.cgtShowCustomerOrderHistory();
                }
            }

            // CASO: Modificación
            else if ($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.MODIFICATION) {
                // Comprobar 'CustomerOrder' NO informado
                if (!$scope.checkCustomerOrder($scope.CGT_CategorizationFulfillmentCP_IN)) {
                    // PASO: 2.1 y 2.4
                    $scope.getFulfillmentCustomerProblemDataByCP();
                }
                else {
                    $scope.cgtShowCustomerOrderHistory();
                }

                // PASO 2.2 y 2.3
                $scope.getCustomerProblemReport();
            }

            //El botón continuar de inicio aparecerá deshabilitado
            $scope.categorizationFulfillmentCPView.disabledContinuar = true;

            $scope.categorizationFulfillmentCPFunctionality.datosPrevios = {};
            $scope.categorizationFulfillmentCPFunctionality.datosPrevios.data = {};
            $scope.categorizationFulfillmentCPFunctionality.datosPrevios.data.customerProblemTaskType = {};
            $scope.categorizationFulfillmentCPFunctionality.datosPrevios.data.customerProblemTaskType.id = {};


            $scope.categorizationFulfillmentCPFunctionality.searchResult = false;
            $scope.categorizationFulfillmentCPData.problemasGenerados = [];
            $scope.categorizationFulfillmentCPData.motivocp = [];
        };

        // Comprobar todos los datos de 'CustomerOrder' informados
        $scope.checkCustomerOrder = function(data) {
            var customerOrderOK = false;
            if(data.customerOrders && data.customerOrders.length > 0) {
                angular.forEach(data.customerOrders, function(item) {
                    // Comprobación de 'customerOrderItem'
                    if (item.customerOrderItems) {
                        var customerOrderItems = $filter('filter')(item.customerOrderItems, {
                            id: null
                        });

                        if (customerOrderItems.length === 0) {
                            customerOrderOK = true;
                        }
                    }
                });
            }

            return customerOrderOK;
        };

        // Cargar datos para 'CGT-ShowPartyRoleHeader'
        $scope.cgtShowPartyRoleHeader = function() {

            var customer = $scope.getCustomer();
            var representative = $scope.getRepresentative();

            $scope.cgtShowPartyRoleHeaderIn = {
                customer: {
                    id: customer.id
                }
            };

            // Comprobar 'representative' informado
            if (representative) {
                $scope.cgtShowPartyRoleHeaderIn.representative = {
                    id: representative.id
                };
            }
        };

        // Cargar datos para 'CGT-ShowCustomerOrderHistory'
        $scope.cgtShowCustomerOrderHistory = function(customerOrders) {
            var ordersAndItems = null;
            $scope.cgtShowCustomerOrderHistoryOHIn = {
                edition: true
            };

            // CASO: Apertura o reapertura
            if ($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.OPEN) {
                // Comprobación de 'customerOrder[0]' informado
                if ($scope.CGT_CategorizationFulfillmentCP_IN.customerOrders &&
                    ($scope.CGT_CategorizationFulfillmentCP_IN.customerOrders.length > 0) &&
                    $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders[0]) {
                    $scope.cgtShowCustomerOrderHistoryOHIn.customerOrder = {
                        id: $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders[0].id
                    };
                }

                if($scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems &&
                    $scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems.length > 0) {
                    $scope.cgtShowCustomerOrderHistoryOHIn.customerOrderWithProblem = $scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems;
                }
            }
            // CASO: Reapertura
            else if($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.REOPEN) {
                // Comprobamos si viene 'customerOrder[0]' informado con sus customerOrderItem
                if(!$scope.checkCustomerOrder($scope.CGT_CategorizationFulfillmentCP_IN)) {
                    if($scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP &&
                        $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders &&
                        $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders.length > 0) {

                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrder = {
                            id: $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[0].id
                        }
                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrderWithProblem = $scope.getCustomerOrdersAndChildItems($scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders);
                    }
                }
                else {
                    // Comprobación de 'customerOrder[0]' informado
                    if ($scope.CGT_CategorizationFulfillmentCP_IN.customerOrders &&
                        ($scope.CGT_CategorizationFulfillmentCP_IN.customerOrders.length > 0) &&
                        $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders[0]) {
                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrder = {
                            id: $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders[0].id
                        };
                    }

                    if($scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems &&
                        $scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems.length > 0) {
                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrderWithProblem = $scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems;
                    }
                }
            }
            // CASO: Modificacion
            else if($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.MODIFICATION) {
                // Comprobamos si viene 'customerOrder[0]' informado con sus customerOrderItem
                if(!$scope.checkCustomerOrder($scope.CGT_CategorizationFulfillmentCP_IN)) {
                    if($scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP &&
                        $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders &&
                        $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders.length > 0) {

                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrder = {
                            id: $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[0].id
                        }
                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrderWithProblem = $scope.getCustomerOrdersAndChildItems($scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders);
                    }
                }
                else {
                    // Comprobación de 'customerOrder[0]' informado
                    if ($scope.CGT_CategorizationFulfillmentCP_IN.customerOrders &&
                        ($scope.CGT_CategorizationFulfillmentCP_IN.customerOrders.length > 0) &&
                        $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders[0]) {
                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrder = {
                            id: $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders[0].id
                        };
                    }

                    if($scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems &&
                        $scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems.length > 0) {
                        $scope.cgtShowCustomerOrderHistoryOHIn.customerOrderWithProblem = $scope.CGT_CategorizationFulfillmentCP_IN.customerOrderWithProblems;
                    }
                }
            }
        };

        $scope.getCustomerOrdersAndChildItems = function(customerOrderList) {
            var customerOrdersAndItems = [];

            angular.forEach(customerOrderList, function(cO) {
                var order = {
                    id: cO.id
                };

                // Comprobar si viene informado 'customerOrderItem'
                if (cO.customerOrderItems && (cO.customerOrderItems.length > 0)) {
                    angular.forEach(cO.customerOrderItems, function(cOIFather) {
                        if(cOIFather.customerOrderItems && (cOIFather.customerOrderItems.length > 0)) {
                            order.customerOrderItem = [];
                            angular.forEach(cOIFather.customerOrderItems, function(cOIChild){
                                var item = {
                                    id: cOIChild.id
                                };

                                order.customerOrderItem.push(item);
                            });
                        }
                    });

                    customerOrdersAndItems.push(order);
                }
            });

            return customerOrdersAndItems;
        };

        // Método que obtiene el valor de 'customer' del array de 'partyRoles' de la entrada al CGT
        $scope.getCustomer = function() {
            var customer = $filter('filter')($scope.CGT_CategorizationFulfillmentCP_IN.partyRoles, function(item) {
                return item['@c'] === categorizationFulfillmentCPConstant.PARTYROLESTYPES.CUSTOMER;
            })[0];

            return customer;
        };

        // Método que obtiene el valor de 'representative' del array de 'partyRoles' de la entrada al CGT
        $scope.getRepresentative = function() {
            var representative = $filter('filter')($scope.CGT_CategorizationFulfillmentCP_IN.partyRoles, function(item) {
                return item['@c'] === categorizationFulfillmentCPConstant.PARTYROLESTYPES.REPRESENTATIVE;
            })[0];

            return representative;
        };

        $scope.pestanias = function(valor) {
            $scope.categorizationFulfillmentCPFunctionality.pestaniaActual = valor;

            switch (valor) {
                // PASO 5
                case 2:
                    // Buscar tipo 'Customer'
                    var customer = $scope.getCustomer();

                    $scope.cgtListCPByPartyRoleAndCPTypeIn = {
                        customer: {
                            id: customer.id
                        },
                        customerProblemType: {
                            id: $scope.CGT_CategorizationFulfillmentCP_IN.customerProblemType.id
                        }
                    };
                    break;
            }
        };

        $scope.continuar = function() {
            var EGT_CategorizationFulfillmentCPOK = {
                customerOrders: []
            };

            // PASO 7.2: Si CGT_CategorizationFulfillmentCP_IN.CustomerProblemTaskType_DTO_IN.id == 5
            // and CG_categorizationFulfillmentCustomerProblem_IN.CustomerOrder_DTO_IN[] == vacío o null ( es decir no tiene elementos)
            if(($scope.CGT_CategorizationFulfillmentCP_IN.customerProblemTaskType.id === categorizationFulfillmentCPConstant.CUSTOMERPROBLEMTASKTYPE_CODE.MODIFICATION) &&
                (!$scope.CGT_CategorizationFulfillmentCP_IN.customerOrders || $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders === null || $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders === void(0)) || $scope.CGT_CategorizationFulfillmentCP_IN.customerOrders.length === 0) {
                if ($scope.EGT_ShowCustomerOrderHistory_OUT) {
                    angular.forEach($scope.EGT_ShowCustomerOrderHistory_OUT, function(customerOrder) {
                        var order = {
                            id: customerOrder.id,
                            code: customerOrder.code,
                            customerOrderItem: []
                        };
                        angular.forEach(customerOrder.customerOrderItem, function(cOI) {
                            var foundCOI = $scope.getExistsItem(cOI.id);

                            if (foundCOI !== null) {
                                cOI.cpmotiveAbstract = foundCOI.cpmotiveAbstract;
                            }

                            order.customerOrderItem.push(cOI);
                        });

                        EGT_CategorizationFulfillmentCPOK.customerOrders.push(order);
                    });
                }
            }
            else {
                if ($scope.EGT_ShowCustomerOrderHistory_OUT) {
                    angular.forEach($scope.EGT_ShowCustomerOrderHistory_OUT, function(customerOrder) {
                        var order = {
                            id: customerOrder.id,
                            code: customerOrder.code,
                            customerOrderItem: []
                        };
                        angular.forEach(customerOrder.customerOrderItem, function(cOI) {
                            var item = {
                                id: cOI.id
                            };

                            var abstractInfo = $scope.getCPMotiveAbstractInfo(customerOrder.id);

                            // Comprobación de motivos asociados
                            if (abstractInfo != null) {
                                item.cpmotive = abstractInfo.cpmotive;
                                item.cpsubmotive = abstractInfo.cpsubmotive;
                            }

                            order.customerOrderItem.push(item);
                        });

                        EGT_CategorizationFulfillmentCPOK.customerOrders.push(order);
                    });
                }
            }

            T3_CommunicationService.publish('EGT_CategorizationFulfillmentCPOK', EGT_CategorizationFulfillmentCPOK);
        };

        // Obtener la información CPMotiveAbstract
        $scope.getCPMotiveAbstractInfo = function(itemID) {
            var abstractInfo = null;
            var cgInfo_IN = $scope.CGT_CategorizationFulfillmentCP_IN;

            angular.forEach(cgInfo_IN.customerOrder, function(customerOrder) {
                var coItem = $filter('filter')(customerOrder.customerOrderItems, {
                    id: itemID
                });

                if (coItem && coItem.length > 0) {
                    abstractInfo = {
                        cPMotive: {
                            id: coItem[0].cpMotive.id,
                            description: coItem[0].cPMotive.description
                        },
                        cPSubmotive: {
                            id: coItem[0].cPSubmotive.id,
                            description: coItem[0].cPSubmotive.description
                        }
                    }
                }
            });

            return abstractInfo;
        };

        // Obtener motivos y submotivos del item que cumple que en la salida de OP_getFulfillmentCustomerProblemDataByCP_OUT se cumple que:
        // itemID existe en OP_getFulfillmentCustomerProblemDataByCP_OUT.CustomerOrder_DTO_OUT[].CustomerOrderItem_DTO_OUT_1[].CustomerOrderItem_DTO_OUT[].id
        // Y ademas tiene motivos y submotivos:
        // OP_getFulfillmentCustomerProblemDataByCP_OUT.CustomerOrder_DTO_OUT[].CustomerOrderItem_DTO_OUT_1[].CustomerOrderItem_DTO_OUT[].COIDisputed_DTO_OUT[].CPMotivo_DTO_OUT[] <> vacio o null
        $scope.getExistsItem = function(itemID) {
            var fulFillmentCPDataByCP_OUT = $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders;
            var motiveItem = null;

            // Recorrer OP_getFulfillmentCustomerProblemDataByCP_OUT.CustomerOrder_DTO_OUT[]
            for (var i = 0;
                (i < fulFillmentCPDataByCP_OUT.length) && (motiveItem === null); i++) {
                var items_1 = fulFillmentCPDataByCP_OUT[i].customerOrderItems;

                // Recorrer OP_getFulfillmentCustomerProblemDataByCP_OUT.CustomerOrder_DTO_OUT[].CustomerOrderItem_DTO_OUT_1[]
                for (var j = 0;
                    (j < items_1.length) && (motiveItem === null); j++) {
                    var items_OUT = items_1[j].customerOrderItems;

                    // Buscar item en OP_getFulfillmentCustomerProblemDataByCP_OUT.CustomerOrder_DTO_OUT[].CustomerOrderItem_DTO_OUT_1[].CustomerOrderItem_DTO_OUT[]
                    var existingItem = $filter('filter')(items_OUT, {
                        id: itemID
                    });

                    // Comprobar si tienen motivos y submotivos
                    if (existingItem.length > 0) {
                        angular.forEach(existingItem[0].coidisputeds, function(coiDisputed) {
                            if (coiDisputed.cpmotiveAbstract) {
                                motiveItem = coiDisputed;
                            }
                        });
                    }
                }
            }

            return motiveItem;
        };

        $scope.goToReportProblem = function() {
            var datos = $scope.categorizationFulfillmentCPData.getCustomerProblemReport;
            var cgtShowDetailOfCPReportIn = {
                customerProblem: {
                    id: datos.customerProblem.id
                },
                prevState: $state.current
            };

            // Comprobar si existe 'representative'
            if (datos.representative) {
                cgtShowDetailOfCPReportIn.representative = {
                    id: datos.representative.id
                };
            }

            $state.go(
                'showDetailOfCPReport', {
                    cgtShowDetailOfCPReportIn: cgtShowDetailOfCPReportIn
                }
            );
        };

        $scope.cancelar = function() {
            var cgtName = "CGT_CategorizationFulfillmentCP";

            T3_CommunicationService.publish('EGT_PrclReturnEmptyKO', cgtName);
        };

        // Función auxiliar que indica si un valor es vacío
        var isEmpty = function(value, ref) {
            if (typeof value === "string" && value.length > 0 && ref !== null && ref !== undefined) {
                var name,
                    posDelim,
                    indexArry,
                    arrNames = value.split('.');
                name = arrNames.shift();
                while (name) {
                    indexArry = null;
                    posDelim = name.search(/\[([\s\S]*)\]/);
                    if (posDelim > 0) {
                        indexArry = name.substring(posDelim + 1, name.indexOf(']'));
                        name = name.substring(0, posDelim);
                    }
                    if (ref === undefined || ref === null || !ref.hasOwnProperty(name)) {
                        return true;
                    }
                    if (indexArry) {
                        if (ref[name][indexArry] === undefined) {
                            return true;
                        } else {
                            ref = ref[name][indexArry];
                        }
                    } else {
                        ref = ref[name];
                    }
                    name = arrNames.shift();
                }
                value = ref;
            }
            return value === null || value === undefined || value === "";
        };

        // Método para componer el identificador del problema en el titulo
        $scope.buildProblemIdHeader = function() {
            var idProblema = "";

            if (!isEmpty("categorizationFulfillmentCPData.getCustomerProblemReport", $scope)) {
                idProblema += $scope.categorizationFulfillmentCPData.getCustomerProblemReport.customerProblem.code;
                if (!isEmpty("categorizationFulfillmentCPData.getCustomerProblemReport.customerProblem.reopenedCPNumber", $scope)) {
                    idProblema += ' / ';
                    idProblema += String($scope.categorizationFulfillmentCPData.getCustomerProblemReport.customerProblem.reopenedCPNumber);
                }
            }

            $scope.categorizationFulfillmentCPView.idProblema = idProblema;
        };

        // Metodo que lanza una modal con los errores del servicio
        $scope.openPopError = function() {
            var options = {
                size: "sm",
                tipoModal: "error",
                tituloModal: gettextCatalog.getString('PRCL-M-000100-Titulo'),
                textoPrincipal: gettextCatalog.getString('PRCL-M-000100-Principal'),
                textoSecundario: gettextCatalog.getString('PRCL-M-000100-Secundario'),
                textoPregunta: "",
                textoBtnAceptar: gettextCatalog.getString('categorizationFulfillmentCP-aceptar'),
                accionBtnAceptar: "",
                textoBtnCancelar: "",
                accionBtnCancelar: ""
            };

            PopupService.getPopupGeneric($scope, null, options);
        };

        /**************** Llamadas servicios ********************/
        /* Este servicio consigue el detalle de la CO y COI que están ya relacionados con un problema de provisión o que se quieren relacionar con un problema nuevo. Dará servicio a las funcionalidades de apertura, modificación, consulta y análisis, por lo que tendrá varios modos de consulta que se indicarán con la variable action */
        $scope.getFulfillmentCustomerProblemDataByCP = function() {

            var GetFulfillmentCustomerProblemDataByCP_IN = {
                action: "Q",
                customerProblem: {
                    id: $scope.CGT_CategorizationFulfillmentCP_IN.customerProblem.id
                }
            };

            PopupService.getSpinner($scope);

            categorizationFulfillmentCPService.getFulfillmentCustomerProblemDataByCP(GetFulfillmentCustomerProblemDataByCP_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.categorizationFulfillmentCPData.getFulfillmentCustomerProblemDataByCP = data;

                    $scope.cgtShowCustomerOrderHistory();
                },
                function(error) {
                    PopupService.CloseSpinner();
                    T3_TrazaService.setTrazaError(CNT.name, "Se ha detectado un error " + error.code + " en la llamada al servicio getFulfillmentCustomerProblemDataByCP.");
                    var auxError = {};
                    if ((error.code === 500) && (error.mensaje1 !== undefined) && (error.mensaje1 !== null)) {
                        auxError.mensaje1 = error.mensaje1;
                        auxError.mensaje2 = error.mensaje2;
                        auxError.mensaje3 = error.mensaje3;
                    }
                    $scope.openPopError();
                });
        };

        /*
         Permite obtener datos básicos de un Problema de Cliente que permiten construir el resumen de un problema:
        - número de problema y versión
        - Tipología de problema
        - fecha inicio, fecha objetivo y fecha fin
        - clase y procede / no procede
        - tipo de entrada
        - estado y situación (valor calculado)
        - posible origen del problema
        - Customer o FeedBackContact que tiene el problema
        - Fecha de cambio de situación a estado 5 Pendiente
        - Indicador de si existen documentos adjuntos al CustomerProblem */
        $scope.getCustomerProblemReport = function() {
            var GetCustomerProblemReport_IN = {
                customerProblem: {
                    id: $scope.CGT_CategorizationFulfillmentCP_IN.customerProblem.id
                }
            };

            PopupService.getSpinner($scope);

            categorizationFulfillmentCPService.getCustomerProblemReport(GetCustomerProblemReport_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.categorizationFulfillmentCPData.getCustomerProblemReport = data;

                    $scope.buildProblemIdHeader();

                    // PASO 2.3
                    /*$scope.cgtShowMinimalCPDataIn = {
                        customerProblem: {
                            id: $scope.CGT_CategorizationFulfillmentCP_IN.customerProblem.id,
                            code: data.customerProblem.code,
                            reopenedCPNumber: data.customerProblem.reopenedCPNumber,
                            numberIterations: data.customerProblem.numberIterations,
                            targetDate: data.customerProblem.targetDate,
                            proceed: data.customerProblem.proceed,
                            interactionDate: data.customerProblem.interactionDate,
                            interactionDateComplete: data.customerProblem.interactionDateComplete,
                            pressureANS: data.customerProblem.pressureANS,
                            severity: data.customerProblem.severity,
                            customerProblemPhase: {
                                id: data.customerProblem.customerProblemPhase.id,
                                name: data.customerProblem.customerProblemPhase.name
                            },
                            cPSituation: {
                                id: data.customerProblem.cpsituation.id,
                                name: data.customerProblem.cpsituation.name
                            },
                            customerProblemType: {
                                id: data.customerProblem.customerProblemType.id,
                                name: data.customerProblem.customerProblemType.name
                            },
                            customerProblemClass: {
                                id: data.customerProblem.customerProblemClass.id,
                                name: data.customerProblem.customerProblemClass.name
                            },
                            customerProblemTask: {
                                creationDate: $parse('customerProblem.customerProblemTask.creationDate')(data)
                            }
                        }
                    };*/

                    $scope.cgtShowMinimalCPDataIn = {
                        customerProblem: {
                            id: $scope.CGT_CategorizationFulfillmentCP_IN.customerProblem.id,
                            code: data.customerProblem.code,
                            reopenedCPNumber: data.customerProblem.reopenedCPNumber,
                            targetDate: data.customerProblem.targetDate,
                            interactionDate: data.customerProblem.interactionDate,
                            pressureANS: data.customerProblem.pressureANS,
                            customerProblemPhase: {
                                id: data.customerProblem.customerProblemPhase.id,
                                name: data.customerProblem.customerProblemPhase.name
                            },
                            customerProblemType: {
                                id: data.customerProblem.customerProblemType.id,
                                name: data.customerProblem.customerProblemType.name
                            },
                            customerProblemTask: {
                                creationDate: $parse('customerProblem.customerProblemTask.creationDate')(data)
                            }
                        }
                    };

                    if(data.customerProblem.numberIterations){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.numberIterations = data.customerProblem.numberIterations;
                    }
                    if (data.customerProblem.proceed){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.proceed = data.customerProblem.proceed;
                    }
                    if( data.customerProblem.interactionDateComplete){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.interactionDateComplete = data.customerProblem.interactionDateComplete;
                    }
                    if(data.customerProblem.severity){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.severity = data.customerProblem.severity;
                    }
                    if(data.customerProblem.cpsituation){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.cPSituation = {
                            id: data.customerProblem.cpsituation.id,
                            name: data.customerProblem.cpsituation.name
                        };
                    }
                    if( data.customerProblem.changeCPSituation
                        && data.customerProblem.changeCPSituation!==null){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.changeCPSituation = {
                            creationDate: data.customerProblem.changeCPSituation.creationDate
                        };
                    }
                    if(data.customerProblem.customerProblemClass){
                        $scope.cgtShowMinimalCPDataIn.customerProblem.customerProblemClass = {
                            id: data.customerProblem.customerProblemClass.id,
                            name: data.customerProblem.customerProblemClass.name
                        };
                    }
                },
                function(error) {
                    PopupService.CloseSpinner();
                    T3_TrazaService.setTrazaError(CNT.name, "Se ha detectado un error " + error.code + " en la llamada al servicio getCustomerProblemReport.");
                    var auxError = {};
                    if ((error.code === 500) && (error.mensaje1 !== undefined) && (error.mensaje1 !== null)) {
                        auxError.mensaje1 = error.mensaje1;
                        auxError.mensaje2 = error.mensaje2;
                        auxError.mensaje3 = error.mensaje3;
                    }
                    $scope.openPopError();
                });
        };

        /**************** FIN Llamadas al servicio ********************/
    }
]);