CNT.ngModule.controller('undertakeCPTrendAnalysisController', ['undertakeCPTrendAnalysisService',
	'$stateParams',
	'$scope',
	'gettextCatalog',
	'T3_CabeceraPresentacionService',
	'T3_CommunicationService',
	'T3_TrazaService',
	'T3_StateService',
	'T3_LanguageService',
	'PopupService',
	'$state',
	'T3_StorageService',
	'$parse',
	'$filter',
	function(
        undertakeCPTrendAnalysisService,
        $stateParams,
        $scope,
        gettextCatalog,
        T3_CabeceraPresentacionService,
        T3_CommunicationService,
        T3_TrazaService,
        T3_StateService,
        T3_LanguageService,
        PopupService,
        $state,
        T3_StorageService,
        $parse,
        $filter
    ) {

		$scope.init = function() {

			T3_StateService.init($scope, undertakeCPTrendAnalysisService, {
				CGT_UndertakeCPTrendAnalysis_IN: $stateParams.cgtUndertakeCPTrendAnalysisIn || $scope.cgtUndertakeCPTrendAnalysisIn
			});

			$scope.undertakeCPTrendAnalysisView = {};
			$scope.undertakeCPTrendAnalysisView.cuentasCliente = [];
			$scope.undertakeCPTrendAnalysisView.datosPersonales = {};
			$scope.isOpenSpinner = false;
			$scope.patternSate = [{
				to: 'entryType.id',
				from: 'undertakeCPTrendAnalysisView.problemaCliente'
			}, {
				from: 'CG_manageCustomerAccount_OUT[0].id',
				to: 'customerAccount.id'
			}, {
				from: 'undertakeCPTrendAnalysisView.comentarios',
				to: 'customerProblemTask.customerComments'
			}, {
				from: 'undertakeCPTrendAnalysisView.comentarios',
				to: 'customerProblemTask.colcustomerComments'
			}, {
				from: 'undertakeCPTrendAnalysisView.faseProblema',
				to: 'customerProblemPhase.id'
			}, {
				from: 'undertakeCPTrendAnalysisView.version',
				to: 'customerProblem.reopenedCPNumber'
			}, {
				from: 'undertakeCPTrendAnalysisView.codigo',
				to: 'customerProblem.code'
			}, {
			from: 'undertakeCPTrendAnalysisView.codigo',
			to: 'customerProblem.data'
		}, {
		from: 'undertakeCPTrendAnalysisView.numeroFactura',
		to: 'customerBill.billNo'
	}, {
	from: 'undertakeCPTrendAnalysisView.situacionProblema',
	to: 'cpsituation.id'
}, {
	from: 'cgtUndertakeCPTrendAnalysisIn.customer.id',
	to: 'partyRole.id'
}, {
	type: 'date',
	from: 'undertakeCPTrendAnalysisView.endDate',
	to: 'dateRange.endDateTime'
}, {
	type: 'date',
	from: 'undertakeCPTrendAnalysisView.startDate',
	to: 'dateRange.startDateTime'
}, {
	from: 'undertakeCPTrendAnalysisView.tipoProblema',
	to: 'customerProblemType.id'
}, {
	from: 'undertakeCPTrendAnalysisView.version',
	to: 'customerProblem.reopenedCPNumber'
}

			];
			$scope.lastSearch = {
				query: null,
				sorted: null
			};

			$scope.lastSearch.partyRole = {};
			$scope.spinners = [];
			$scope.undertakeCPTrendAnalysisView.Cliente = {};
			$scope.undertakeCPTrendAnalysisView.Cliente.NomApe = '';
			$scope.undertakeCPTrendAnalysisFunctionality = {};
			$scope.undertakeCPTrendAnalysisFunctionality.verFactura = false;
			$scope.undertakeCPTrendAnalysisFunctionality.cuentaClienteDisabled = true;
			$scope.undertakeCPTrendAnalysisData = {};
			$scope.undertakeCPTrendAnalysisData.backShowDetailOfCPReport = false;
			$scope.undertakeCPTrendAnalysisData.partyRole = {};

			$scope.numPageSearchCustomerProblem = 1;
			$scope.datosSearchCustomerProblem = [];
			$scope.tablaProblemasCliente = {
				paginacion: {}
			};
			$scope.searchCustomerProblemTable = {
				datos: [],
				metadatos: {
					numeroPagina: 0
				}
			};

			if ((!$stateParams.cgtUndertakeCPTrendAnalysisIn || $stateParams.cgtUndertakeCPTrendAnalysisIn === void 0) &&
                (!$scope.cgtUndertakeCPTrendAnalysisIn || $scope.cgtUndertakeCPTrendAnalysisIn === void 0)) {
				$scope.CGT_UndertakeCPTrendAnalysis_IN = {};
				$scope.undertakeCPTrendAnalysisData.backShowDetailOfCPReport = true;
			}

			$scope.cgtUndertakeCPTrendAnalysisIn = $scope.CGT_UndertakeCPTrendAnalysis_IN || {};
			$scope.CG_searchPartyRole_OUT = {};
            //Mock entrada
			$scope.gotFirstLoad_andPrintNameAppels = false;
            /*$scope.cgtUndertakeCPTrendAnalysisIn = {
                customer:{
                    id:"38892390444444216853427322271076041569"
                }
            };*/
			if ($scope.cgtUndertakeCPTrendAnalysisIn && $scope.cgtUndertakeCPTrendAnalysisIn.customer && $scope.cgtUndertakeCPTrendAnalysisIn.customer.id) {
				$scope.gotFirstLoad_andPrintNameAppels = true;
				$scope.getCustomerData();
			}
			$scope.$root.undertakeCPTrendAnalysis = $scope.$root.undertakeCPTrendAnalysis || {};
			$scope.sorting = $scope.lastSearch.sorted = {
				field: 'startDate',
				mode: 'Asc'
			};

			$scope.loadMultilanguageNew();
			T3_CommunicationService.subscribe($scope, 'AlertLanguageChanged', $scope.loadMultilanguageNew);
			T3_CommunicationService.subscribe($scope, 'EGT_SelectedSearchPartyRole', $scope.onSelectedSearchPartyRole);
			T3_CommunicationService.subscribe($scope, 'EGT_SearchPartyRole', $scope.onSearchPartyRole);
			T3_CommunicationService.subscribe($scope, 'listadoCuentas_OUT', $scope.onListadoCuentas_OUT);
			T3_CommunicationService.subscribe($scope, 'EGT_ManageCustomerAccount', $scope.onEGT_ManageCustomerAccount);
			$scope.searchPartyRoleIn = {
				showActive: false,
				onlyVisible: true,
				showPartyRoleSpecification: true,
				partyRoleSpecifications: [{
					id: 1
				}, {
					id: 3
				}]
			};
			$scope.initStoreService();
                //carga combo tipologia
			$scope.listCustomerProblemTypePublic();
                //carga combo Tipo Entrada
			$scope.listEntryTypePublic();
                //carga Combo Estado
			$scope.listCustomerProblemPhasePublic();
                //carga Combo Situation
			$scope.listCustomerProblemSituationPublic();

		};
		$scope.updateEndDate = function() {
			if (!$scope.undertakeCPTrendAnalysisView.startDate) {
				$scope.undertakeCPTrendAnalysisView.endDate = null;
			}
		};
		$scope.onEGT_ManageCustomerAccount = function(event, data) {
			$scope.undertakeCPTrendAnalysisFunctionality.cuentaClienteDisabled = false;
			if (data.customerAccount) {
				$scope.undertakeCPTrendAnalysisView.cuentaClienteId = data.customerAccount.id;
			}
		};
		$scope.initStoreService = function() {
			var data = T3_StorageService.getItem({

				cgName: 'undertakeCPAnalysisState'
			});

			if (data) {
				if (data.sorted) {
					$scope.sorting = data.sorted;
				}
				if (data.query) {
					if ($scope.undertakeCPTrendAnalysisData.backShowDetailOfCPReport == false) {
						var queryAux = {
							partyRole: data.query.partyRole
						};

						data.query = queryAux;
					}
					$scope.setStateData(data.query, data.partyRole);
				}
			}
		};
		$scope.doStr_parse = function(data, _generate, str) {
			var str = str || '';
			angular.forEach(data, function(value, key) {
				var _str = str + key;
				if (angular.isObject(value)) {
					_str += '.';
					$scope.doStr_parse(value, _generate, _str);
				} else {
					_generate.push({
						node: _str,
						value: value
					});
				}

			});
			return _generate;
		};
		$scope.setStateData = function(data, partyRole) {
			var _generate = [];
			$scope.doStr_parse(data, _generate);
			var i = 0;
			var l = _generate.length;
			for (i; i < l; i++) {
				var pattern = $filter('filter')($scope.patternSate, {
					to: _generate[i].node
				})[0];

				var setter = $parse(pattern.from).assign;
				var assignValue = _generate[i].value;
				if (pattern.type === 'date') {
					if (assignValue && _generate[i].node === 'dateRange.endDateTime') {
						assignValue = new Date(new Date(assignValue).setDate(new Date(assignValue).getDate()));
					} else if (assignValue) {
						assignValue = new Date(assignValue);
					}
				}
				setter($scope, assignValue);
			}
			if (_generate.length > 0) {
				if (partyRole) {
					$scope.undertakeCPTrendAnalysisView.Cliente.NomApe = partyRole.name;
					$scope.undertakeCPTrendAnalysisData.partyRole = partyRole;
				}
                /*else if($scope.cgtUndertakeCPTrendAnalysisIn.customer){
                    $scope.getCustomerData();
                }*/

				if ($scope.undertakeCPTrendAnalysisData.backShowDetailOfCPReport == true) {
					$scope.buscar(true);
				}
			}
			if (data.customerProblemType && data.customerProblemType.id == 1) {
				$scope.undertakeCPTrendAnalysisFunctionality.verFactura = true;
			}
		};
		$scope.onListadoCuentas_OUT = function(event, data) {
			data = {
				customerAccount: [{
					id: 122222222223223313132123
				}]
			};
			$scope.CG_manageCustomerAccount_OUT = data.customerAccount;
			$scope.undertakeCPTrendAnalysisView.cuentasCliente = data.customerAccount;
		};
		$scope.onSearchPartyRole = function(event, data) {
			if ($scope.CG_searchPartyRole_OUT.party) {
				delete($scope.CG_searchPartyRole_OUT.party);
			}
		};
		$scope.onSelectedSearchPartyRole = function(event, data) {
			$scope.updateCustomerId(data);
			$scope.undertakeCPTrendAnalysisView.Cliente.NomApe = null;
		};
		$scope.updateCustomerId = function(data) {
			var i = 0;
			var l = data.party.partyRoles.length;
			for (i; i < l; i++) {
				if (Number(data.party.partyRoles[i].partyRoleSpecification.id) === 1 || Number(data.party.partyRoles[i].partyRoleSpecification.id) === 3) {
					$scope.CG_searchPartyRole_OUT.party = {
						partyRole: {
							id: data.party.partyRoles[i].id
						}
					};

					var dataUndertake = T3_StorageService.getItem({
						cgName: 'undertakeCPAnalysisState'
					});

					if (dataUndertake) {
						$scope.lastSearch.query = {};
						$scope.lastSearch.query.partyRole = {};
						$scope.lastSearch.query.partyRole.id = data.party.partyRoles[i].id;
						if (data.party.individualName) {
							$scope.lastSearch.partyRole.name = data.party.individualName.formattedName;
						} else {
							$scope.lastSearch.partyRole.name = data.party.organizationName.tradingName;
						}

						T3_StorageService.putItem({
							cgName: 'undertakeCPAnalysisState',
							data: $scope.lastSearch
						});
					}

					if (data.party.individualName) {
						$scope.undertakeCPTrendAnalysisData.partyRole.name = data.party.individualName.formattedName;
					} else {
						$scope.undertakeCPTrendAnalysisData.name = data.party.organizationName.tradingName;
					}
				}
				return true;
			}

			return false;
		};

		$scope.loadMultilanguageNew = function() {
			T3_CabeceraPresentacionService.resolveTranslationsCG('undertakeCPTrendAnalysis', gettextCatalog.currentLanguage);
			T3_LanguageService.getTecnicalEnum('undertakeCPTrendAnalysis', gettextCatalog.currentLanguage).then(function(data) {
				$scope.undertakeCPTrendAnalysisData.procede = data.selectProceedCP;
			});
		};

		$scope.closeSpinner = function() {
			$scope.spinners.splice(-1, 1);
			if ($scope.spinners.length === 0) {
				PopupService.CloseSpinner();
				$scope.isOpenSpinner = false;
			}
		};

		$scope.openSpinner = function() {
			$scope.spinners.push(1);
			if (!$scope.isOpenSpinner) {
				$scope.isOpenSpinner = true;
				PopupService.getSpinner($scope);
			}
		};

        //Función para averiguar el idioma en el que estamos actualmente
		$scope.averiguarIdioma = function(currentLanguage) {
			var languageId = T3_LanguageService.getTelcoCode(currentLanguage);
			if (Number(languageId) === 0) {
				var _base = {
					eu: 4,
					de: 8,
					gl: 3,
					en: 6,
					va: 5,
					it: 9,
					fr: 7,
					es: 1,
					ca: 2
				};
				currentLanguage = currentLanguage.split('_')[0];
				languageId = _base[currentLanguage];
			}
			return languageId;
		};

		$scope.getTranslate = function(arr) {
			if (!arr) {
				return '';
			}
			var i = 0;
			var l = arr.length;
			for (i; i < l; i++) {
				if (Number(arr[i].languageCode) === Number($scope.averiguarIdioma(gettextCatalog.currentLanguage)))
					return arr[i].value;
			}
			return '';
		};

		$scope.returnTooltipSpecial = function() {
			return ' - ';
		};

        /*Función para ir al detalle del problema  showDetailOfCPReport*/
		$scope.verDetalle = function(problema) {
			var cgtIN = {
				customerProblem: {
					id: problema.id
				},
				prevState: $state.current
			};
			$state.go('showDetailOfCPReport', {
				cgtShowDetailOfCPReportIn: cgtIN
			});

		};

		$scope.cambiarTipologia = function(seleccion) {

			switch (seleccion) {
			case 1:
				$scope.undertakeCPTrendAnalysisFunctionality.verFactura = true;
				break;
			default:
				$scope.undertakeCPTrendAnalysisFunctionality.verFactura = false;
				$scope.undertakeCPTrendAnalysisView.numeroFactura = '';
				break;
			}
		};
		$scope.eliminarSeleccionado = function(indice) {
			$scope.undertakeCPTrendAnalysisView.cuentasCliente.splice(indice, 1);
		};

		$scope.limpiarForm = function() {
			$scope.undertakeCPTrendAnalysisData.partyRole.name = void(0);

			$scope.undertakeCPTrendAnalysisView = {};
			$scope.undertakeCPTrendAnalysisView.cuentasCliente = [];
			$scope.undertakeCPTrendAnalysisView.datosPersonales = {};

			$scope.undertakeCPTrendAnalysisView.Cliente = {};
			$scope.undertakeCPTrendAnalysisView.Cliente.NomApe = '';
			$scope.undertakeCPTrendAnalysisView.cuentaClienteId = '';

			$scope.undertakeCPTrendAnalysisFunctionality.cuentaClienteDisabled = true;
			$scope.undertakeCPTrendAnalysisFunctionality.verFactura = false;

			$scope.cgtUndertakeCPTrendAnalysisIn = {};
			$scope.CG_searchPartyRole_OUT = {};

			$scope.searchPartyRoleIn = {
				showActive: false,
				onlyVisible: false,
				showPartyRoleSpecification: true,
				partyRoleSpecifications: [{
					id: 1
				}, {
					id: 3
				}]
			};

			var dataUndertake = T3_StorageService.getItem({
				cgName: 'undertakeCPAnalysisState'
			});

			if (dataUndertake) {
				dataUndertake.partyRole = {};
				dataUndertake.query = {};
				dataUndertake.sorted = {};

				$scope.lastSearch = dataUndertake;

				T3_StorageService.putItem({
					cgName: 'undertakeCPAnalysisState',
					data: $scope.lastSearch
				});
			}

			T3_StorageService.delItem({
				cgName: 'getCustomerServiceSuppEnquiry'
			});
		};

		$scope.getNumPageSearchCustomerProblem = function() {
			return $scope.numPageSearchCustomerProblem;
		};

		$scope.getNextPageSupportAreaRequest = function() {
			if ($scope.searchCustomerProblemTable && $scope.searchCustomerProblemTable.metadatos && $scope.searchCustomerProblemTable.metadatos.hayMas && ($scope.searchCustomerProblemTable.metadatos.hayMas === 'true' || $scope.searchCustomerProblemTable.metadatos.hayMas === true)) {
				$scope.numPageSearchCustomerProblem++;
				$scope.searchCustomerProblem($scope.searchCustomerProblem_IN());
			}
		};

		$scope.buscar = function(force_) {
			force_ = force_ || false;
			$scope.undertakeCPTrendAnalysisView.situacionesProblema =
                $scope.undertakeCPTrendAnalysisData.situacionesProblema;
            //var searchCustomerProblem_IN  = $scope.undertakeCPTrendAnalysisView;
			$scope.undertakeCPTrendAnalysisFunctionality.submitted = true;
			_correctFechas_and_comment = true;

			if (force_ || ($scope.undertakeCPTrendAnalysisForm.$valid && _correctFechas_and_comment)) {
				$scope.undertakeCPTrendAnalysisFunctionality.searchError = false;
				if (!force_) {
					$scope.sorting.field = 'endDate';
					$scope.sorting.mode = 'Desc';
					$scope.lastSearch.sorted = $scope.sorting;
				}

				$scope.searchCustomerProblem($scope.searchCustomerProblem_IN());
			}
		};

        //Logica para reordenar la tabla.
		$scope.reordenarTabla = function() {
			var orden = 'AD_searchCustomerProblem_CPintDateCompleteDesc_DSC';
			if ($scope.sorting.field) {
				orden = 'AD_searchCustomerProblem_' + $scope.generatefilter($scope.sorting.field) + '_DSC';
			}
			return orden;
		};

		$scope.generatefilter = function(field) {
			if (field === 'codigoVersion') {
				if ($scope.sorting.mode === 'Asc') {
					return 'CPcodeAsc';
				} else {
					return 'CPcodeDesc';
				}
			} else {
				if (field === 'clase') {
					if ($scope.sorting.mode === 'Asc') {
						return 'CPClassNameAsc';
					} else {
						return 'CPClassNameDesc';
					}
				} else {
					if (field === 'startDate') {
						if ($scope.sorting.mode === 'Asc') {
							return 'CPintDateAsc';
						} else {
							return 'CPintDateDesc';
						}
					} else {
						if (field === 'endDate') {
							if ($scope.sorting.mode === 'Asc') {
								return 'CPintDateCompleteAsc';
							} else {
								return 'CPintDateCompleteDesc';
							}
						}
					}
				}
			}
		};

		$scope.ordenarPor = function(field) {
			$scope.sorting.mode = field === $scope.sorting.field && $scope.sorting.mode == 'Asc' ? 'Desc' : 'Asc';
			$scope.sorting.field = field;

			$scope.lastSearch.sorted = $scope.sorting;
			$scope.searchCustomerProblem($scope.searchCustomerProblem_IN());
		};

		$scope.ordenSeleccionado = function(field) {
			if (field !== $scope.sorting.field) {
				return '';
			}
			return 'ordenable-' + ($scope.sorting.mode === 'Asc' ? 'false' : 'true');
		};

		$scope.manageCustomerAccount = function() {
			var param = {
				cgtManageCustomerAccountIn: {
					customer: {
						id: ($scope.cgtUndertakeCPTrendAnalysisIn.customer) ? $scope.cgtUndertakeCPTrendAnalysisIn.customer.id : $scope.CG_searchPartyRole_OUT.party.partyRole.id
					},
					action: 2
				}
			};
			PopupService.getPopup($scope, 'manageCustomerAccountControllerPopup', 'lg', 'cgt/manageCustomerAccount/manageCustomerAccountPopup_view.html', param);
		};

		$scope.getCustomerData_IN = function() {
			var _return = {};
			if ($scope.cgtUndertakeCPTrendAnalysisIn && $scope.cgtUndertakeCPTrendAnalysisIn.customer && $scope.cgtUndertakeCPTrendAnalysisIn.customer.id) {
				_return.customers = [{
					id: $scope.cgtUndertakeCPTrendAnalysisIn.customer.id
				}];
			}
			if ($scope.CG_searchPartyRole_OUT.party && $scope.CG_searchPartyRole_OUT.party.partyRole && $scope.CG_searchPartyRole_OUT.party.partyRole.id) {
				_return.customers = [{
					id: $scope.CG_searchPartyRole_OUT.party.partyRole.id
				}];
			}
			return _return;
		};

		$scope.getCustomerData = function() {
			undertakeCPTrendAnalysisService
                .getCustomerData($scope.getCustomerData_IN())
                .then(
                    function(data) {
	$scope.GetCustomerData_OUT = data.parties[0];
	if ($scope.GetCustomerData_OUT.individualName) {
		$scope.undertakeCPTrendAnalysisView.Cliente.NomApe = $scope.GetCustomerData_OUT.individualName.formattedName;
		$scope.undertakeCPTrendAnalysisData.partyRole.name = $scope.GetCustomerData_OUT.individualName.formattedName;

		var data = T3_StorageService.getItem({
			cgName: 'undertakeCPAnalysisState'
		});

		if (data) {
			$scope.lastSearch = data;
			$scope.lastSearch.partyRole.name = $scope.GetCustomerData_OUT.individualName.formattedName;
		}

		$scope.lastSearch.partyRole.name = $scope.GetCustomerData_OUT.individualName.formattedName;

		T3_StorageService.putItem({
			cgName: 'undertakeCPAnalysisState',
			data: $scope.lastSearch
		});

	} else {
		$scope.undertakeCPTrendAnalysisView.Cliente.NomApe = $scope.GetCustomerData_OUT.organizationName.tradingName;
	}
},
                    function(error) {
	T3_TrazaService.setTrazaError(CNT.name, 'Se ha detectado un error ' + error.code + ' en la llamada al servicio getCustomerData.');
	var auxError = {};
	if ((error.code === 500) && (error.mensaje1 !== void(0)) && (error.mensaje1 !== null)) {
		auxError.mensaje1 = error.mensaje1;
		auxError.mensaje2 = error.mensaje2;
		auxError.mensaje3 = error.mensaje3;
	}
	$scope.error();
}
                );
		};

		$scope.listCustomerProblemPhasePublic = function() {
			var ListCustomerProblemPhasePublic_IN = {
				'showall': true,
				'showAllLanguages': false
			};
			$scope.openSpinner();
			undertakeCPTrendAnalysisService.listCustomerProblemPhasePublic(ListCustomerProblemPhasePublic_IN, ['AD_listCustomerProblemType_nameAsc_DSC'])
                .then(function(data) {
	$scope.closeSpinner();
	$scope.ListCustomerProblemPhasePublic_OUT = data.customerProblemPhases;
	$scope.undertakeCPTrendAnalysisData.fasesProblema = data.customerProblemPhases;

}, function(error) {
	$scope.closeSpinner();
	$scope.error();
	T3_TrazaService.setTrazaError(CNT.name, 'Se ha detectado un error ' + error.code + ' en la llamada al servicio listCustomerProblemPhasePublic.');
	var auxError = {};
	if ((error.code === 500) && (error.mensaje1 !== void(0)) && (error.mensaje1 !== null)) {
		auxError.mensaje1 = error.mensaje1;
		auxError.mensaje2 = error.mensaje2;
		auxError.mensaje3 = error.mensaje3;
	}
});
		};

		$scope.listCustomerProblemSituationPublic = function() {
			var ListCustomerProblemSituationPublic_IN = {
				'showall': true,
				'showAllLanguages': false
			};
			$scope.openSpinner();
			undertakeCPTrendAnalysisService
                .listCustomerProblemSituationPublic(
                    ListCustomerProblemSituationPublic_IN, ['AD_listCustomerProblemType_nameAsc_DSC']
                ).then(function(data) {
	$scope.closeSpinner();
	$scope.ListCustomerProblemSituationPublic_OUT = data.cpSituations;
	$scope.undertakeCPTrendAnalysisData.situacionesProblema = data.cpsituations;
}, function(error) {
	$scope.closeSpinner();
	$scope.error();
	T3_TrazaService.setTrazaError(CNT.name, 'Se ha detectado un error ' + error.code + ' en la llamada al servicio listCustomerProblemSituationPublic.');
	var auxError = {};
	if ((error.code === 500) && (error.mensaje1 !== void(0)) && (error.mensaje1 !== null)) {
		auxError.mensaje1 = error.mensaje1;
		auxError.mensaje2 = error.mensaje2;
		auxError.mensaje3 = error.mensaje3;
	}
});
		};
		$scope.listCustomerProblemTypePublic = function() {
			var ListCustomerProblemTypePublic_IN = {
				'showall': true,
				'showAllLanguages': false
			};
			$scope.openSpinner();
			undertakeCPTrendAnalysisService
                .listCustomerProblemTypePublic(
                    ListCustomerProblemTypePublic_IN, ['AD_listCustomerProblemType_nameAsc_DSC']
                )
                .then(
                    function(data) {
	$scope.closeSpinner();
	$scope.ListCustomerProblemTypePublic_OUT = data.customerProblemTypes;
},
                    function(error) {
	$scope.closeSpinner();
	$scope.error();
	T3_TrazaService.setTrazaError(CNT.name, 'Se ha detectado un error ' + error.code + ' en la llamada al servicio listCustomerProblemTypePublic.');
	var auxError = {};
	if ((error.code === 500) && (error.mensaje1 !== void(0)) && (error.mensaje1 !== null)) {
		auxError.mensaje1 = error.mensaje1;
		auxError.mensaje2 = error.mensaje2;
		auxError.mensaje3 = error.mensaje3;
	}
}
                );
		};
		$scope.listEntryTypePublic = function() {
			var ListEntryTypePublic_IN = {};
			$scope.openSpinner();
			undertakeCPTrendAnalysisService
                .listEntryTypePublic(ListEntryTypePublic_IN)
                .then(function(data) {
	$scope.closeSpinner();
	$scope.ListEntryType_OUT = data.entryTypes;
	$scope.undertakeCPTrendAnalysisData.problemasCliente = data.entryTypes;

}, function(error) {
	$scope.closeSpinner();
	$scope.error();
	T3_TrazaService.setTrazaError(CNT.name, 'Se ha detectado un error ' + error.code + ' en la llamada al servicio listEntryTypePublic.');
	var auxError = {};
	if ((error.code === 500) && (error.mensaje1 !== void(0)) && (error.mensaje1 !== null)) {
		auxError.mensaje1 = error.mensaje1;
		auxError.mensaje2 = error.mensaje2;
		auxError.mensaje3 = error.mensaje3;
	}
});
		};

		$scope.searchCustomerProblem_IN = function() {
			var data = {};

			if ($scope.cgtUndertakeCPTrendAnalysisIn.customer && !$scope.CG_searchPartyRole_OUT.party) {
				data.partyRole = {
					id: $scope.cgtUndertakeCPTrendAnalysisIn.customer.id
				};
			} else if (!$scope.cgtUndertakeCPTrendAnalysisIn.customer && $scope.CG_searchPartyRole_OUT.party) {
				data.partyRole = {
					id: $scope.CG_searchPartyRole_OUT.party.partyRole.id
				};
			} else if ($scope.cgtUndertakeCPTrendAnalysisIn.customer && $scope.CG_searchPartyRole_OUT.party) {
				data.partyRole = {
					id: $scope.CG_searchPartyRole_OUT.party.partyRole.id
				};
			}
			if ($scope.undertakeCPTrendAnalysisData.partyRole &&
                $scope.undertakeCPTrendAnalysisData.partyRole.name) {
				$scope.lastSearch.partyRole.name = $scope.undertakeCPTrendAnalysisData.partyRole.name;
			}
			if ($scope.undertakeCPTrendAnalysisView.situacionProblema) {
				data.cpsituation = {
					'id': $scope.undertakeCPTrendAnalysisView.situacionProblema
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.numeroFactura) {
				data.customerBill = data.customerBill || {};
				data.customerBill = {
					'billNo': $scope.undertakeCPTrendAnalysisView.numeroFactura
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.codigo) {
				data.customerProblem = {
					'code': $scope.undertakeCPTrendAnalysisView.codigo
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.version) {
				data.customerProblem = data.customerProblem || {};
				data.customerProblem.reopenedCPNumber = $scope.undertakeCPTrendAnalysisView.version;
			}
			if ($scope.undertakeCPTrendAnalysisView.faseProblema) {
				data.customerProblemPhase = {
					'id': $scope.undertakeCPTrendAnalysisView.faseProblema
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.comentarios) {
				data.customerProblemTask = {
					'colcustomerComments': $scope.undertakeCPTrendAnalysisView.comentarios,
					'customerComments': $scope.undertakeCPTrendAnalysisView.comentarios
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.tipoProblema) {
				data.customerProblemType = {
					'id': $scope.undertakeCPTrendAnalysisView.tipoProblema
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.cuentaClienteId) {
				data.customerAccount = {
					'id': $scope.undertakeCPTrendAnalysisView.cuentaClienteId
				};
			}
			if ($scope.undertakeCPTrendAnalysisView.startDate) {
				data.dateRange = {
					'startDateTime': $scope.undertakeCPTrendAnalysisView.startDate
				};
				if ($scope.undertakeCPTrendAnalysisView.endDate) {
					data.dateRange.endDateTime = new Date(new Date($scope.undertakeCPTrendAnalysisView.endDate).setHours(23, 59, 59, 0));
                    //data.dateRange.endDateTime =  new Date(new Date($scope.undertakeCPTrendAnalysisView.endDate).setHours(24, 59, 59, 0));
				}
			}
			if ($scope.undertakeCPTrendAnalysisView.problemaCliente) {
				data.entryType = {
					'id': $scope.undertakeCPTrendAnalysisView.problemaCliente
				};
			}

			$scope.lastSearch.query = data;

			return data;
		};

		$scope.traducirUnumerado = function(valor) {
			var arr = $scope.undertakeCPTrendAnalysisData.procede;
			var i = 0;
			var l = arr.length;
			var _resp = valor;
			for (i; i < l; i++) {
				if (arr[i].etiqueta === valor) {
					_resp = arr[i].valor;
					break;
				}
			}
			return _resp;
		};$scope.searchCustomerProblem = function(SearchCustomerProblem_IN) {
			$scope.openSpinner();
			T3_StorageService.putItem({
				cgName: 'undertakeCPAnalysisState',
				data: $scope.lastSearch
			});
			undertakeCPTrendAnalysisService
                .searchCustomerProblem(
                    SearchCustomerProblem_IN, [$scope.reordenarTabla()],
                    $scope.getNumPageSearchCustomerProblem()
                )
                .then(function(data) {
	$scope.closeSpinner();
	if (data) {
		$scope.SearchCustomerProblem_OUT = data.customerProblems;
		$scope.searchCustomerProblemTable.metadatos = data.metadatos;
		data.metadatos.tamanoPagina = 100;
		data.metadatos.totalRegistros = '';
		if (Number(data.metadatos.numeroPagina) === 1) {
                            //$scope.tablaProblemasCliente.paginacion.currentPage = 1;
			$scope.datosSearchCustomerProblem = [];
		}
		if (Number(data.metadatos.numeroPagina) > 1 || Number($scope.searchCustomerProblemTable.metadatos.numeroPagina) <= Number(data.metadatos.numeroPagina)) {
			$scope.datosSearchCustomerProblem = $scope.datosSearchCustomerProblem.concat(data.customerProblems);
			$scope.tablaProblemasCliente.paginacion.currentPage = 1;
		}
		$scope.searchCustomerProblemTable = {
			datos: $scope.datosSearchCustomerProblem,
			metadatos: data.metadatos
		};
	}

}, function(error) {
	$scope.closeSpinner();
	T3_TrazaService.setTrazaError(CNT.name, 'Se ha detectado un error ' + error.code + ' en la llamada al servicio searchCustomerProblem.');
	var auxError = {};
	if ((error.code === 500) && (error.mensaje1 !== void(0)) && (error.mensaje1 !== null)) {
		auxError.mensaje1 = error.mensaje1;
		auxError.mensaje2 = error.mensaje2;
		auxError.mensaje3 = error.mensaje3;
	}

	$scope.errores = auxError;
	$scope.undertakeCPTrendAnalysisData.tablaProblemas = [];

	if ($scope.errores.mensaje2 === 'PRCL-E-00002') {
		$scope.SearchCustomerProblem_OUT = [];
	} else if ($scope.errores.mensaje2 === 'PRCL-E-000164' || $scope.errores.mensaje2 === 'PRCL-M-00013') {
		$scope.error(
                            gettextCatalog.getString('undertakeCPTrendAnalysis-titulo'),
                            gettextCatalog.getString('undertakeCPTrendAnalysis-PRCL-M-00013-title'),
                            gettextCatalog.getString('undertakeCPTrendAnalysis-PRCL-M-00013-sub-title')
                        );
		$scope.SearchCustomerProblem_OUT = [];
	} else {
		$scope.error();
	}

});
		};$scope.ok = function() {
			var options = {
				size: 'sm',
				tipoModal: 'ok',
				tituloModal: gettextCatalog.getString('gcli-adminBIItemActionCategory-gestionar-categoria-accion-sobre-oferta'),
				textoPrincipal: gettextCatalog.getString('GCLI-M-000101'),
				textoSecundario: '',
				textoPregunta: '',
				textoBtnAceptar: gettextCatalog.getString('gcli-adminBIItemActionCategory-popup-aceptar'),
				accionBtnAceptar: 'cerrarPopup()',
				textoBtnCancelar: '',
				accionBtnCancelar: ''
			};

			PopupService.getPopupGeneric($scope, 'adminBIItemActionCategoryPopupController', options);
		};

		$scope.error = function(title, subTitle, subSubTitle) {
			title = title || gettextCatalog.getString('undertakeCPTrendAnalysis-titulo');
			subTitle = subTitle || gettextCatalog.getString('undertakeCPTrendAnalysis-PRCL-M-000100-title');
			subSubTitle = subSubTitle || gettextCatalog.getString('undertakeCPTrendAnalysis-PRCL-M-000100-sub-title');
			var options = {
				size: 'sm',
				tipoModal: 'error',
				tituloModal: title,
				textoPrincipal: subTitle,
				textoSecundario: subSubTitle,
				textoPregunta: '',
				textoBtnAceptar: gettextCatalog.getString('undertakeCPTrendAnalysis-cerrar'),
				accionBtnAceptar: 'cerrarPopup()',
				textoBtnCancelar: '',
				accionBtnCancelar: ''
			};

			PopupService.getPopupGeneric($scope, 'undertakeCPTrendAnalysisCtrl', options);
		};
	}
]);
CNT.ngModule.controller('undertakeCPTrendAnalysisCtrl', ['$scope', '$modalInstance',
	function($scope, $modalInstance) {
		$scope.cerrarPopup =  function() {
			$modalInstance.close();
		};
	}
]);