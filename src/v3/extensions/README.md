# EmpationAPI Library

In this folder, there are classes that don't directly map to the Empaia Workbench API, but offer additional logic/funcionality on top of the API. 

### Case explorer:

Allows searching and generating virtual hierarchy on cases by specified keys. To extend functionality to include more keys for searching/grouping, create a getter and evaluator and then map it on key value in mappers. These getters and evaluators are then used in filter/groupBy functions that process Cases.
