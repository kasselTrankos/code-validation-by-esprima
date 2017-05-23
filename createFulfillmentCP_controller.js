'use strict';

CNT.ngModule.controller('createFulfillmentCPController', [
    '$scope', '$log', 'PopupService', 'gettextCatalog', 'createFulfillmentCPService',
    'T3_CommunicationService', 'T3_CabeceraPresentacionService', '$state',
    'T3_TrazaService', '$stateParams', 'T3_StateService', '$filter', 'createFulfillmentCPConstant',
    function($scope, $log, PopupService, gettextCatalog, createFulfillmentCPService,
        T3_CommunicationService, T3_CabeceraPresentacionService, $state,
        T3_TrazaService, $stateParams, T3_StateService, $filter, createFulfillmentCPConstant) {
        var $this = this; ///bug de jasmine no reconoce this ( no en todos pero lo incluyo en todos los CGTS)
        $scope.init = function() {

            $scope.createFulfillmentCPView = {
                motivoSel: [],
                submotivoSel: []
            };
            $scope.createFulfillmentCPFunctionality = {};
            $scope.createFulfillmentCPData = {};



            T3_StateService.init($scope, createFulfillmentCPService, {
                CGT_CreateFulfillmentCP_IN: $scope.cgtCreateFulfillmentCPIn || $stateParams.cgtCreateFulfillmentCPIn
            });

            $scope.loadMultilanguage();
            T3_CommunicationService.subscribe($scope, "AlertLanguageChanged", $scope.loadMultilanguage);

            //Cagamos datos iniciales
            $scope.cargarDatosInicio();

            // PASO 3
            $scope.loadCgtShowPartyRoleHeader();

            // PASO 4
            $scope.loadCgtManageCPContact($scope.CGT_CreateFulfillmentCP_IN);
        };

        $scope.loadMultilanguage = function() {
            T3_CabeceraPresentacionService.resolveTranslationsCG('createFulfillmentCP', gettextCatalog.currentLanguage).then(function() {
                $scope.iniciamosWizard();
            });
        };

        // Método para inicializar las variables para el wizard
        $scope.iniciamosWizard = function() {
            $scope.createFulfillmentCPFunctionality.pasos = [{
                "name": gettextCatalog.getString('createFulfillmentCP-wizard-paso1'),
                "desc": gettextCatalog.getString('createFulfillmentCP-wizard-descripcion1')
            }, {
                "name": gettextCatalog.getString('createFulfillmentCP-wizard-paso2'),
                "desc": gettextCatalog.getString('createFulfillmentCP-wizard-descripcion2')
            }];

            $scope.createFulfillmentCPFunctionality.paso = 2;
        };

        /*Metodo en el que instanciamos todos los datos inciales*/
        $scope.cargarDatosInicio = function() {
            $scope.createFulfillmentCPFunctionality.btnFinalizar = true;
            $scope.createFulfillmentCPFunctionality.searchResult = false;
            $scope.createFulfillmentCPData.problemasGenerados = [];
            $scope.createFulfillmentCPData.motivocp = [];

            $scope.createFulfillmentCPFunctionality.customerProblemTypeId = $scope.CGT_CreateFulfillmentCP_IN.customerProblemTaskType.id;

            // PASO 1
            $scope.getFulfillmentCustomerProblemDataByCP();
        };

        $scope.checkSelectedInputs = function(){
            var control = true;

            if($scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP){
                var l1 = $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders.length;
                var i = 0;
                for(i;i<l1;i++){
                    var l2 = $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[i].customerOrderItems.length;
                    var j = 0;
                    for(j;j<l2;j++){
                        var l3 = $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[i].customerOrderItems[j].customerOrderItems.length;
                        var x = 0;
                        for(x;x<l3;x++){
                            if($scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[i].customerOrderItems[j].customerOrderItems[x].selected
                                && $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds
                                && $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds.length>0){
                                control = false;
                            }
                            else {
                                control = true;
                                break;
                            }
                        }
                    }
                }
            }

            return control;
        };

        $scope.generateVolverCustomerOrders = function() {
            var _generate = [];
            var i = 0;
            var l1 = $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders.length;

            for(i;i<l1;i++) {
                _generate.push({
                    id: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].id,
                    code: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].code,
                    customerOrderItems: []
                });

                var j = 0;
                var l2 = $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems.length;

                for(j;j<l2;j++) {
                    var x = 0;
                    var l3 = $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems.length;
                    for(x;x<l3;x++) {
                        _generate[i].customerOrderItems.push({
                            id: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems[x].id,
                            cpmotiveAbstracts: []
                        });

                        var z = 0;
                        var l4 = $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds.length;
                        for(z;z<l4;z++) {
                            _generate[i].customerOrderItems[x].cpmotiveAbstracts.push({
                                id: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds[z].cpmotiveAbstract.id,
                                description: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds[z].cpmotiveAbstract.description,
                                cpsubmotive: {
                                    id: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds[z].cpmotiveAbstract.cpsubmotive.id,
                                    description: $scope.getFulfillmentCustomerProblemDataByCP_OUT.customerOrders[i].customerOrderItems[j].customerOrderItems[x].coidisputeds[z].cpmotiveAbstract.cpsubmotive.description
                                }
                            })
                        }
                    }
                }
            }
            return _generate;
        }

        $scope.volver = function() {
            var data = {
                action: 'volver',
                customerOrder: $scope.CGT_CreateFulfillmentCP_IN.customerOrders[0],
                customerOrderWithProblem: $scope.generateVolverCustomerOrders()
            };

            T3_CommunicationService.publish('EGT_CreateFulfillmentCPOK', data);
        };

        $scope.cancelar = function() {
            var cgtName = "CGT_CreateFulfillmentCP";

            T3_CommunicationService.publish('EGT_PrclReturnEmptyKO', cgtName);
        };

        $scope.crear = function(motivo, submotivo, linea) {
            if (motivo && submotivo) {
                if(!linea.coidisputeds){
                    linea.coidisputeds = [];
                }
                var clave = motivo.id + submotivo.id;
                if ($filter('filter')(linea.coidisputeds, {
                        id: clave
                    }).length === 0) {
                    var objeto = {
                        id: clave,
                        coidisputedActivity: {
                            id: "0",
                            activity: "activity",
                            activityDate: new Date()
                        },
                        cpmotiveAbstract: {
                            id: motivo.id,
                            description: motivo.description,
                            cpsubmotive: submotivo
                        }
                    };

                    linea.coidisputeds.push(objeto);
                    linea.coidisputedsLength = linea.coidisputeds.length;

                    var deleted = false;
                    var i = 0;
                    var l1 = linea.motivos.cpmotiveAbstracts.length;
                    for(i;i<l1;i++){
                        if(linea.motivos.cpmotiveAbstracts[i].id === motivo.id){
                            var j = 0;
                            var l2 = linea.motivos.cpmotiveAbstracts[i].cpsubmotive.length;
                            for(j;j<l2;j++){
                                if(linea.motivos.cpmotiveAbstracts[i].cpsubmotive[j].id === submotivo.id){
                                    if(linea.motivos.cpmotiveAbstracts[i].cpsubmotive.length > 0){
                                        if(!linea.deletedMotives){
                                            linea.deletedMotives = [];
                                            linea.deletedMotives.push({
                                                id: linea.motivos.cpmotiveAbstracts[i].id,
                                                description: linea.motivos.cpmotiveAbstracts[i].description,
                                                cpsubmotive: {
                                                    id: linea.motivos.cpmotiveAbstracts[i].cpsubmotive[j].id,
                                                    description: linea.motivos.cpmotiveAbstracts[i].description
                                                }
                                            });
                                        }
                                        else{
                                            linea.deletedMotives.push({
                                                id: linea.motivos.cpmotiveAbstracts[i].id,
                                                description: linea.motivos.cpmotiveAbstracts[i].description,
                                                cpsubmotive: {
                                                    id: linea.motivos.cpmotiveAbstracts[i].cpsubmotive[j].id,
                                                    description: linea.motivos.cpmotiveAbstracts[i].description
                                                }
                                            });
                                        }
                                        deleted = true;
                                        linea.motivos.cpmotiveAbstracts[i].cpsubmotive.splice(j, 1);
                                        if(linea.motivos.cpmotiveAbstracts[i].cpsubmotive.length == 0){
                                            linea.motivos.cpmotiveAbstracts.splice(i, 1);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        if(deleted){
                            break;
                        }
                    }
                }
            }
        };

        $scope.borrarMotivoSubmotivo = function(index, motivo, linea) {
            var i = 0;
            var control = false;
            var l1 = linea.motivos.cpmotiveAbstracts.length;

            for(i;i<l1;i++){
                if(linea.motivos.cpmotiveAbstracts[i].id === motivo.cpmotiveAbstract.id){
                    linea.motivos.cpmotiveAbstracts[i].cpsubmotive.push({
                        id: motivo.cpmotiveAbstract.cpsubmotive.id,
                        description: motivo.cpmotiveAbstract.cpsubmotive.description
                    });
                    control = true;
                    break;
                }
            }

            if(!control){
                linea.motivos.cpmotiveAbstracts.push({
                    id: motivo.cpmotiveAbstract.id,
                    description: motivo.cpmotiveAbstract.description,
                    cpsubmotive: [{
                        id: motivo.cpmotiveAbstract.cpsubmotive.id,
                        description: motivo.cpmotiveAbstract.cpsubmotive.description
                    }]
                });
            }

            linea.coidisputeds.splice(index, 1);
        };

        $scope.borrarCOI = function(iCustomerOrder, iProducto, iLinea, producto) {

            $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders[iCustomerOrder].customerOrderItems[iProducto].customerOrderItems.splice(iLinea, 1);

            producto.selecionado = false;
        };

        $scope.validar = {
            mostrarErrores: false,
            validar: function() {
                if ($scope.createFulfillmentCPForm.$valid) {

                    // PASO 13
                    $scope.dateCustomerProblem();
                } else {
                    this.mostrarErrores = true;
                }
            }
        };

        $scope.getNameOfState = function() {
            return 'cnt' + CNT.name.charAt(0).toUpperCase() + CNT.name.slice(1).toLowerCase() + 'State';
        };

        // Buscamos si el COItem tiene ya motivos y submotivos asignados en el UCI de entrada CGT_createFulfillmentCP
        $scope.findCOItemOnCGTIN = function(customerOrderItemID) {
            var existsItem = false;

            for (var i = 0;
                (i < $scope.CGT_CreateFulfillmentCP_IN.customerOrders.length) && !existsItem; i++) {
                var foundItems = $filter('filter')($scope.CGT_CreateFulfillmentCP_IN.customerOrders[i].customerOrderItem, {
                    id: customerOrderItemID
                });

                if (foundItems.length > 0) {
                    existsItem = true;
                }
            }

            return existsItem;
        };

        $scope.pestanias = function(valor) {
            $scope.createFulfillmentCPFunctionality.pestaniaActual = valor;

            switch (valor) {
                // PASO 6
                case 2:

                    // Buscar tipo 'Customer'
                    var customer = $filter('filter')($scope.CGT_CreateFulfillmentCP_IN.partyRoles, function(item) {
                        return item['@c'] === createFulfillmentCPConstant.PARTYROLESTYPES_OUT.CUSTOMER;
                    });

                    $scope.cgtListCPByPartyRoleAndCPTypeIn = {
                        customer: {
                            id: customer[0].id
                        },
                        customerProblemType: {
                            id: $scope.CGT_CreateFulfillmentCP_IN.customerProblemType.id
                        }
                    };

                    break;
            }
        };

        // Método para generar el valor para el parámetro 'customerOrders' utilizado para la entrada de la operación 'OP_getFulfillmentCustomerProblemDataByCP'
        $scope.generateGetFulfillmentCustomerProblemDataByCP_IN = function() {
            var customerOrders = [];

            angular.forEach($scope.CGT_CreateFulfillmentCP_IN.customerOrders, function(customerOrderElement) {
                var cOrder = {
                    id: customerOrderElement.id,
                    customerOrderItems: []
                };

                angular.forEach(customerOrderElement.customerOrderItem, function(coItem) {
                    var item = {
                        id: coItem.id
                    };

                    cOrder.customerOrderItems.push(item);
                });

                customerOrders.push(cOrder);
            });

            return customerOrders;
        };

        // PASO 2.1: generar los datos de entrada para ''
        $scope.generateFindFulfillmentCPMotive_IN = function() {
            var customerOrdersList = $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders;
            var FindFulfillmentCPMotive_IN = {
                listCustomerOrdenItemSelecteds: []
            };

            // PASO 2.1: Recorrer la lista de customerOrder
            angular.forEach(customerOrdersList, function(customerOrder) {
                angular.forEach(customerOrder.customerOrderItems, function(coItem) {
                    angular.forEach(coItem.customerOrderItems, function(childrenItem) {

                        var itemSelected = {
                            customerOrderItemFather: {
                                id: coItem.id,
                                businessInteractionItemStatus: {
                                    id: coItem.businessInteractionItemStatus.id
                                },
                                scheduleItem: {
                                    itemExpectedCompleteDate: coItem.scheduleItem.itemExpectedCompleteDate,
                                    itemCompleteDate: coItem.scheduleItem.itemCompleteDate
                                }
                            },
                            customerOrderItem: {
                                id: childrenItem.id,
                                businessInteractionItemStatus: {
                                    id: coItem.businessInteractionItemStatus.id
                                    //id: 3
                                },
                                businessInteractionItemHasStatusValidFor: childrenItem.businessInteractionItemHasStatus.validFor,
                                scheduleItem: {
                                    itemExpectedCompleteDate: childrenItem.scheduleItem.itemExpectedCompleteDate,
                                    itemCompleteDate: childrenItem.scheduleItem.itemCompleteDate,
                                    portabilityDateRank: childrenItem.scheduleItem.portabilityDateRank
                                }
                            }
                        };

                        if(childrenItem.customerQuoteItem){
                            itemSelected.customerOrderItem.customerQuoteItem = {};

                            if(childrenItem.customerQuoteItem.paymentMethodType){
                                itemSelected.customerOrderItem.customerQuoteItem.paymentMethodType = {};
                                itemSelected.customerOrderItem.customerQuoteItem.paymentMethodType.id = childrenItem.customerQuoteItem.paymentMethodType.id;
                            }

                            if(childrenItem.customerQuoteItem.productOfferingShipmentTerm){
                                itemSelected.customerOrderItem.customerQuoteItem.productOfferingShipmentTerm = {};
                                itemSelected.customerOrderItem.customerQuoteItem.productOfferingShipmentTerm.id = childrenItem.customerQuoteItem.productOfferingShipmentTerm.id;
                            }

                            if(childrenItem.customerQuoteItem.atomicWork){
                                itemSelected.customerOrderItem.customerQuoteItem.atomicWork = {};

                                if(childrenItem.customerQuoteItem.atomicWorkCQI && childrenItem.customerQuoteItem.atomicWorkCQI.wfAppointment.length>0){

                                    itemSelected.customerOrderItem.customerQuoteItem.atomicWork.wfAppointments = [];
                                    angular.forEach(childrenItem.customerQuoteItem.atomicWorkCQI.wfAppointment, function(wfAppointmentItem) {

                                        var wfAppointment = {
                                            startIntervalBeginning: wfAppointmentItem.startIntervalBeginning,
                                            endIntervalBeginning: wfAppointmentItem.endIntervalBeginning,
                                            appointmentState: {
                                                id: wfAppointmentItem.appointmentState.id
                                            }
                                        };

                                        if(wfAppointmentItem.appointmentChangeStateReason){
                                            wfAppointment.appointmentChangeStateReason = {
                                                id: wfAppointmentItem.appointmentChangeStateReason.id,
                                                responsibleType: {
                                                    id: wfAppointmentItem.appointmentChangeStateReason.responsibleType.id
                                                }
                                            };

                                        }

                                        itemSelected.customerOrderItem.customerQuoteItem.atomicWork.push(wfAppointment);
                                    });
                                }
                            }
                        }

                        if($scope.CGT_CreateFulfillmentCP_IN.customerOrders &&
                            $scope.CGT_CreateFulfillmentCP_IN.customerOrders.length > 0) {
                            var i = 0;
                            var l = $scope.CGT_CreateFulfillmentCP_IN.customerOrders.length;

                            for(i; i<l; i++){
                                var foundItems = $filter('filter')($scope.CGT_CreateFulfillmentCP_IN.customerOrders[i].customerOrderItem, {
                                    id: childrenItem.id
                                });

                                if(foundItems && foundItems.length > 0){
                                    break;
                                }
                            }
                        }

                        FindFulfillmentCPMotive_IN.listCustomerOrdenItemSelecteds.push(itemSelected);
                    });
                });
            });

            return FindFulfillmentCPMotive_IN;
        };

        // PASO 3
        $scope.loadCgtShowPartyRoleHeader = function() {
            var customerID = $scope.getCustomer();
            var representative = $scope.getRepresentative();

            $scope.cgtShowPartyRoleHeaderIn = {
                customer: {
                    id: customerID.id
                }
            };

            if (representative) {
                $scope.cgtShowPartyRoleHeader.customer.representative = {
                    id: representative.id
                };
            }
        };

        // PASO 4
        $scope.loadCgtManageCPContact = function(cgtIN) {
            $scope.cgtManageCPContactIn = {
                action: 'E',
                partyRole: {
                    '@c': createFulfillmentCPConstant.PARTYROLESTYPES_IN.CUSTOMER,
                    id: $scope.getCustomer().id
                },
                customerProblemType: {
                    id: cgtIN.customerProblemType.id
                }
            };
        };

        // Método que obtiene el valor de 'customer' del array de 'partyRoles' de la entrada al CGT
        $scope.getCustomer = function() {
            var customer = $filter('filter')($scope.CGT_CreateFulfillmentCP_IN.partyRoles, function(item) {
                return item['@c'] === createFulfillmentCPConstant.PARTYROLESTYPES_OUT.CUSTOMER;
            })[0];

            return customer;
        };

        // Método que obtiene el valor de 'representative' del array de 'partyRoles' de la entrada al CGT
        $scope.getRepresentative = function() {
            var representativeID = $filter('filter')($scope.CGT_CreateFulfillmentCP_IN.partyRoles, function(item) {
                return item['@c'] === createFulfillmentCPConstant.PARTYROLESTYPES_OUT.REPRESENTATIVE;
            })[0];

            return representativeID;
        };

        // Método para asignar motivos/submotivos a los items mostrados
        $scope.assignMotivesAndSubmotives = function(linea) {
            //var selectedItems = $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds;
            //Filtramos los motivos y submotivos para el CustomenOrder recibido como parametro
            var found =  $filter('filter')($scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds, {
                customerOrderItem:{
                    id: linea.id
                }
            });

            var l1 = found.length;
            var i = 0;
            var cPMotiveAbstracts = [];
            var control = false;

            for(i;i<l1;i++){
                if(i == 0)
                {
                    cPMotiveAbstracts.push({
                        id: found[0].cpmotiveAbstracts[0].id,
                        description: found[0].cpmotiveAbstracts[0].description
                    });
                }
                else{
                    var l2 = cPMotiveAbstracts.length;
                    var j = 0;
                    for(j;j<l2;j++){
                        if(cPMotiveAbstracts[j].id === found[i].cpmotiveAbstracts[0].id){
                            control = true;
                        }
                        else{
                            control = false;
                        }
                    }
                    if(!control){
                        cPMotiveAbstracts.push({
                            id: found[i].cpmotiveAbstracts[0].id,
                            description: found[i].cpmotiveAbstracts[0].description
                        });
                    }
                }
            }

            var y = 0;
            var l3 = cPMotiveAbstracts.length;

            for(y;y<l3;y++){
                var x = 0;
                for(x;x<l1;x++){
                    if(cPMotiveAbstracts[y].id === found[x].cpmotiveAbstracts[0].id){
                        if(cPMotiveAbstracts[y].cpsubmotive){
                            cPMotiveAbstracts[y].cpsubmotive.push({
                                id: found[x].cpmotiveAbstracts[0].cpsubmotive.id,
                                description: found[x].cpmotiveAbstracts[0].cpsubmotive.description
                            });
                        }
                        else{
                            cPMotiveAbstracts[y].cpsubmotive = [];
                            cPMotiveAbstracts[y].cpsubmotive.push({
                                id: found[x].cpmotiveAbstracts[0].cpsubmotive.id,
                                description: found[x].cpmotiveAbstracts[0].cpsubmotive.description
                            });
                        }
                    }
                }
            }

            return {cpmotiveAbstracts:cPMotiveAbstracts};
        };

        // Método para generar el objeto de entrada para la operación 'dateCustomerProblem'
        $scope.generateDateCustomerProblem_IN = function() {
            var customer = $scope.getCustomer();
            var DateCustomerProblem_IN = {
                channelType: {
                    id: $scope.CGT_CreateFulfillmentCP_IN.channelType.id
                },
                customerProblemType: {
                    id: $scope.CGT_CreateFulfillmentCP_IN.customerProblemType.id
                }
            };

            if (customer.atomicMarketSegment) {
                DateCustomerProblem_IN.atomicMarketSegment = {
                    id: customer.atomicMarketSegment.id
                };

                DateCustomerProblem_IN.atomicMarketSegment.compositeMarketSegment = {
                        id: 2
                    };

                if (customer.atomicMarketSegment.compositeMarketSegment) {
                    DateCustomerProblem_IN.atomicMarketSegment.compositeMarketSegment = {
                        id: customer.atomicMarketSegment.compositeMarketSegment.id
                    }
                }
            }

            return DateCustomerProblem_IN;
        };

        // Método para generar el objeto de entrada para la operación 'generateCustomerProblemReport'
        $scope.generateCustomerProblemReport_IN = function() {
            var customer = $scope.getCustomer();
            var customerOrders = $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP.customerOrders;

            var generateCustomerProblemReport_IN = {
                partyRole: {
                    '@c': createFulfillmentCPConstant.PARTYROLESTYPES_IN.CUSTOMER,
                    id: customer.id
                },
                functionalPool: {
                    id: $scope.CGT_CreateFulfillmentCP_IN.functionalPool.id
                },
                customerProblem: {
                    targetDate: $scope.createFulfillmentCPData.dateCustomerProblem_OUT.customerProblem.targetDate,
                    targetDuration: $scope.createFulfillmentCPData.dateCustomerProblem_OUT.customerProblem.targetDuration,
                    customerProblemTask: {
                        customerComments: $scope.createFulfillmentCPView.comentariosCli,
                        comments: $scope.createFulfillmentCPView.comentariosGest,
                        customerProblemTaskType: {
                            id: $scope.CGT_CreateFulfillmentCP_IN.customerProblemTaskType.id
                        }
                    },
                    entryType: {
                        id: 1 // Problema abierto por cliente
                    },
                    customerInquiry: {
                        id: $scope.CGT_CreateFulfillmentCP_IN.customerInquiry.id
                    },
                    customerProblemType: {
                        id: $scope.CGT_CreateFulfillmentCP_IN.customerProblemType.id
                    },
                    cpcpmotiveAssocs: []
                },
                customerOrders: [],
                businessInteractionRoles: []
            };

            if($scope.CGT_CreateFulfillmentCP_IN.customerProblem
                && $scope.CGT_CreateFulfillmentCP_IN.customerProblem.id) {
                generateCustomerProblemReport_IN.customerProblem.customerProblem = {
                    id: $scope.CGT_CreateFulfillmentCP_IN.customerProblem.id
                };
            }

            // Customer orders
            angular.forEach($scope.CGT_CreateFulfillmentCP_IN.customerOrders, function(order) {
                var customerOrder = {
                    id: order.id
                };

                generateCustomerProblemReport_IN.customerOrders.push(customerOrder);
            });

            // Atomic Market Segment
            if (customer.atomicMarketSegment) {
                generateCustomerProblemReport_IN.partyRole.atomicMarketSegment = {
                    '@c': '.AtomicMarketSegment_DTO_IN',
                    id: customer.atomicMarketSegment.id,
                    compositeMarketSegment: {
                        '@c': '.CompositeMarketSegment_DTO_IN',
                        id: customer.atomicMarketSegment.compositeMarketSegment.id
                    }
                }
            }

            // Territory
            if (customer.territory) {
                generateCustomerProblemReport_IN.partyRole.territory = {
                    '@c': '.AtomicMarketSegment_DTO_IN',
                    id: customer.territory.id
                }
            }

            // Buscar motivos y submotivos
            angular.forEach(customerOrders, function(cOrder) {
                var seleccionado = $filter('filter')(cOrder.customerOrderItems, function(item) {
                    return item.selecionado !== undefined;
                });

                if (seleccionado && seleccionado.length > 0) {
                    angular.forEach(seleccionado, function(coiFather){
                        angular.forEach(coiFather.customerOrderItems, function(coiChildren) {
                            angular.forEach(coiChildren.coidisputeds, function(coMotivo) {
                                var motivo = {
                                    cpmotiveAbstract: {
                                        "@c": createFulfillmentCPConstant.CPMOTIVESABSTRACT_TYPES_IN.MOTIVES_IN,
                                        id: coMotivo.cpmotiveAbstract.id,
                                        cpsubmotive: {
                                            "@c": createFulfillmentCPConstant.CPMOTIVESABSTRACT_TYPES_IN.SUBMOTIVES_IN,
                                            id: coMotivo.cpmotiveAbstract.cpsubmotive.id
                                        }
                                    },
                                    coidisputeds: [{
                                        customerOrderItem: {
                                            id: coiChildren.id,
                                            businessInteractionItemStatus: {
                                                id: coiChildren.businessInteractionItemHasStatus.businessInteractionItemStatus.id
                                            }
                                        }
                                    }]
                                };

                                generateCustomerProblemReport_IN.customerProblem.cpcpmotiveAssocs.push(motivo);
                            });
                        });
                    });
                }
            });

            // Recoger los datos del CGT_manageCPContact
            $scope.cgt_manageCPContact = $scope.getStorage($scope.getNameOfState()).manageCPContact;

            // Lista de contactos del problema
            for (var i = 0; i < $scope.cgt_manageCPContact.businessInteractionRoles.length; i++) {
                var idClass = '.ContactInteractionRole_DTO_IN';
                if ($scope.cgt_manageCPContact.businessInteractionRoles[i]['@c'] === '.PartyInteractionRole_DTO_OUT') {
                    idClass = '.PartyInteractionRole_DTO_IN';
                }
                var businessInteractionRole = {
                    '@c': idClass,
                    contactMedium: {
                        contactMediumType: {
                            id: $scope.cgt_manageCPContact.businessInteractionRoles[i].contactMedium.contactMediumType.id
                        }
                    },
                    interactionRoleType: {
                        id: $scope.cgt_manageCPContact.businessInteractionRoles[i].interactionRoleType.id
                    },
                    partyRole: {
                        id: $scope.cgtManageCPContactIn.businessInteractionRoles[i].partyRole.id
                    }
                };

                if ($scope.cgt_manageCPContact.businessInteractionRoles[i].contactMedium.id) {
                    businessInteractionRole.contactMedium.id = $scope.cgt_manageCPContact.businessInteractionRoles[i].contactMedium.id;
                } else {
                    businessInteractionRole.contactMedium.value = $scope.cgt_manageCPContact.businessInteractionRoles[i].contactMedium.value;
                }

                generateCustomerProblemReport_IN.businessInteractionRoles.push(businessInteractionRole);
            }

            if($scope.cgtManageCPContactIn.isPerson
                && $scope.cgtManageCPContactIn.personMediumType
                && $scope.cgtManageCPContactIn.personMediumType.person[0]
                && $scope.cgtManageCPContactIn.personMediumType.personMedioContacto[0]){
                var _businessInteractionRole = {
                    "@c": $scope.cgtManageCPContactIn.personMediumType['@c'],
                    contactMedium:{
                        contactMediumType:{
                            id: 1
                        }
                    },
                    interactionRoleType:{
                        id: 3
                    }
                };
                if($scope.cgtManageCPContactIn.personMediumType.person[0].partyRole){
                    _businessInteractionRole['@c'] = '.PartyInteractionRole_DTO_IN';
                    _businessInteractionRole.partyRole = {
                        id: $scope.cgtManageCPContactIn.personMediumType.person[0].id
                    };
                }else{
                    _businessInteractionRole.contactAlias = $scope.cgtManageCPContactIn.personMediumType.person[0].name;
                }
                if($scope.cgtManageCPContactIn.personMediumType.personMedioContacto[0].id!==-1){
                    _businessInteractionRole.contactMedium.id = $scope.cgtManageCPContactIn.personMediumType.personMedioContacto[0].id;
                }else{
                    _businessInteractionRole.contactMedium.value = $scope.cgtManageCPContactIn.personMediumType.personMedioContacto[0].value;
                }
                if ($scope.cgtManageCPContactIn.personMediumType.id){
                    _businessInteractionRole.id = $scope.cgtManageCPContactIn.personMediumType.id;
                }
                generateCustomerProblemReport_IN.businessInteractionRoles.push(_businessInteractionRole);
            }

            return generateCustomerProblemReport_IN;
        };

        // Método para generar el objeto de entrada para la operación 'MedCreateCustomerProblem'
        $scope.generateMedCreateCustomerProblem_IN = function() {
            var generateCustomerProblemReport_OUT = $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT;
            var customer = $scope.getCustomer();

            var medCreateCustomerProblem_IN = {
                createCustomerProblem_DTO_IN: {
                    customerProblemId: generateCustomerProblemReport_OUT.customerProblem.id,
                    customerProblemReopenedCPNumber: generateCustomerProblemReport_OUT.customerProblem.reopenedCPNumber,
                    customerProblemInteractionDate: generateCustomerProblemReport_OUT.customerProblem.interactionDate,
                    customerProblemProceed: generateCustomerProblemReport_OUT.customerProblem.proceed,
                    customerProblemCode: generateCustomerProblemReport_OUT.customerProblem.code,
                    customerProblemTargetDate: generateCustomerProblemReport_OUT.customerProblem.targetDate,
                    customerProblemPhaseId: generateCustomerProblemReport_OUT.customerProblem.customerProblemPhase.id,
                    customerProblemTypeId: $scope.CGT_CreateFulfillmentCP_IN.customerProblemType.id,
                    entryTypeId: generateCustomerProblemReport_OUT.customerProblem.entryType.id,
                    functionalRoleId: 0,
                    atomicMarketSegmentId: customer.atomicMarketSegment.id,
                    compositeMarketSegmentId: customer.atomicMarketSegment.compositeMarketSegment.id,
                    territoryId: customer.territory.id,
                    createCustomerProblemTS_Fin: new Date(),
                    measure: "createCP"
                }
            };

            if (customer.functionalPool) {
                medCreateCustomerProblem_IN.createCustomerProblem_DTO_IN.functionalPoolId = $scope.CGT_CreateFulfillmentCP_IN.functionalPool.id;
            }

            if (customer.channelType) {
                medCreateCustomerProblem_IN.createCustomerProblem_DTO_IN.channelTypeId = $scope.CGT_CreateFulfillmentCP_IN.channelType.id;
            }

            return medCreateCustomerProblem_IN;
        };

        $scope.publishCreateFulfillmentCPOK = function() {
            var EGT_CreateFulfillmentCPOK = {
                action: "continuar",
                customerProblem: {
                    id: $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT.customerProblem.id,
                    code: $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT.customerProblem.code,
                    reopenedCPNumber: $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT.customerProblem.reopenedCPNumber
                }
            };

            T3_CommunicationService.publish('EGT_CreateFulfillmentCPOK', EGT_CreateFulfillmentCPOK);
        }

        //Popup genérico
        this.AbstractModalMessage = function(txt, btns, type, size){
            var options = {
                size: size || 'sm',
                tipoModal: type || 'error',
                tituloModal: txt.title,
                textoPrincipal: txt.principalText || '',
                textoSecundario: txt.secondaryText || '',
                textoPregunta: txt.questionText || '',
                textoBtnAceptar: btns.acceptText || '',
                accionBtnAceptar: btns.accept || '',
                textoBtnCancelar: btns.cancelText ||'',
                accionBtnCancelar: btns.cancel || ''
            };
            PopupService.getPopupGeneric($scope, 'modalcreateFulfillmentCPController', options);
        };

        /**************** INI Llamadas al servicio ********************/
        /* Este servicio consigue el detalle de la CO y COI que están ya relacionados con un problema de provisión o
            que se quieren relacionar con un problema nuevo.
            Dará servicio a las funcionalidades de apertura, modificación, consulta y análisis,
            por lo que tendrá varios modos de consulta que se indicarán con la variable action  */
        $scope.getFulfillmentCustomerProblemDataByCP = function() {
            var GetFulfillmentCustomerProblemDataByCP_IN = {
                action: "C",
                customerOrders: $scope.generateGetFulfillmentCustomerProblemDataByCP_IN()
            };

            if ($scope.CGT_CreateFulfillmentCP_IN.customerProblem) {
                GetFulfillmentCustomerProblemDataByCP_IN.customerProblem = {
                    id: $scope.CGT_CreateFulfillmentCP_IN.customerProblem.id
                };
            }

            PopupService.getSpinner($scope);

            createFulfillmentCPService.getFulfillmentCustomerProblemDataByCP(GetFulfillmentCustomerProblemDataByCP_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.getFulfillmentCustomerProblemDataByCP = data;
                    $scope.getFulfillmentCustomerProblemDataByCP_OUT = data;

                    // PASO 2
                    $scope.findFulfillmentCPMotive();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    T3_TrazaService.setTrazaError(CNT.name, "Se ha detectado un error " + error.code + " en la llamada al servicio manageFunctionalArea.");
                    var auxError = {};

                    if ((error.code === 500) && (error.mensaje1 !== undefined) && (error.mensaje1 !== null)) {
                        auxError.mensaje1 = error.mensaje1;
                        auxError.mensaje2 = error.mensaje2;
                        auxError.mensaje3 = error.mensaje3;
                    }

                    $this.AbstractModalMessage({
                        title: gettextCatalog.getString('PRCL-M-000100-Titulo'),
                        principalText: gettextCatalog.getString('PRCL-M-000100-Principal'),
                        secondaryText: gettextCatalog.getString('PRCL-M-000100-Secundario')
                    },
                    {
                        acceptText: gettextCatalog.getString('createFulfillmentCP-aceptar'),
                        accept: 'cerrarPopup()'
                    });

                });
        };

        /* Servicio que recupera información de los motivos que aplican a cada uno de los ítem reclamados.
            En la entrada al servicio, recibirá una lista de COi que requieren evaluación,
            así como la lista de CPMotive y CPsubmotive que aplica a cada uno de ellos. Esta lista podrá ser vacía.
            Si no viene COI se devuelve el error PRCL-E-000100. */
        $scope.findFulfillmentCPMotive = function() {
            var FindFulfillmentCPMotive_IN = $scope.generateFindFulfillmentCPMotive_IN();

            PopupService.getSpinner($scope);

            createFulfillmentCPService.findFulfillmentCPMotive(FindFulfillmentCPMotive_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.findFulfillmentCPMotive = data;
                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds[1] ={"customerOrderItem":{"id":"11282796804692191467436374700824531083"},"cpmotiveAbstractsLength":1,"cpmotiveAbstracts":[{"@c":".CPMotive_DTO_OUT","id":402,"description":"[ES] No conforme con la tramitación","cpsubmotive":{"@c":".CPSubmotive_DTO_OUT","id":40202,"description":"[ES] No recibido lo solicitado"}}]};
                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds[2] ={"customerOrderItem":{"id":"11282796804692191467436374700824531083"},"cpmotiveAbstractsLength":1,"cpmotiveAbstracts":[{"@c":".CPMotive_DTO_OUT","id":402,"description":"[ES] No conforme con la tramitación","cpsubmotive":{"@c":".CPSubmotive_DTO_OUT","id":40201,"description":"[ES] No instalado lo solicitado"}}]};
                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds[3] ={"customerOrderItem":{"id":"11282796804692191467436374700824531083"},"cpmotiveAbstractsLength":1,"cpmotiveAbstracts":[{"@c":".CPMotive_DTO_OUT","id":400,"description":"[ES] Demora","cpsubmotive":{"@c":".CPSubmotive_DTO_OUT","id":40001,"description":"[ES] Incumplimiento de plazos"}}]};
                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds[4] ={"customerOrderItem":{"id":"11282796804692191467436374700824531083"},"cpmotiveAbstractsLength":1,"cpmotiveAbstracts":[{"@c":".CPMotive_DTO_OUT","id":400,"description":"[ES] Demora","cpsubmotive":{"@c":".CPSubmotive_DTO_OUT","id":40002,"description":"[ES] He hecho una portabilidad y no tengo servicio"}}]};
                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds[5] ={"customerOrderItem":{"id":"11282796804692191467436374700824531083"},"cpmotiveAbstractsLength":1,"cpmotiveAbstracts":[{"@c":".CPMotive_DTO_OUT","id":403,"description":"[ES] No conforme pago con tarjeta","cpsubmotive":{"@c":".CPSubmotive_DTO_OUT","id":40301,"description":"[ES] Equipo no entregado"}}]};
                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds[6] ={"customerOrderItem":{"id":"11282796804692191467436374700824531083"},"cpmotiveAbstractsLength":1,"cpmotiveAbstracts":[{"@c":".CPMotive_DTO_OUT","id":403,"description":"[ES] No conforme pago con tarjeta","cpsubmotive":{"@c":".CPSubmotive_DTO_OUT","id":40302,"description":"[ES] Devolución de equipo"}}]};

                    // $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelectedsLength = $scope.createFulfillmentCPData.findFulfillmentCPMotive.listCustomerOrdenItemSelecteds.length;
                    // Asignar motivos/submotivos a los COItems
                    //$scope.assignMotivesAndSubmotives();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    T3_TrazaService.setTrazaError(CNT.name, "Se ha detectado un error " + error.code + " en la llamada al servicio manageFunctionalArea.");
                    var auxError = {};

                    if ((error.code === 500) && (error.mensaje1 !== undefined) && (error.mensaje1 !== null)) {
                        auxError.mensaje1 = error.mensaje1;
                        auxError.mensaje2 = error.mensaje2;
                        auxError.mensaje3 = error.mensaje3;
                    }

                    $this.AbstractModalMessage({
                        title: gettextCatalog.getString('PRCL-M-000409-Titulo'),
                        principalText: gettextCatalog.getString('PRCL-M-000409-Principal'),
                        secondaryText: gettextCatalog.getString('PRCL-M-000409-Secundario')
                    },
                    {
                        acceptText: gettextCatalog.getString('createFulfillmentCP-aceptar'),
                        accept: 'cerrarPopup()'
                    });
                });
        };

        /* Esta función de negocio tiene como objetivo fijar una fecha objetivo para la resolución del problema.
            La obtención de la fecha objetivo se realiza del siguiente modo:
               1 - Si en los parámetros de entrada se ha recibido un TT esta fecha corresponden con la fecha objetivo del TT.
                    Para recuperar esta fecha se realiza una llamada al método AD_getTroubleTicket.
                    - Si este método devuelve el targetDate se utiliza como dato de salida
                    - Si el método no devuelve el targetDate se llama al SR ( SR_dateCustomerProblem )  que determina el tiempo objetivo para la resolución.
            En  otros casos se realizan las acciones siguientes:
                1 - Se realiza una llamada al módulo de gestión de ANS ( SAE AD_CalculateDateANS ) y nos devolverá fecha objetivo de resolución.
                2 - En caso de no obtener respuesta, el servicio realiza la llamada a la SR ( SR_dateCustomerProblem )  que determina el tiempo objetivo para la resolución. */
        $scope.dateCustomerProblem = function() {
            var DateCustomerProblem_IN = $scope.generateDateCustomerProblem_IN();

            PopupService.getSpinner($scope);

            createFulfillmentCPService.dateCustomerProblem(DateCustomerProblem_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.dateCustomerProblem_OUT = data;

                    // PASO 14
                    $scope.generateCustomerProblemReport();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    T3_TrazaService.setTrazaError(CNT.name, "Se ha detectado un error " + error.code + " en la llamada al servicio manageFunctionalArea.");
                    var auxError = {};

                    if ((error.code === 500) && (error.mensaje1 !== undefined) && (error.mensaje1 !== null)) {
                        auxError.mensaje1 = error.mensaje1;
                        auxError.mensaje2 = error.mensaje2;
                        auxError.mensaje3 = error.mensaje3;
                    }

                    $this.AbstractModalMessage({
                        title: gettextCatalog.getString('PRCL-M-000179-Titulo'),
                        principalText: gettextCatalog.getString('PRCL-M-000179-Principal'),
                        secondaryText: gettextCatalog.getString('PRCL-M-000179-Secundario')
                    },
                    {
                        acceptText: gettextCatalog.getString('createFulfillmentCP-aceptar'),
                        accept: 'cerrarPopup()'
                    });
                });
        };

        /* El objetivo de este servicio de negocio es generar un problema de cliente de acuerdo a los datos de entrada.
            Para cualquier tipología, generará un código de problema (BI.CustomerProblem.id), secuencial,
            generado de forma automática por el sistema y un código que responda a una estructura,
            que podrá tener un componente aleatorio o ser calculado por el proceso.
            Este último código será el notificado al cliente. */
        $scope.generateCustomerProblemReport = function() {
            var GenerateCustomerProblemReport_IN = $scope.generateCustomerProblemReport_IN();

            PopupService.getSpinner($scope);

            createFulfillmentCPService.generateCustomerProblemReport(GenerateCustomerProblemReport_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT = data;

                    // PASO 15
                    $scope.medCreateCustomerProblem();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    T3_TrazaService.setTrazaError(CNT.name, "Se ha detectado un error " + error.code + " en la llamada al servicio manageFunctionalArea.");
                    var auxError = {};

                    if ((error.code === 500) && (error.mensaje1 !== undefined) && (error.mensaje1 !== null)) {
                        auxError.mensaje1 = error.mensaje1;
                        auxError.mensaje2 = error.mensaje2;
                        auxError.mensaje3 = error.mensaje3;
                    }

                    // Si se recibe la excepción PRCL-E-00010
                    if (error.mensaje2 === 'PRCL-E-000100') {
                        $this.AbstractModalMessage({
                        title: gettextCatalog.getString('PRCL-M-00010-Titulo'),
                        principalText: gettextCatalog.getString('PRCL-M-00010-Principal'),
                        secondaryText: gettextCatalog.getString('PRCL-M-00010-Secundario')
                    },
                    {
                        acceptText: gettextCatalog.getString('createFulfillmentCP-aceptar'),
                        accept: 'cerrarPopup()'
                    });
                    } else {
                        $this.AbstractModalMessage({
                        title: gettextCatalog.getString('PRCL-M-000179-Titulo'),
                        principalText: gettextCatalog.getString('PRCL-M-000179-Principal'),
                        secondaryText: gettextCatalog.getString('PRCL-M-000179-Secundario')
                    },
                    {
                        acceptText: gettextCatalog.getString('createFulfillmentCP-aceptar'),
                        accept: 'cerrarPopup()'
                    });
                    }
                });
        };

        /* Servicio que permite modificar la etapa del problema de provisión, al generarse una acción sobre el mismo de tipo diferir */
        $scope.differFulfillmentCP = function() {
            var generateCustomerProblemReport_OUT = $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT;
            var DifferFulfillmentCP_IN = {
                functionalPool: {
                    id: $scope.CGT_CreateFulfillmentCP_IN.functionalPool.id
                },
                customerProblem: {
                    id: generateCustomerProblemReport_OUT.customerProblem.id
                }
            };

            PopupService.getSpinner($scope);

            createFulfillmentCPService.differFulfillmentCP(DifferFulfillmentCP_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.differFulfillmentCP = data;

                    // PASO 17
                    $scope.medDifferCustomerProblem();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    $scope.trackAndManageCustomerProblemInErrorBegin();
                });
        };

        /* OS_isolate_resolveFulfillmentCP_begin */
        $scope.isolateResolveFulfillmCPBegin = function() {
            var generateCustomerProblemReport_OUT = $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT;

            var isolateResolveFulfillmCPBegin_IN = {
                customerOrder: {
                    code: $scope.CGT_CreateFulfillmentCP_IN.customerOrders[0].code
                },
                customerProblem: {
                    id: $scope.createFulfillmentCPData.differFulfillmentCP.customerProblem.id
                }
            };

            PopupService.getSpinner($scope);

            createFulfillmentCPService.isolateResolveFulfillmCPBegin(isolateResolveFulfillmCPBegin_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.isolateResolveFulfillmCPBegin = data;

                    // PASO 19
                    $scope.createCustomerQoSCSLICP();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    // PASO 19
                    $scope.createCustomerQoSCSLICP();
                });
        };

        /* OS_trackAndManageCustomerProblemInError_begin */
        $scope.trackAndManageCustomerProblemInErrorBegin = function() {
            var generateCustomerProblemReport_OUT = $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT;
            var TrackAndManageCustomerProblemInErrorBegin_IN = {
                callingProcess: 'CG_createFulfillmentCustomerProblem',
                failProcess: 'ST_differFulfillmentCP',
                situationIsError: true,
                functionalPool: {
                    id: $scope.CGT_CreateFulfillmentCP_IN.functionalPool.id
                },
                customerProblem: {
                    id: generateCustomerProblemReport_OUT.customerProblem.id
                }
            };

            PopupService.getSpinner($scope);

            createFulfillmentCPService.trackAndManageCustomerProblemInErrorBegin(TrackAndManageCustomerProblemInErrorBegin_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.trackAndManageCustomerProblemInErrorBegin = data;

                    // PASO 19
                    $scope.createCustomerQoSCSLICP();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    // PASO 19
                    $scope.createCustomerQoSCSLICP();
                });
        };

        /* OS_createCustomerQoS_CSLICP */
        $scope.createCustomerQoSCSLICP = function() {
            var generateCustomerProblemReport_OUT = $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT;
            var customer = $scope.getCustomer();

            var CreateCustomerQoSCSLICP_IN = {
                customerProblem: {
                    id: generateCustomerProblemReport_OUT.customerProblem.id,
                    interactionDate: generateCustomerProblemReport_OUT.customerProblem.interactionDate,
                    businessInteractionType: {
                        id: 25
                    },
                    customerProblemType: {
                        id: $scope.CGT_CreateFulfillmentCP_IN.customerProblemType.id
                    },
                    partyRole: {
                        id: customer.id
                    }
                }
            };

            PopupService.getSpinner($scope);

            createFulfillmentCPService.createCustomerQoSCSLICP(CreateCustomerQoSCSLICP_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.createCustomerQoSCSLICP = data;

                    // PASO 20
                    $scope.reportCustomerProblemBegin();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    // PASO 20
                    $scope.reportCustomerProblemBegin();
                });
        };

        /** Las comunicaciones a través de sms e email en Problemas de cliente se llevan a cabo en el servicio de orquestación OS_ReportCustomerProblem.
            Este servicio se encarga de preparar el mensaje en función del medio de comunicación del cliente (si éste se encuentra entre los admitidos por telefónica).
            Una vez listo registrará esta actividad en el expediente del problema, a través de una CustomerProblemTask que recoge el inicio de la comunicación y
            a través de una CustomerProblemTask que recoge el fin de la comunicación.
            Se podrá realizar una notificación a más de un destino.
            El servicio está compuesto de:
            - Construcción del mensaje a enviar y selección del quién, cómo, qué.
            - Envío de cada uno de los mensajes a enviar.  */
        $scope.reportCustomerProblemBegin = function() {
            var generateCustomerProblemReport_OUT = $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT;
            var ReportCustomerProblemBegin_IN = {
                functionalPool: {
                    id: $scope.CGT_CreateFulfillmentCP_IN.functionalPool.id
                },
                customerProblem: {
                    id: generateCustomerProblemReport_OUT.customerProblem.id
                },
                customerProblemTask: {
                    id: generateCustomerProblemReport_OUT.customerProblem.customerProblemTask.id,
                    customerProblemTaskType: {
                        id: generateCustomerProblemReport_OUT.customerProblem.customerProblemTask.customerProblemTaskType.id
                    }
                }
            };

            PopupService.getSpinner($scope);

            createFulfillmentCPService.reportCustomerProblemBegin(ReportCustomerProblemBegin_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.reportCustomerProblemBegin = data;

                    var mensajeSecundario;

                    if (data.partyRoleNotifiedLists.length > 0) {
                        mensajeSecundario = gettextCatalog.getString('PRCL-M-00073-SecundarioCode') +
                                $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT.customerProblem.code;

                        angular.forEach(data.partyRoleNotifiedLists, function(item) {
                            mensajeSecundario += gettextCatalog.getString('PRCL-M-00073-SecundarioTipoMedio1') +
                                item.contactMedium.contactMediumType.name +
                                gettextCatalog.getString('PRCL-M-00073-SecundarioValor1') +
                                item.contactMedium.value;
                        });
                    } else {
                        mensajeSecundario = gettextCatalog.getString('PRCL-M-00074-SecundarioCode') +
                                $scope.createFulfillmentCPData.generateCustomerProblemReport_OUT.customerProblem.code;
                    }

                    $this.AbstractModalMessage({
                        title: gettextCatalog.getString('PRCL-M-00073-Titulo'),
                        principalText: gettextCatalog.getString('PRCL-M-00073-Principal'),
                        secondaryText: mensajeSecundario
                    },
                    {
                        acceptText: gettextCatalog.getString('createFulfillmentCP-aceptar'),
                        accept: 'publishEGT_OK()'
                    },'info');
                },
                function(error) {
                    PopupService.CloseSpinner();

                    // PASO 21
                    T3_CommunicationService.publish('publishEGT_OK');
                });
        };

        /* Emisor de la Medida MED_createCustomerProblem correspondiente al Evento EVE_customerProblem */
        $scope.medCreateCustomerProblem = function() {
            var MedCreateCustomerProblem_IN = $scope.generateMedCreateCustomerProblem_IN();

            PopupService.getSpinner($scope);

            createFulfillmentCPService.medCreateCustomerProblem(MedCreateCustomerProblem_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.medCreateCustomerProblem = data;

                    // PASO 16
                    $scope.differFulfillmentCP();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    // PASO 16
                    $scope.differFulfillmentCP();
                });
        };

        /*  Emisor de la Medida MED_differCustomerProblem correspondiente al Evento EVE_customerProblem */
        $scope.medDifferCustomerProblem = function() {
            var differFulfillmentCP_OUT = $scope.createFulfillmentCPData.differFulfillmentCP;
            var MedDifferCustomerProblem_IN = {
                differCustomerProblem_DTO_IN: {
                    customerProblemId: differFulfillmentCP_OUT.customerProblem.id,
                    customerProblemPhaseId: differFulfillmentCP_OUT.customerProblem.customerProblemPhase.id,
                    differringNeeded: differFulfillmentCP_OUT.customerProblem.differringNeeded,
                    customerProblemTaskCreationDate: differFulfillmentCP_OUT.customerProblem.customerProblemTask.creationDate,
                    measure: "differCP",
                    differCustomerProblemTS_Fin: new Date()
                }
            };

            PopupService.getSpinner($scope);

            createFulfillmentCPService.medDifferCustomerProblem(MedDifferCustomerProblem_IN).then(
                function(data) {
                    PopupService.CloseSpinner();

                    $scope.createFulfillmentCPData.medDifferCustomerProblem = data;

                    // PASO 18
                    $scope.isolateResolveFulfillmCPBegin();
                },
                function(error) {
                    PopupService.CloseSpinner();

                    // PASO 18
                    $scope.isolateResolveFulfillmCPBegin();
                });
        };

        /********************************* FIN LLAMADA SERVICIOS ************************************/
    }
]);

CNT.ngModule.controller('modalcreateFulfillmentCPController', ['$scope', '$modalInstance', 'T3_CommunicationService',
    function($scope, $modalInstance, T3_CommunicationService) {
        $scope.cerrarPopup = function() {
            $modalInstance.close();
        };

        $scope.publishEGT_OK = function() {
            $scope.$parent.$parent.publishCreateFulfillmentCPOK();
            $modalInstance.close();
        };
    }
]);