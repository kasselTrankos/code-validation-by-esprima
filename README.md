# Validaciones de código para el proyecto de TELCO

Usando Esprima, para válidar el proyecto, buscando patrones útiles.

npm i


- (makeValid.js) Validación de PopupService cantidad, posición y parámetros, con el parámetro de consola -o  genera html.
- (isUsedAllServices.js) Compara el service con el controller, para validar el uso de todas las operaciones definidas.
- (isTrazaError.js) Valida la insercion de setTrazaError en todos los KO de las operaciones.
- (unUsedFunctionsVars.js) Cual Funcion y Variable no se estan utilizando, para revisar si se quitan.
- (noMoreOneSubscribe.js) Localiza duplicado en el subscribe sobre el mismo evento
- (validStateOfShows.js) necesita que se le pase por consola -s nombre de estado ( pronto será más automático).
    + Por cada state a validar, necesita un pattrón que estan en /patternStates/ nombre state.json
- (validEachState.js) Localiza los States mal formados(url, params, loadCG, loadTemplate..), con el parámetro de consola -o  genera html.
- (genratePOM.js) Crea el pom.xml en raiz cgt, para luego poder ejecutar "mvn clean install" de una única vez para todos los cgt's.

