import { _db, _out, _val } from "@netuno/server-types";

const query = _db.query(`
WITH
    -- Get all primary DPA names (e.g., "ICO", "CNIL")
    primary_dpas AS (
        SELECT d.name AS primary_name
        FROM dpa d
        JOIN dpa_source_type dst ON d.source_type_id = dst.id
        WHERE dst.type = 'Primary'
    ),
    -- Filter cases: Include only primary DPAs or secondary DPAs that don't match any primary DPA name
    filtered_cases AS (
        SELECT
            c.id AS case_id,
            c.controller,
            d.name AS dpa_name
        FROM "case" c
        JOIN dpa d ON c.dpa_id = d.id
        JOIN dpa_source_type dst ON d.source_type_id = dst.id
        WHERE
            -- Always include primary DPAs
            dst.type = 'Primary'
            OR
            -- For secondary DPAs, only include if their name does NOT contain any primary DPA name
            (
                dst.type = 'Secondary'
                AND NOT EXISTS (
                    SELECT 1
                    FROM primary_dpas pd
                    WHERE LOWER(d.name) LIKE '%' || LOWER(pd.primary_name) || '%'
                )
            )
    )
    -- Final result: Count cases per DPA name
    SELECT
        dpa_name AS "Name",
        COUNT(*) AS "Total Count"
    FROM filtered_cases
    GROUP BY dpa_name

    UNION ALL

    -- Total row
    SELECT
        'TOTAL' AS "Name",
        COUNT(*) AS "Total Count"
    FROM filtered_cases;

`)

_out.json(
    _val.map()
        .set("result", true)
        .set("data", query)
)
