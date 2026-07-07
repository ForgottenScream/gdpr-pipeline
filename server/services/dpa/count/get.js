import { _req, _db, _val, _out, _exec } from "@netuno/server-types";

const startDate = _req.getString("start_date");
let endDate = _req.getString("end_date");

// Validate start_date is provided
if (!startDate) {
  _out.json(_val.map().set("error", "start_date is required (format: YYYY-MM-DD)"));
  _exec.stop();
}

// Default end_date to today if not provided
if (!endDate) {
  endDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// Auto-correct reversed dates
if (startDate > endDate) {
  [startDate, endDate] = [endDate, startDate];
}

// Validate date formats
if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
  _out.json(_val.map().set("error", "Invalid date format. Use YYYY-MM-DD."));
  _exec.stop();
}

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
          "case".id AS case_id,
          "case".dpa_id,
          d.name AS dpa_name,
          dcc.code AS dpa_code,
          dst.type AS source_type
      FROM "case"
      JOIN dpa d ON "case".dpa_id = d.id
      JOIN dpa_source_type dst ON d.source_type_id = dst.id
      JOIN dpa_country_code dcc ON d.code_id = dcc.id
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
          AND "case".date::date BETWEEN ?::date AND ?::date
  )
  -- Final result: Count cases per DPA, preserving dpa_name, dpa_code, and source_type
  SELECT
      dpa_name,
      dpa_code,
      COUNT(case_id) AS case_count,
      source_type
  FROM filtered_cases
  GROUP BY dpa_name, dpa_code, source_type
  ORDER BY dpa_name;
`, startDate, endDate);

const data = _val.list();
for (const row of query) {
  data.add(
    _val.map()
      .set("dpa_name", row.getString("dpa_name"))
      .set("dpa_code", row.getString("dpa_code"))
      .set("case_count", row.getInt("case_count"))
      .set("source_type", row.getString("source_type"))
  );
}

_out.json(
  _val.map()
      .set("result", true)
      .set("data", data)
);
