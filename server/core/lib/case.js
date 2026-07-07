import { _db, _group, _user, _val, _ws } from "@netuno/server-types";

function getData(uid) {
    const dbCase = _db.queryFirst(`
            SELECT
                case.uid,
                case.case_uid,
                case.controller,
                case.date,
                case.document_url,
                dpa.uid AS "dpa_uid",
                dpa.name AS "dpa_name",
                case.fine,
                case.legal_basis,
                case_sector.uid AS "sector_uid",
                case_sector.name AS "sector_name",
                case_type.uid AS "type_uid",
                case_type.name AS "type_name",
                case.summary,
                case.source
            FROM "case"
                INNER JOIN dpa ON case.dpa_id = dpa.id
                INNER JOIN case_sector ON case.sector_id = case_sector.id
                INNER JOIN case_type ON case.type_id = case_type.id
            WHERE case.uid = ?::uuid
            `, uid);

    if (dbCase) {
        return _val.map()
            .set("uid", dbCase.getUID("uid"))
            .set("caseUid", dbCase.getString("case_uid"))
            .set("controller", dbCase.getString("controller"))
            .set("date", dbCase.getString("date"))
            .set("documentUrl", dbCase.getString("document_url"))
            .set("dpa",
                _val.map()
                .set("uid", dbCase.getUID("dpa_uid"))
                .set("name", dbCase.getString("dpa_name"))
            )
            .set("fine", dbCase.getString("fine"))
            .set("legalBasis", dbCase.getString("legal_basis"))
            .set("sector",
                _val.map()
                .set("uid", dbCase.getUID("sector_uid"))
                .set("name", dbCase.getString("sector_name"))
            )
            .set("type",
                _val.map()
                .set("uid", dbCase.getUID("type_uid"))
                .set("name", dbCase.getString("type_name"))
            )
            .set("summary", dbCase.getString("summary"))
            .set("source", dbCase.getString("source"));
    }
    return null;
}

function getByDPA(dpaName) {
        return _db.query(`
            SELECT
                c.id,
                c.case_uid,
                c.controller,
                c.document_url;
                c.fine,
                c.date,
                cdq.quality AS "date quality",
                c.legal_basis AS "legal basis",
                cs.name AS sector,
                ct.name AS type,
                d.name,
                c.summary
                c.source
            FROM "case" c
            INNER JOIN case_sector cs ON c.sector_id = cs.id
            INNER JOIN case_type ct ON c.type_id = ct.id
            INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
            INNER JOIN dpa d ON c.dpa_id = d.id
            WHERE d.name = ?::varchar;
        `, dpaName);
}
