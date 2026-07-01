# mirror-source — layer-organized (cautionary)

**Input** (an app organized by technical layer):
```
api/
  src/controllers/  src/services/  src/repositories/  src/models/
  package.json
```
**Detected:** `src/` is **layer-organized**, not feature-first.
**Skill behavior:** mirroring a layer tree inherits the highest placement burden (a feature smears
across every layer folder, and layer folders have no testable surface → no behavioral leaves). The
skill **warns** and **recommends `capability-first`** instead (layering nests *inside* a capability).
**Expected:** the redirected `capability-first` tree (the cautionary lesson — do not mirror layers).
