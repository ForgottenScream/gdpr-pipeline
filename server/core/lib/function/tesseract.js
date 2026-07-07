import { _req, _remote, _header, _out, _exec, _storage, _uid, _os, _val, _log } from "@netuno/server-types";

function tesseract(url) {
    if (!url) {
        _log.error("No URL provided.");
        return { result: false, error: 'no-url-provided', pages: _val.list() };
    }

    const pdfFileResponse = _remote.setBinary(true).get(url);
    if (!pdfFileResponse.ok()) {
        _log.error("File download failed.");
        return { result: false, error: 'file-download-failed', pages: _val.list() };
    }

    const file = pdfFileResponse.file();

    if (!file.isExtension("pdf") || file.available() == 0) {
        return { result: false, error: 'file-not-pdf', pages: _val.list() };
    }

    const tempFolderName = _uid.generate();
    const storageTempFolder = _storage.filesystem("server", "temp/" + tempFolderName);
    storageTempFolder.folder().mkdirs();

    const storageTempPDFFile = _storage.filesystem("server", "temp/" + tempFolderName, "file.pdf");
    file.save(storageTempPDFFile.absolutePath());

    // Convert PDF to high-resolution PNG images
    const procPDFToImages = _os.initProcess();
    procPDFToImages.directory(storageTempFolder.absolutePath());
    procPDFToImages.setRedirectErrorStream(true);
    procPDFToImages.setReadOutput(true);
    const procPDFToImagesResult = procPDFToImages.execute(["pdftoppm", "-png", "-r", "300", "file.pdf", "page"]);
    if (procPDFToImagesResult.exitCode() !== 0) {
        _log.error("PDF to PPM @ Exit Code: " + procPDFToImagesResult.exitCode() + "\n" + procPDFToImagesResult.output());
        storageTempFolder.folder().deleteAll();
        return { result: false, error: 'pdf-to-images-failed', pages: _val.list() };
    }

    const languageCounts = _val.map();
    const pngFiles = _val.list();

    for (const f of storageTempFolder.folder().list()) {
        if (f.isExtension("png")) {
            pngFiles.add(f);
            let detectedLanguage = "eng";
            const procDetectLanguage = _os.initProcess();
            procDetectLanguage.directory(storageTempFolder.absolutePath());
            procDetectLanguage.setRedirectErrorStream(true);
            procDetectLanguage.setReadOutput(true);
            const procDetectLanguageResult = procDetectLanguage.execute(["tesseract", f.name(), "stdout", "--psm", "0", "-l", "osd"]);

            if (procDetectLanguageResult.exitCode() === 0) {
                const osdOutput = procDetectLanguageResult.output();
                const languageMatch = osdOutput.match(/Language: (\w+)/);
                detectedLanguage = languageMatch ? languageMatch[1] : "eng";
            } else {
                _log.warn(`Language detection failed for page ${f.name()}, defaulting to English.`);
            }

            // Count language occurrences
            const currentCount = languageCounts.getInt(detectedLanguage, 0);
            languageCounts.set(detectedLanguage, currentCount + 1);
        }
    }

    // Determine the most common language
    let dominantLanguage = "eng";
    let maxCount = 0;

    for (const lang of languageCounts.keys()) {
        const count = languageCounts.getInt(lang);
        if (count > maxCount) {
            maxCount = count;
            dominantLanguage = lang;
        }
    }

    _log.info(`Dominant language detected: ${dominantLanguage} (appeared ${maxCount} times)`);

    // CHANGED: Second pass - run OCR with dominant language
    const pagesInfos = _val.map();

    for (const f of pngFiles) {
        const procImageReader = _os.initProcess();
        procImageReader.directory(storageTempFolder.absolutePath());
        procImageReader.setRedirectErrorStream(true);
        procImageReader.setReadOutput(true);
        const procImageReaderResult = procImageReader.execute(["tesseract", f.name(), "-", "-l", dominantLanguage]);

        if (procImageReaderResult.exitCode() !== 0) {
            _log.error("Tesseract @ Exit Code: " + procImageReaderResult.exitCode() + "\n" + procImageReaderResult.output());
            pagesInfos.set(f.name(), "");
            continue;
        }
        pagesInfos.set(f.name(), procImageReaderResult.output());
    }

    storageTempFolder.folder().deleteAll();

    const pages = _val.list();
    for (const k of pagesInfos.keys()) {
        pages.add(pagesInfos.getString(k));
    }

    return { result: true, pages: pages };
}
