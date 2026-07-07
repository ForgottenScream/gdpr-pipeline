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
          c.id AS case_id,
          c.fine,
          c.dpa_id
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
          AND c.date::date BETWEEN ?::date AND ?::date
  )
  -- Final result: Sum fines per country
  SELECT
      cc.name AS country_name,
      cc.code AS country_code,
      COALESCE(SUM(c.fine), 0) AS total_fines
  FROM dpa_country_code cc
  LEFT JOIN dpa ON dpa.code_id = cc.id
  LEFT JOIN filtered_cases c ON c.dpa_id = dpa.id
  GROUP BY cc.name, cc.code
  ORDER BY cc.name;
`, startDate, endDate);

const result = _val.list();

query.forEach((row) => {
    result.add(
        _val.map()
            .set("country_name", row.getString("country_name"))
            .set("country_code", row.getString("country_code"))
            .set("total_fines", row.getFloat("total_fines"))
    );
});

_out.json(result);
