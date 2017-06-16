# Validaciones de código para el proyecto de TELCO

Usando Esprima, para válidar el proyecto, buscando patrones útiles.

npm i


- (makeValid.js) Validación de PopupService cantidad, posición y parámetros.
- (isUsedAllServices.js) Compara el service con el controller, para validar el uso de todas las operaciones definidas.
- (isTrazaError.js) Valida la insercion de setTrazaError en todos los KO de las operaciones.
- (unUsedFunctionsVars.js) Cual Funcion y Variable no se estan utilizando, para revisar si se quitan.
- (noMoreOneSubscribe.js) Localiza duplicado en el subscribe sobre el mismo evento
