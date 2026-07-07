import { _db, _csv, _storage, _os, _header, _out, _exec, _log } from "@netuno/server-types";

function createCSV() {
  const tablesAndColumnsQuery = _db.query(`
    SELECT
      c.table_name,
      c.column_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON c.table_schema = t.table_schema
      AND c.table_name = t.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT LIKE 'netuno%'
      AND c.column_name NOT IN ('group_id', 'lastchange_time', 'lastchange_user_id', 'active', 'lock', 'user_id', 'uid')
    ORDER BY c.table_name, c.ordinal_position;
  `);

  if (!tablesAndColumnsQuery || tablesAndColumnsQuery.length === 0) {
    throw new Error("No tables or columns found.");
  }

  const tableColumns = {};
  for (const row of tablesAndColumnsQuery) {
    const tableName = row.getString("table_name");
    const columnName = row.getString("column_name");

    if (!tableColumns[tableName]) {
      tableColumns[tableName] = [];
    }
    tableColumns[tableName].push(columnName);
  }

  for (const [tableName, columns] of Object.entries(tableColumns)) {
    const escapedTableName = _db.escape(tableName);
    const escapedColumns = columns.map(col => _db.escape(col));

    const tableData = _db.query(`SELECT ${escapedColumns.join(", ")} FROM ${escapedTableName}`);

    if (!tableData || tableData.length === 0) {
      _log.info(`No data found for table: ${tableName}`);
      continue;
    }

    const csvFile = _storage.filesystem("server", `${tableName}.csv`);
    const csvPrinter = _csv.printer(csvFile, _csv.format("EXCEL"));

    try {
      csvPrinter.printRecord(columns);

      for (const row of tableData) {
        const rowValues = columns.map(col => {
          let value = row.getString(col);
          if (value === null || value === undefined) {
            return "";
          }
          return value;
        });
        csvPrinter.printRecord(rowValues);
      }
    } finally {
      csvPrinter.close();
    }
  }
}

function downloadCSV() {
  const serverDir = _storage.filesystem("server", "");
  const serverPath = serverDir.absolutePath();

  const procZip = _os.initProcess();
  procZip.directory(serverPath);
  procZip.setRedirectErrorStream(true);
  procZip.setReadOutput(true);

  const procZipResult = procZip.execute(["zip", "tables.zip", "*.csv"]);

  if (procZipResult.exitCode() !== 0) {
    _log.error("Zip command failed @ Exit Code: " + procZipResult.exitCode() + "\n" + procZipResult.output());
    _header.status(500);
    _out.json({ result: false, error: "zip-failed" });
    _exec.stop();
  }

  _header.downloadFile("tables.zip");
  const zipFile = _storage.filesystem("server", "tables.zip");
  _out.copy(zipFile.input());

    const serverFolder = _storage.filesystem("server", "").folder();
    const files = serverFolder.list();

  for (const file of files) {
    if (file.getName().endsWith(".csv")) {
      file.delete();
    }
  }
}

// Execute the functions
createCSV();
downloadCSV();
