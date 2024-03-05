# Additional features compliant with Empaia API 

## Availability of Default Scope

## Case hierarchy iterator + search (/extensions/case-explorer)
You can define hierarchy(structure) of cases by a simple regex separator and descriptor array.
You can search cases by key-value pairs, key is string, value is string or string[], depends on the key

## User Storage (/scope/storage)
You can store any key-value pair, where key is a string, and value is any value that can be turned into stringified json

## Masks (/extensions/masks)
Masks are stored as slides/wsi, mask has a specific identifier in local_id that identifies it as a mask. You can specify the place and value of identifier for the Masks class.

## Shared across users
<pre>
                                    | Primitives | Collections | Class |
Access from diff scopes with id     |     yes    |     yes     |       |
Query from diff scopes              |     no     |     no      |       |    - valid creator_id(scope) or job id required in query
Query coll items from diff scopes   |     ---    |     yes     |       |    - only references needed to query collection items, you need to know collectionId though
Delete item from collection         |            |     no      |       |    - cannot delete item from collection of different scope, this blocks update of slide metadata
</pre>