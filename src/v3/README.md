# Additional features compliant with Empaia API 

## Availability of Default Scope

## Case hierarchy iterator + search (/extensions/case-explorer)
You can define hierarchy(structure) of cases by a simple regex separator and descriptor array.
You can search cases by key-value pairs, key is string, value is string or string[], depends on the key

## User Storage (/scope/storage)
You can store any key-value pair, where key is a string, and value is any value that can be turned into stringified json

## Masks (/extensions/wsi-explorer)
Masks are stored as slides/wsi, mask has a specific identifier in local_id that identifies it as a mask. You can specify the place and value of identifier for the Masks class.

## Shared across users
Workbench API does not allow storing data shared across users, all data entities (primitives, collections, classes, ...) that could store data tied to slides, cases or global, are tied to some scope, and therefore cannot be efficiently used across more users. More detail in table below:
<pre>
                                    | Primitives | Collections | Class |
Access from diff scopes with id     |     yes    |     yes     |       |
Query from diff scopes              |     no     |     no      |       |    - valid creator_id(scope) or job id required in query
Query coll items from diff scopes   |     ---    |     yes     |       |    - only references needed to query collection items, you need to know collectionId though
Delete item from collection         |            |     no      |       |    - cannot delete item from collection of different scope, this blocks update of shared data
</pre>

# Additional features non-compliant with base Empaia API (without custom endpoints)

## Global storage (/rationai/global-storage)
Global storage endpoints were added to Workbench API (customization of Workbench Service and ID Mapper Service). More details in docs.

## Extensions using Global storage
### WSI Metadata (/extensions/wsi-metadata)
Metadata tied to slides/masks is stored as a global item that references the WSI(empaia ID of WSI, 'reference_type' is 'wsi'). Data type of the global item is slide_metadata or mask_metadata.
Metadata itself is stored in attribute 'value' where a JSON object is serialized as a string. The name is also in the format 'Metadata of [slide, mask] &lt;wsi id&gt;'

Slide metadata attributes:
visualization - contains object that references multiple visualization templates for different parts of visualization config and data for initialization of these templates
                wsi-metadata class contains method 'getVisualizations()', that takes slideId and creates the final visualization config for slide by initializing the templates referenced in the metadata.visualization

Mask metadata attributes:

### Visualization templates (/extensions/visualization-templates)
Globally accesible items without reference, 'data_type' of format 'vis_templates_&lt;template type&gt;' (currently template type can be 'params', 'background', 'shader', 'visualization').

