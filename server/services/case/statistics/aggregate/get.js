import { _req, _db, _val, _out } from "@netuno/server-types";

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

const query = `
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
          c.id,
          c.controller,
          c.summary,
          c.date,
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
  )
  SELECT
    dpa_country_code.code AS dpa_country_code,
    COALESCE(
      c.controller,
      c.summary,
      'No case info'
    ) AS case_info,
    COUNT(*) AS case_count
  FROM
    filtered_cases c
  JOIN dpa ON c.dpa_id = dpa.id
  JOIN dpa_country_code ON dpa.code_id = dpa_country_code.id
  WHERE c.date::date BETWEEN ?::date AND ?::date
  GROUP BY
    dpa_country_code.code,
    COALESCE(c.controller, c.summary, 'No case info')
  ORDER BY
    case_count DESC
`;

const results = _db.query(query, startDate, endDate);

_out.json(
  _val.map()
    .set("data", results)
    .set("result", true)
);
