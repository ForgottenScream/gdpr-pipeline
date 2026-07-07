import { _val, _db, _out } from "@netuno/server-types";

const query = _db.query(`
SELECT COUNT(*) FROM "case"
WHERE is_processed = true
`);

_out.json(query);
