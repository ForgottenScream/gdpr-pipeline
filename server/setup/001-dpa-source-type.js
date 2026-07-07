import { _val, _db, _log } from "@netuno/server-types"

const source_types = [
    {
        type: "Primary",
        uid: "b89a492c-cb28-4afb-b4b6-76ffcb76c425"
    },
    {
        type: "Secondary",
        uid: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    }
]

source_types.forEach((source) => {
    try {
        _db.insertIfNotExists("dpa_source_type", _val.map()
            .set("uid", source.uid)
            .set("type", source.type)
        )
    } catch (e) {
        _log.warn("error: source type not created", e);
    }
});
