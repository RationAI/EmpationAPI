# Additional features compliant with Empaia API 

## Availability of Default Scope

## Case hierarchy iterator + search (/extensions/case-explorer)
You can define hierarchy(structure) of cases by a simple regex separator and descriptor array.
You can search cases by key-value pairs, key is string, value is string or string[], depends on the key

## User Storage (/scope/storage)
You can store any key-value pair, where key is a string, and value is any value that can be turned into stringified json

## Masks (/extensions/masks)
Masks are stored as slides/wsi, mask has a specific identifier in local_id that identifies it as a mask. You can specify the place and value of identifier for the Masks class.

<pre>
a <--- b = object b references object a

slide <--- string primitive               
- contains stringified object with metadata for slide, including related vizualizations
  name: "Metadata of slide &ltlocal_id of slide&gt"
  reference_id: &ltlocal_id of slide&gt
  reference_type: "wsi"
  value: { 
    ...,
    visualizations: [{template: ..., data: [...]}, ...]
  }

mask <--- string primitive               
- contains stringified object with metadata for mask
  name: "Metadata of mask &ltlocal_id of mask&gt"
  reference_id: &ltlocal_id of slide&gt
  reference_type: "wsi"

default_case -has- default_slide <--- string primitive 
- contains data shared across cases
  vizTemplates: [..., &ltid of string primitive containing serialized template&gt, ...]

</pre>
## Shared across users
Primitives