# RationAI endpoints (not compatible with unmodified Empaia)

For RationAI labs purposes, it was neede to extend the Workbench API (Workbench Service, ID Mapper Service, actual data is stored in ID Mapper DB)
This folder implements support for these endpoints

## Current endpoint groups

### Global Storage

Offers global storage, where items similar to string primitives can be stored, that are accesible across more users/scopes.
AUTH: the same token as for root API
