import { _val, _db, _log } from "@netuno/server-types"

const dateQuality = [
    {
        quality: "Exact Date",
        uid: "525dbf74-a6d4-44e6-a096-bc422ac168e2"
    },
    {
        quality: "Unknown Date",
        uid: "487d1895-1cd0-422c-a2bc-c19a0bcb7005"
    },
    {
        quality: "Month Only",
        uid: "fe137c81-411c-47e0-b149-d4ca91b8817c"
    },
    {
        quality: "Year Only",
        uid: "a309071a-7ddc-4f5a-85f7-d84bca1e19c2"
    }
]

dateQuality.forEach((type) => {
    try {
        _db.insertIfNotExists("case_date_quality", _val.map()
            .set("uid", type.uid)
            .set("quality", type.quality)
        )
    } catch (e) {
        _log.warn("error: date quality not created", e);
    }
});
