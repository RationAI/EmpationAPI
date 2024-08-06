# V3
Folder contains classes implementing selected endpoints of Workbench API v3. Apart from these, classes implementing additional logic on top of the API are implemented in the extensions folder.
Methods of extension classes are documented, as their functionality can't be derived from API. In contrast, classes that map the Workbench API contain only methods for specific endpoints, which are documented in the API description of WBS.

# Extensions compliant with EMPAIA API

## Availability of Default Scope

## Case hierarchy iterator + search (/extensions/case-explorer)

You can define hierarchy(structure) of cases by a simple regex separator and descriptor array.
You can search cases by key-value pairs, key is string, value is string or string[], depends on the key

## Masks (/extensions/wsi-explorer)

Class provides retireval of slides and also masks(pixel-level data).
Masks are stored as slides/wsi, mask has a specific identifier in local_id that identifies it as a mask. You can specify the place and value of identifier for the WsiExplorer class.

## User Storage (/scope/storage)

You can store any key-value pair, where key is a string, and value is any value that can be turned into stringified json. As EMPAIA stores all the values in a single object, EmpationAPI handles storing of key-pair(retrieving existing object, adding new key-pair, storing new object).

# Limitations of WorkbenchAPI

Workbench API does not allow storing user-created data shared across users, all data entities (primitives, collections, classes, ...) that could store data tied to slides, cases or global, are tied to some scope, and therefore cannot be efficiently used across more users. More detail in table below:

<pre>
                                    | Primitives | Collections | Class |
Access from diff scopes with id     |     yes    |     yes     |  yes  |
Query from diff scopes              |     no     |     no      |  no   |    - valid creator_id(scope) or job id required in query
Query coll items from diff scopes   |     ---    |     yes     |  ---  |    - only references needed to query collection items, you need to know collectionId though
Delete item from collection         |     ---    |     no      |  ---  |    - cannot delete item from collection of different scope, this blocks update of shared data
</pre>

Workbench API also limits sizes of values stored. E.g. string primitive values are limited to 200 characters.

### Queries (in general)
Queries usually require either ``creators`` or `jobs` set. Setting both is invalid. Querying only
``references`` is invalid. This is not documented anywhere.


### Annotations
Annotations cannot be created by user, only by a scope. That means
 - we are unable to show the user annotations within the same slide, but on a different examination
 - we cannot set reference as user, i.e. we cannot search annotations that belong to a given user, 
   but we must go through all user's scopes first


# Additional features non-compliant with base EMPAIA API (without custom endpoints)

## Global storage (/rationai/global-storage)

Global storage endpoints were added to Workbench API (customization of Workbench Service and ID Mapper Service).

## Extensions using Global storage

### WSI Metadata (/extensions/wsi-metadata)

Metadata tied to slides/masks is stored as a global item that references the WSI(empaia ID of WSI, 'reference_type' is 'wsi'). Data type of the global item is slide_metadata or mask_metadata.
Metadata itself is stored in attribute 'value' where a JSON object is serialized as a string. The name is also in the format 'Metadata of [slide, mask] &lt;wsi id&gt;'

Slide metadata attributes:
visualization - contains object that references multiple visualization templates for different parts of visualization config and data for initialization of these templates
wsi-metadata class contains method 'getVisualizations()', that takes slideId and creates the final visualization config for slide by initializing the templates referenced in the metadata.visualization

Mask metadata attributes:
NONE FOR NOW

### Visualization templates (/extensions/visualization-templates)

Globally accesible items without reference, 'data_type' of format 'vis_templates_&lt;template type&gt;' (currently template type can be 'params', 'background', 'shader', 'visualization').

### Annotation presets (/extensions/annot-presets)

We assume annotation presets are global for deployment, and one object with data_type "annot_presets" exists. Here all the presets are stored in a serialized array. When it does not exist and GET is performed, an empty one is created. Update changes the whole array (new presets, edit old presets). Since presets are global, two parallel updates can happen. The first one succeeds, second succeeds partially, new presets are created, but the edits to the old ones and deletion of old ones are not performed, since that could overwrite changes of first update. This behaviour can be overruled by argument in update method. This would mean the second update fails, no changes are performed.

Global item:
{
presets: [...]
}

### Job config (/extensions/job-config)
Used to store custom EAD-like configs. Case browser uses these configs to create xOpat sessions out of completed jobs. 
Config example:
```
{
   "name":"Prostate job",
   "description":"This is a description of prostate job",
   "appId":"4e485b74-413e-477d-8e09-2c38ae57e582",
   "visProtocol":"`{\"type\":\"leav3\",\"pixelmap\":\"${data.join(',')}\"}`",
   "modes":{
      "preprocessing":{
         "inputs":{
            "my_wsi":{
               "_layer_loc":"background",
               "lossless":false,
               "protocol":"`{\"type\":\"leav3\",\"slide\":\"${data}\"}`"
            }
         },
         "outputs":{
            "probability_mask":{
               "_layer_loc":"shader",
               "name":"Cancer prediction",
               "type":"heatmap",
               "visible":1,
               "params":{
                  "opacity":0.5
               }
            },
            "background_mask":{
               "_layer_loc":"shader",
               "name":"Mask",
               "type":"heatmap",
               "visible":1,
               "params":{
                  "threshold":0.5,
                  "use_mode":"mask_clip"
               }
            }
         }
      }
   }
}
```
