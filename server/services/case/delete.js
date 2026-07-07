import { _db, _out, _val } from "@netuno/server-types";

_db.execute(`
    DELETE FROM "case";
`);

_out.json({result: true});
