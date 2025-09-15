"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const pdfPoppler = require('pdf-poppler');
const sharp_1 = __importDefault(require("sharp"));
const archiver_1 = __importDefault(require("archiver"));
// Authentication imports
const auth_1 = __importDefault(require("./routes/auth"));
const security_1 = require("./middleware/security");
const auth_2 = require("./middleware/auth");
const auth_3 = require("./lib/auth");
const database_1 = __importDefault(require("./lib/database"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Create uploads and temp directories
const uploadsDir = path_1.default.join(__dirname, '../uploads');
const tempDir = path_1.default.join(__dirname, '../temp');
fs_extra_1.default.ensureDirSync(uploadsDir);
fs_extra_1.default.ensureDirSync(tempDir);
// Security middleware
app.use(security_1.securityHeaders);
app.use((0, cors_1.default)(security_1.corsOptions));
app.use(security_1.generalRateLimit);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(security_1.sanitizeInput);
// Authentication routes
app.use('/api/auth', security_1.authRateLimit, auth_1.default);
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.originalname;
        const extension = path_1.default.extname(originalName);
        const baseName = path_1.default.basename(originalName, extension);
        cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept Word, Excel, PowerPoint, and PDF files
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'application/vnd.ms-powerpoint', // .ppt
            'application/pdf', // .pdf
        ];
        const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'];
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only Word, Excel, PowerPoint, and PDF files are allowed!'));
        }
    }
});
// Helper function to convert file to PDF using LibreOffice
async function convertToPDF(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        console.log(`Converting ${inputFileName} to PDF...`);
        // LibreOffice command to convert to PDF
        const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execAsync(command, {
            timeout: 30000 // 30 seconds timeout
        });
        if (stderr) {
            console.warn('LibreOffice stderr:', stderr);
        }
        console.log('LibreOffice stdout:', stdout);
        // The output PDF will be in the temp directory with .pdf extension
        const outputPdfPath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}.pdf`);
        // Check if the PDF was created
        if (await fs_extra_1.default.pathExists(outputPdfPath)) {
            console.log(`✅ Conversion successful: ${outputPdfPath}`);
            return outputPdfPath;
        }
        else {
            throw new Error('PDF file was not created by LibreOffice');
        }
    }
    catch (error) {
        console.error('❌ Conversion error:', error);
        throw new Error(`Failed to convert file to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to convert PDF to JPG using pdf-poppler and sharp
async function convertPDFToJPG(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        console.log(`Converting ${inputFileName} to JPG...`);
        // First, get the page count to understand what we're dealing with
        try {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            const { stdout } = await execAsync(`pdfinfo "${inputPath}"`);
            const pageMatch = stdout.match(/Pages:\s*(\d+)/);
            const pageCount = pageMatch ? parseInt(pageMatch[1]) : 1;
            console.log(`📊 PDF has ${pageCount} page(s) according to pdfinfo`);
        }
        catch (pdfInfoError) {
            console.log('⚠️ Could not get page count with pdfinfo, proceeding with conversion...');
        }
        let opts = {
            format: 'jpeg',
            out_dir: outputDir,
            out_prefix: inputFileNameWithoutExt,
            page: null // null = all pages
        };
        // Convert all PDF pages to images using pdf-poppler
        const pdfInfo = await pdfPoppler.convert(inputPath, opts);
        console.log("✅ PDF pages converted via Poppler");
        console.log("🔍 Poppler conversion info:", pdfInfo);
        // Get the number of pages by checking the generated files
        const files = await fs_extra_1.default.readdir(outputDir);
        console.log("🗂️ All files in output directory:", files);
        const convertedFiles = files
            .filter(file => file.startsWith(inputFileNameWithoutExt) &&
            file.endsWith('.jpg') &&
            !file.includes('_page_') // Exclude already processed files
        )
            .sort((a, b) => {
            // Extract page numbers for proper sorting
            const aNum = parseInt(a.match(/-(\d+)\.jpg$/)?.[1] || '1');
            const bNum = parseInt(b.match(/-(\d+)\.jpg$/)?.[1] || '1');
            return aNum - bNum;
        });
        console.log(`📋 Found ${convertedFiles.length} converted files:`, convertedFiles);
        const jpgPaths = [];
        // Process each page with sharp for optimization
        for (let i = 0; i < convertedFiles.length; i++) {
            const inputFile = path_1.default.join(outputDir, convertedFiles[i]);
            const pageNumber = i + 1;
            const outputFile = path_1.default.join(outputDir, `${inputFileNameWithoutExt}_page_${pageNumber}.jpg`);
            console.log(`🔄 Processing file ${i + 1}/${convertedFiles.length}: ${convertedFiles[i]}`);
            // Check if the input file exists
            if (await fs_extra_1.default.pathExists(inputFile)) {
                try {
                    // Use Sharp to optimize the JPG
                    await (0, sharp_1.default)(inputFile)
                        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({
                        quality: 95,
                        mozjpeg: true,
                        progressive: true
                    })
                        .toFile(outputFile);
                    jpgPaths.push(outputFile);
                    console.log(`✅ Successfully processed page ${pageNumber}: ${outputFile}`);
                    // Clean up the original file from pdf-poppler
                    await fs_extra_1.default.remove(inputFile);
                }
                catch (sharpError) {
                    console.error(`❌ Sharp processing failed for ${inputFile}:`, sharpError);
                    // Continue with other files
                }
            }
            else {
                console.error(`❌ Input file not found: ${inputFile}`);
            }
        }
        console.log(`🎯 Final result: ${jpgPaths.length} files processed successfully`);
        if (jpgPaths.length === 0) {
            throw new Error('No pages were converted from the PDF');
        }
        console.log(`✅ PDF conversion successful: ${jpgPaths.length} pages converted`);
        return jpgPaths;
    }
    catch (error) {
        console.error('❌ PDF to JPG conversion error:', error);
        throw new Error(`Failed to convert PDF to JPG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to convert PDF to Office formats using LibreOffice
async function convertPDFToOffice(inputPath, outputFormat) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        console.log(`📄 Converting ${inputFileName} to ${outputFormat.toUpperCase()}...`);
        console.log(`📁 Input path: ${inputPath}`);
        console.log(`📁 Output directory: ${outputDir}`);
        // Check if input file exists
        if (!await fs_extra_1.default.pathExists(inputPath)) {
            throw new Error(`Input PDF file not found: ${inputPath}`);
        }
        // Get file stats for debugging
        const stats = await fs_extra_1.default.stat(inputPath);
        console.log(`📏 Input file size: ${stats.size} bytes`);
        // Try multiple LibreOffice approaches for better PDF handling
        const commands = [
            // Method 1: Using Draw import filter (best for PDFs)
            `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --infilter="draw_pdf_import" --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`,
            // Method 2: Standard conversion without filter
            `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`,
            // Method 3: Basic conversion (fallback)
            `soffice --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`
        ];
        let lastError = null;
        let stdout = '';
        let stderr = '';
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            console.log(`🔧 Attempt ${i + 1}: ${command}`);
            try {
                const result = await execAsync(command, {
                    timeout: 90000, // 90 seconds timeout for PDF conversions
                    env: { ...process.env, HOME: outputDir } // Set custom HOME to avoid permission issues
                });
                stdout = result.stdout;
                stderr = result.stderr;
                console.log(`📤 LibreOffice stdout (attempt ${i + 1}): ${stdout || '(empty)'}`);
                if (stderr) {
                    console.warn(`⚠️ LibreOffice stderr (attempt ${i + 1}): ${stderr}`);
                }
                // Check if output file was created after this attempt
                const filesInDir = await fs_extra_1.default.readdir(outputDir);
                const targetFiles = filesInDir.filter(file => file.endsWith(`.${outputFormat}`));
                if (targetFiles.length > 0) {
                    console.log(`✅ Conversion successful with method ${i + 1}`);
                    break; // Success, exit the retry loop
                }
                else {
                    console.warn(`⚠️ Method ${i + 1} completed but no output file found`);
                }
            }
            catch (execError) {
                lastError = execError instanceof Error ? execError : new Error('Unknown execution error');
                console.warn(`⚠️ Method ${i + 1} failed: ${lastError.message}`);
                if (i === commands.length - 1) {
                    // This was the last attempt
                    throw lastError;
                }
            }
        }
        // Check for multiple possible output file names that LibreOffice might create
        const possibleOutputPaths = [
            path_1.default.join(outputDir, `${inputFileNameWithoutExt}.${outputFormat}`),
            path_1.default.join(outputDir, `input.${outputFormat}`), // In case LibreOffice uses the actual filename
            path_1.default.join(outputDir, `document.${outputFormat}`) // Default name sometimes used
        ];
        // List all files in output directory for debugging
        try {
            const filesInDir = await fs_extra_1.default.readdir(outputDir);
            console.log(`📋 Files in output directory: ${filesInDir.join(', ')}`);
        }
        catch (dirError) {
            console.warn(`⚠️ Could not read output directory: ${dirError}`);
        }
        // Find the actual output file
        let outputFilePath = null;
        for (const possiblePath of possibleOutputPaths) {
            if (await fs_extra_1.default.pathExists(possiblePath)) {
                outputFilePath = possiblePath;
                console.log(`✅ Found output file: ${outputFilePath}`);
                break;
            }
        }
        // If no file found with expected names, look for any file with the target extension
        if (!outputFilePath) {
            try {
                const filesInDir = await fs_extra_1.default.readdir(outputDir);
                const targetFiles = filesInDir.filter(file => file.endsWith(`.${outputFormat}`));
                if (targetFiles.length > 0) {
                    outputFilePath = path_1.default.join(outputDir, targetFiles[0]);
                    console.log(`✅ Found output file by extension: ${outputFilePath}`);
                }
            }
            catch (dirError) {
                console.warn(`⚠️ Could not search for output files: ${dirError}`);
            }
        }
        if (outputFilePath && await fs_extra_1.default.pathExists(outputFilePath)) {
            const outputStats = await fs_extra_1.default.stat(outputFilePath);
            console.log(`✅ Conversion successful: ${outputFilePath} (${outputStats.size} bytes)`);
            return outputFilePath;
        }
        else {
            // Enhanced error message with more details
            const errorDetails = [
                `PDF to ${outputFormat.toUpperCase()} conversion failed`,
                `Input file: ${inputPath} (${stats.size} bytes)`,
                `Expected output: ${possibleOutputPaths[0]}`,
                `LibreOffice stdout: ${stdout || '(empty)'}`,
                `LibreOffice stderr: ${stderr || '(empty)'}`
            ].join('\n');
            console.error(`❌ ${errorDetails}`);
            // Provide helpful error message with troubleshooting tips
            const helpfulMessage = [
                `❌ PDF to ${outputFormat.toUpperCase()} conversion failed.`,
                ``,
                `🔍 Possible reasons:`,
                `• The PDF may be image-based (scanned document) rather than text-based`,
                `• The PDF may be password-protected or have security restrictions`,
                `• The PDF structure may not be compatible with LibreOffice conversion`,
                `• LibreOffice has limited capabilities for PDF-to-Office conversions`,
                ``,
                `💡 Suggestions:`,
                `• Try with a PDF that was originally created from ${outputFormat.toUpperCase()} (not scanned)`,
                `• Ensure the PDF is not password-protected`,
                `• For scanned PDFs, consider using OCR tools first`,
                `• For complex layouts, manual recreation may be more effective`
            ].join('\n');
            throw new Error(helpfulMessage);
        }
    }
    catch (error) {
        console.error(`❌ PDF to ${outputFormat.toUpperCase()} conversion error:`, error);
        if (error instanceof Error && (error.message.includes('PDF to') && error.message.includes('conversion failed'))) {
            throw error; // Re-throw our detailed error message
        }
        throw new Error(`Failed to convert PDF to ${outputFormat.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to convert PDF to Word using pdf2docx (for text-based PDFs)
async function convertPDFToWordWithPdf2docx(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const outputFilePath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}.docx`);
        console.log(`📄 Converting text-based PDF to Word using pdf2docx: ${inputFileName}`);
        console.log(`📁 Input path: ${inputPath}`);
        console.log(`📁 Output path: ${outputFilePath}`);
        // Check if input file exists
        if (!await fs_extra_1.default.pathExists(inputPath)) {
            throw new Error(`Input PDF file not found: ${inputPath}`);
        }
        // Get file stats for debugging
        const stats = await fs_extra_1.default.stat(inputPath);
        console.log(`📏 Input file size: ${stats.size} bytes`);
        // Path to Python PDF to Word converter script
        const converterScriptPath = path_1.default.join(__dirname, '../ocr-service/pdf_to_word_converter.py');
        // Check if Python script exists
        if (!await fs_extra_1.default.pathExists(converterScriptPath)) {
            throw new Error(`PDF to Word converter script not found: ${converterScriptPath}`);
        }
        // Prepare Python command for text-based PDF conversion
        // Use full Python path to avoid PATH issues
        const pythonExecutable = 'C:\\Users\\taaee\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
        const pythonCommand = `"${pythonExecutable}" "${converterScriptPath}" "${inputPath}" "${outputFilePath}"`;
        console.log(`🔧 Executing pdf2docx conversion: ${pythonCommand}`);
        const { stdout, stderr } = await execAsync(pythonCommand, {
            timeout: 120000, // 2 minutes timeout
            cwd: path_1.default.dirname(converterScriptPath)
        });
        console.log(`📤 pdf2docx stdout: ${stdout}`);
        if (stderr) {
            console.warn(`⚠️ pdf2docx stderr: ${stderr}`);
        }
        // Check if output file was created
        if (await fs_extra_1.default.pathExists(outputFilePath)) {
            const outputStats = await fs_extra_1.default.stat(outputFilePath);
            console.log(`✅ pdf2docx conversion successful! Output file: ${outputFilePath} (${outputStats.size} bytes)`);
            return outputFilePath;
        }
        else {
            throw new Error(`Output file not created: ${outputFilePath}`);
        }
    }
    catch (error) {
        console.error(`❌ PDF to Word conversion with pdf2docx failed:`, error);
        throw new Error(`Failed to convert PDF to Word using pdf2docx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to detect PDF type (text-based vs image-based/scanned)
async function detectPDFType(inputPath) {
    try {
        console.log(`🔍 Analyzing PDF type: ${inputPath}`);
        // Use pdftotext to extract text content
        const command = `pdftotext "${inputPath}" -`;
        const { stdout, stderr } = await execAsync(command, {
            timeout: 30000,
            encoding: 'utf8'
        });
        if (stderr) {
            console.warn(`⚠️ pdftotext stderr: ${stderr}`);
        }
        const extractedText = stdout.trim();
        const textLength = extractedText.length;
        const meaningfulTextLength = extractedText.replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').length;
        console.log(`📝 Extracted text length: ${textLength} characters`);
        console.log(`📝 Meaningful text length: ${meaningfulTextLength} characters`);
        // Heuristics to determine if PDF is text-based or image-based
        if (meaningfulTextLength < 50) {
            console.log(`📷 PDF appears to be image-based (scanned) - very little text extracted`);
            return 'image-based';
        }
        else if (meaningfulTextLength > 200) {
            console.log(`📄 PDF appears to be text-based - substantial text content found`);
            return 'text-based';
        }
        else {
            // For borderline cases, check text density
            try {
                const pagesCommand = `pdfinfo "${inputPath}"`;
                const { stdout: pdfInfo } = await execAsync(pagesCommand, { timeout: 10000 });
                const pagesMatch = pdfInfo.match(/Pages:\s*(\d+)/);
                const pageCount = pagesMatch ? parseInt(pagesMatch[1]) : 1;
                const textPerPage = meaningfulTextLength / pageCount;
                if (textPerPage > 30) {
                    console.log(`📄 PDF appears to be text-based - decent text density per page`);
                    return 'text-based';
                }
                else {
                    console.log(`📷 PDF appears to be image-based - low text density per page`);
                    return 'image-based';
                }
            }
            catch (pdfInfoError) {
                console.warn(`⚠️ Could not get page count, defaulting based on text length`);
                return meaningfulTextLength > 100 ? 'text-based' : 'image-based';
            }
        }
    }
    catch (error) {
        console.error(`❌ Error detecting PDF type:`, error);
        console.log(`🔄 Defaulting to text-based conversion attempt`);
        return 'text-based'; // Default to text-based if detection fails
    }
}
// Enhanced PDF to PowerPoint conversion function
async function convertPDFToPowerPointEnhanced(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const outputFilePath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}_enhanced.pptx`);
        console.log(`🚀 Enhanced PDF to PowerPoint conversion started`);
        console.log(`📁 Input: ${inputPath}`);
        console.log(`📁 Output: ${outputFilePath}`);
        // Check if input file exists
        if (!await fs_extra_1.default.pathExists(inputPath)) {
            throw new Error(`Input PDF file not found: ${inputPath}`);
        }
        // Prepare Python command for enhanced converter
        const pythonScript = path_1.default.join(__dirname, '..', 'ocr-service', 'enhanced_pdf_to_ppt_converter.py');
        // Try different Python executables in order of preference
        const pythonExecutables = [
            'C:\\Users\\taaee\\AppData\\Local\\Programs\\Python\\Python313\\python.exe',
            'python',
            'python3',
            'py'
        ];
        let pythonExecutable = 'python';
        for (const exe of pythonExecutables) {
            try {
                if (exe.includes(':\\')) {
                    // Full path - check if file exists
                    if (await fs_extra_1.default.pathExists(exe)) {
                        pythonExecutable = exe;
                        break;
                    }
                }
                else {
                    // Command name - use as is (will be tested during execution)
                    pythonExecutable = exe;
                }
            }
            catch {
                continue;
            }
        }
        const command = `"${pythonExecutable}" "${pythonScript}" "${inputPath}" "${outputFilePath}" --ocr-engine tesseract --dpi 200`;
        console.log(`🐍 Executing enhanced Python converter: ${command}`);
        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 300000, // 5 minutes timeout
                encoding: 'utf8',
                cwd: path_1.default.dirname(pythonScript)
            });
            if (stderr && !stderr.includes('WARNING') && !stderr.includes('INFO')) {
                console.warn(`⚠️ Enhanced converter stderr:`, stderr);
            }
            if (stdout) {
                console.log(`📄 Enhanced converter output:`, stdout);
            }
            // Check if output file was created
            if (!await fs_extra_1.default.pathExists(outputFilePath)) {
                throw new Error(`Enhanced converter did not create output file: ${outputFilePath}`);
            }
            const stats = await fs_extra_1.default.stat(outputFilePath);
            console.log(`✅ Enhanced PowerPoint conversion successful: ${outputFilePath} (${stats.size} bytes)`);
            return outputFilePath;
        }
        catch (execError) {
            console.error(`❌ Enhanced Python converter execution failed:`, execError);
            throw new Error(`Enhanced PowerPoint conversion failed: ${execError instanceof Error ? execError.message : 'Unknown error'}`);
        }
    }
    catch (error) {
        console.error(`❌ Enhanced PDF to PowerPoint conversion failed:`, error);
        throw new Error(`Enhanced conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to convert PDF using OCR (for scanned/image-based PDFs)
async function convertPDFWithOCR(inputPath, outputFormat) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const outputFilePath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}_ocr.${outputFormat}`);
        console.log(`🤖 Converting scanned PDF using OCR: ${inputFileName}`);
        console.log(`📁 Input: ${inputPath}`);
        console.log(`📁 Output: ${outputFilePath}`);
        // Path to Python OCR script
        const ocrScriptPath = path_1.default.join(__dirname, '../ocr-service/pdf_ocr_converter.py');
        // Check if Python OCR script exists
        if (!await fs_extra_1.default.pathExists(ocrScriptPath)) {
            throw new Error(`OCR script not found: ${ocrScriptPath}`);
        }
        // Prepare Python command (using tesseract as it's more reliable)
        // Use full Python path to avoid PATH issues
        const pythonExecutable = 'C:\\Users\\taaee\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
        const pythonCommand = `"${pythonExecutable}" "${ocrScriptPath}" "${inputPath}" "${outputFilePath}" --format ${outputFormat} --ocr-engine tesseract --dpi 200`;
        console.log(`🔧 Executing OCR: ${pythonCommand}`);
        // Clean environment to avoid LibreOffice Python conflicts
        const cleanEnv = { ...process.env };
        // Remove LibreOffice paths from PATH if they exist
        if (cleanEnv.PATH) {
            cleanEnv.PATH = cleanEnv.PATH
                .split(';')
                .filter(pathPart => !pathPart.toLowerCase().includes('libreoffice'))
                .join(';');
        }
        const { stdout, stderr } = await execAsync(pythonCommand, {
            timeout: 300000, // 5 minutes timeout for OCR processing
            env: cleanEnv,
            cwd: path_1.default.dirname(ocrScriptPath)
        });
        console.log(`📤 OCR stdout: ${stdout}`);
        if (stderr) {
            console.warn(`⚠️ OCR stderr: ${stderr}`);
        }
        // Parse result from Python script
        let ocrResult;
        try {
            // Look for SUCCESS or ERROR JSON in the output
            const successMatch = stdout.match(/✅ SUCCESS: ({.*})/);
            const errorMatch = stdout.match(/❌ ERROR: ({.*})/);
            if (successMatch) {
                ocrResult = JSON.parse(successMatch[1]);
                console.log(`🎉 OCR Success: ${ocrResult.pages_processed} pages, ${ocrResult.total_characters} characters`);
            }
            else if (errorMatch) {
                const errorInfo = JSON.parse(errorMatch[1]);
                throw new Error(`OCR processing failed: ${errorInfo.error}`);
            }
            else {
                console.warn(`⚠️ Could not parse OCR result, checking for output file...`);
            }
        }
        catch (parseError) {
            console.warn(`⚠️ Could not parse OCR result JSON: ${parseError}`);
        }
        // Verify output file was created
        if (await fs_extra_1.default.pathExists(outputFilePath)) {
            const outputStats = await fs_extra_1.default.stat(outputFilePath);
            console.log(`✅ OCR conversion successful: ${outputFilePath} (${outputStats.size} bytes)`);
            return outputFilePath;
        }
        else {
            throw new Error(`OCR conversion failed - output file not created: ${outputFilePath}`);
        }
    }
    catch (error) {
        console.error(`❌ OCR conversion error:`, error);
        throw new Error(`Failed to convert PDF using OCR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to convert PDF to Word using OCR + pdf2docx (for scanned/image-based PDFs)
async function convertPDFToWordWithOCR(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const outputFilePath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}_ocr.docx`);
        console.log(`🤖 Converting scanned PDF to Word using advanced OCR + layout reconstruction + font detection: ${inputFileName}`);
        console.log(`📁 Input: ${inputPath}`);
        console.log(`📁 Output: ${outputFilePath}`);
        // Path to Python PDF to Word converter script
        const converterScriptPath = path_1.default.join(__dirname, '../ocr-service/pdf_to_word_converter.py');
        // Check if Python script exists
        if (!await fs_extra_1.default.pathExists(converterScriptPath)) {
            throw new Error(`PDF to Word converter script not found: ${converterScriptPath}`);
        }
        // Prepare Python command for scanned PDF conversion with enhanced OCR
        // Use full Python path to avoid PATH issues
        const pythonExecutable = 'C:\\Users\\taaee\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
        const pythonCommand = `"${pythonExecutable}" "${converterScriptPath}" "${inputPath}" "${outputFilePath}" --is-scanned --dpi 300`;
        console.log(`🔧 Executing advanced OCR + layout reconstruction + font detection: ${pythonCommand}`);
        // Clean environment to avoid LibreOffice Python conflicts
        const cleanEnv = { ...process.env };
        // Remove LibreOffice paths from PATH if they exist
        if (cleanEnv.PATH) {
            cleanEnv.PATH = cleanEnv.PATH
                .split(';')
                .filter(pathPart => !pathPart.toLowerCase().includes('libreoffice'))
                .join(';');
        }
        const { stdout, stderr } = await execAsync(pythonCommand, {
            timeout: 300000, // 5 minutes timeout for OCR processing
            env: cleanEnv,
            cwd: path_1.default.dirname(converterScriptPath)
        });
        console.log(`📤 Advanced OCR + layout reconstruction stdout: ${stdout}`);
        if (stderr) {
            console.warn(`⚠️ OCR + pdf2docx stderr: ${stderr}`);
        }
        // Parse result from Python script
        let conversionResult;
        try {
            // Extract JSON from the output (it should be the last line starting with SUCCESS: or ERROR:)
            const lines = stdout.trim().split('\n');
            const resultLine = lines.find(line => line.startsWith('SUCCESS:') || line.startsWith('ERROR:'));
            if (resultLine) {
                const jsonStr = resultLine.replace(/^(SUCCESS:|ERROR:)\s*/, '');
                conversionResult = JSON.parse(jsonStr);
            }
            else {
                throw new Error('No result found in conversion output');
            }
        }
        catch (parseError) {
            console.error('❌ Failed to parse conversion result:', parseError);
            throw new Error(`OCR + pdf2docx processing failed - could not parse result: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
        if (!conversionResult.success) {
            throw new Error(`OCR + pdf2docx conversion failed: ${conversionResult.error || 'Unknown conversion error'}`);
        }
        // Check if output file exists
        if (!await fs_extra_1.default.pathExists(outputFilePath)) {
            throw new Error(`OCR + pdf2docx output file not found: ${outputFilePath}`);
        }
        const outputStats = await fs_extra_1.default.stat(outputFilePath);
        console.log(`✅ OCR + pdf2docx conversion successful: ${outputFilePath} (${outputStats.size} bytes)`);
        console.log(`📊 Conversion method: ${conversionResult.method}`);
        return outputFilePath;
    }
    catch (error) {
        console.error(`❌ OCR + pdf2docx conversion failed:`, error);
        throw new Error(`Failed to convert PDF using OCR + pdf2docx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Unified PDF to Office conversion function with smart routing
async function convertPDFToOfficeWithDetection(inputPath, outputFormat) {
    try {
        console.log(`🚀 Starting intelligent PDF to ${outputFormat.toUpperCase()} conversion`);
        // Step 1: Detect PDF type
        const pdfType = await detectPDFType(inputPath);
        console.log(`📊 PDF Type Detection Result: ${pdfType}`);
        let outputFilePath;
        // Special handling for Word (docx) conversion using pdf2docx
        if (outputFormat === 'docx') {
            if (pdfType === 'text-based') {
                // Step 2a: Use pdf2docx for text-based PDFs
                console.log(`📄 Using pdf2docx for text-based PDF to Word conversion`);
                try {
                    outputFilePath = await convertPDFToWordWithPdf2docx(inputPath);
                    console.log(`✅ pdf2docx conversion successful`);
                    return outputFilePath;
                }
                catch (pdf2docxError) {
                    console.warn(`⚠️ pdf2docx conversion failed, falling back to OCR + pdf2docx: ${pdf2docxError}`);
                    console.log(`🔄 Attempting OCR + pdf2docx conversion as fallback...`);
                    outputFilePath = await convertPDFToWordWithOCR(inputPath);
                    console.log(`✅ OCR + pdf2docx fallback conversion successful`);
                    return outputFilePath;
                }
            }
            else {
                // Step 2b: Use OCR + pdf2docx for image-based/scanned PDFs
                console.log(`📷 Using OCR + pdf2docx for scanned PDF to Word conversion`);
                outputFilePath = await convertPDFToWordWithOCR(inputPath);
                console.log(`✅ OCR + pdf2docx conversion successful`);
                return outputFilePath;
            }
        }
        else if (outputFormat === 'pptx') {
            // For PowerPoint, use the enhanced converter
            console.log(`🎯 Using enhanced PowerPoint converter`);
            outputFilePath = await convertPDFToPowerPointEnhanced(inputPath);
            console.log(`✅ Enhanced PowerPoint conversion successful`);
            return outputFilePath;
        }
        else {
            // For Excel, use the existing LibreOffice + OCR approach
            if (pdfType === 'text-based') {
                // Step 2a: Use LibreOffice for text-based PDFs
                console.log(`📄 Using LibreOffice conversion for text-based PDF`);
                try {
                    outputFilePath = await convertPDFToOffice(inputPath, outputFormat);
                    console.log(`✅ LibreOffice conversion successful`);
                    return outputFilePath;
                }
                catch (libreOfficeError) {
                    console.warn(`⚠️ LibreOffice conversion failed, falling back to OCR: ${libreOfficeError}`);
                    console.log(`🔄 Attempting OCR conversion as fallback...`);
                    outputFilePath = await convertPDFWithOCR(inputPath, outputFormat);
                    console.log(`✅ OCR fallback conversion successful`);
                    return outputFilePath;
                }
            }
            else {
                // Step 2b: Use OCR for image-based/scanned PDFs
                console.log(`📷 Using OCR conversion for image-based/scanned PDF`);
                outputFilePath = await convertPDFWithOCR(inputPath, outputFormat);
                console.log(`✅ OCR conversion successful`);
                return outputFilePath;
            }
        }
    }
    catch (error) {
        console.error(`❌ Intelligent PDF conversion failed:`, error);
        throw new Error(`Failed to convert PDF to ${outputFormat.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to clean up files
async function cleanupFiles(...filePaths) {
    for (const filePath of filePaths) {
        try {
            if (await fs_extra_1.default.pathExists(filePath)) {
                await fs_extra_1.default.remove(filePath);
                console.log(`🗑️ Cleaned up: ${filePath}`);
            }
        }
        catch (error) {
            console.error(`Failed to cleanup ${filePath}:`, error);
        }
    }
}
// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'PDF Converter API is running with Intelligent OCR!',
        features: {
            'Smart PDF Detection': 'Automatically detects text-based vs image-based PDFs',
            'pdf2docx Integration': 'Uses pdf2docx for superior PDF to Word conversion',
            'Enhanced PowerPoint Conversion': 'Advanced PDF to PPT with font, color, and layout preservation',
            'OCR + pdf2docx': 'OCR processing followed by pdf2docx for scanned PDFs',
            'Editable Elements': 'Creates editable text boxes, tables, and formatted content',
            'Multiple OCR Engines': 'Supports Tesseract and EasyOCR'
        },
        endpoints: {
            'POST /convert': 'Convert Word/Excel/PowerPoint files to PDF',
            'POST /pdf-to-jpg': 'Convert PDF files to JPG images',
            'POST /pdf-to-word': 'Intelligent PDF to Word conversion (pdf2docx + OCR)',
            'POST /pdf-to-excel': 'Intelligent PDF to Excel conversion (LibreOffice + OCR)',
            'POST /pdf-to-powerpoint': 'Enhanced PDF to PowerPoint conversion with layout preservation and editable elements'
        }
    });
});
// Main conversion route (protected - requires authentication)
app.post('/convert', auth_2.authenticate, upload.single('file'), async (req, res) => {
    let inputFilePath;
    let outputFilePath;
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select a Word, Excel, or PowerPoint file.'
            });
        }
        inputFilePath = req.file.path;
        const originalFileName = req.file.originalname;
        const fileExtension = path_1.default.extname(originalFileName).toLowerCase();
        console.log(`📁 Received file: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert to PDF using LibreOffice
        outputFilePath = await convertToPDF(inputFilePath);
        // Read the converted PDF
        const pdfBuffer = await fs_extra_1.default.readFile(outputFilePath);
        // Set response headers for PDF download
        const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        console.log(`📤 Sending PDF: ${outputFileName} (${pdfBuffer.length} bytes)`);
        // Send the PDF file
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('❌ Conversion failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred during conversion'
        });
    }
    finally {
        // Clean up uploaded and converted files
        if (inputFilePath) {
            await cleanupFiles(inputFilePath);
        }
        if (outputFilePath) {
            await cleanupFiles(outputFilePath);
        }
    }
});
// PDF to JPG conversion route (protected - requires authentication)
app.post('/pdf-to-jpg', auth_2.authenticate, upload.single('file'), async (req, res) => {
    let inputFilePath;
    let outputFilePaths = [];
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select a PDF file.'
            });
        }
        inputFilePath = req.file.path;
        const originalFileName = req.file.originalname;
        const fileExtension = path_1.default.extname(originalFileName).toLowerCase();
        // Check if it's a PDF file
        if (fileExtension !== '.pdf') {
            return res.status(400).json({
                success: false,
                error: 'Only PDF files are allowed for JPG conversion.'
            });
        }
        console.log(`📁 Received PDF file: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert PDF to JPG
        outputFilePaths = await convertPDFToJPG(inputFilePath);
        console.log(`🔍 Conversion result: ${outputFilePaths.length} files generated`);
        console.log(`📄 Output files:`, outputFilePaths.map(path => path.split('/').pop()));
        if (outputFilePaths.length === 1) {
            // Single page - send the JPG file directly
            const jpgBuffer = await fs_extra_1.default.readFile(outputFilePaths[0]);
            const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.jpg`;
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
            res.setHeader('Content-Length', jpgBuffer.length.toString());
            console.log(`📤 Sending JPG: ${outputFileName} (${jpgBuffer.length} bytes)`);
            res.send(jpgBuffer);
        }
        else {
            // Multiple pages - create a ZIP file
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}_pages.zip`;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
            // Handle archiver events
            archive.on('error', (err) => {
                console.error('❌ Archive error:', err);
                throw err;
            });
            archive.on('warning', (err) => {
                if (err.code === 'ENOENT') {
                    console.warn('Archive warning:', err);
                }
                else {
                    throw err;
                }
            });
            // Pipe archive data to the response
            archive.pipe(res);
            // Add each JPG file to the ZIP
            for (let i = 0; i < outputFilePaths.length; i++) {
                const jpgPath = outputFilePaths[i];
                const jpgFileName = `page_${i + 1}.jpg`;
                // Check if file exists before adding
                if (await fs_extra_1.default.pathExists(jpgPath)) {
                    archive.file(jpgPath, { name: jpgFileName });
                    console.log(`📎 Added ${jpgFileName} to ZIP`);
                }
                else {
                    console.error(`❌ JPG file not found: ${jpgPath}`);
                }
            }
            // Finalize the archive
            console.log('🗜️ Finalizing ZIP archive...');
            await archive.finalize();
            console.log(`📤 Sending ZIP with ${outputFilePaths.length} JPG files: ${outputFileName}`);
        }
    }
    catch (error) {
        console.error('❌ PDF to JPG conversion failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred during PDF to JPG conversion'
        });
    }
    finally {
        // Clean up uploaded and converted files
        if (inputFilePath) {
            await cleanupFiles(inputFilePath);
        }
        if (outputFilePaths.length > 0) {
            await cleanupFiles(...outputFilePaths);
        }
    }
});
// PDF to Word conversion route (protected - requires authentication)
app.post('/pdf-to-word', auth_2.authenticate, upload.single('file'), async (req, res) => {
    let inputFilePath;
    let outputFilePath;
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select a PDF file.'
            });
        }
        inputFilePath = req.file.path;
        const originalFileName = req.file.originalname;
        const fileExtension = path_1.default.extname(originalFileName).toLowerCase();
        // Check if it's a PDF file
        if (fileExtension !== '.pdf') {
            return res.status(400).json({
                success: false,
                error: 'Only PDF files are allowed for Word conversion.'
            });
        }
        console.log(`📁 Received PDF file for Word conversion: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert PDF to Word using intelligent routing
        outputFilePath = await convertPDFToOfficeWithDetection(inputFilePath, 'docx');
        // Read the converted Word document
        const wordBuffer = await fs_extra_1.default.readFile(outputFilePath);
        // Set response headers for Word download
        const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.setHeader('Content-Length', wordBuffer.length.toString());
        console.log(`📤 Sending Word document: ${outputFileName} (${wordBuffer.length} bytes)`);
        // Send the Word file
        res.send(wordBuffer);
    }
    catch (error) {
        console.error('❌ PDF to Word conversion failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred during PDF to Word conversion'
        });
    }
    finally {
        // Clean up uploaded and converted files
        if (inputFilePath) {
            await cleanupFiles(inputFilePath);
        }
        if (outputFilePath) {
            await cleanupFiles(outputFilePath);
        }
    }
});
// PDF to Excel conversion route (protected - requires authentication)
app.post('/pdf-to-excel', auth_2.authenticate, upload.single('file'), async (req, res) => {
    let inputFilePath;
    let outputFilePath;
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select a PDF file.'
            });
        }
        inputFilePath = req.file.path;
        const originalFileName = req.file.originalname;
        const fileExtension = path_1.default.extname(originalFileName).toLowerCase();
        // Check if it's a PDF file
        if (fileExtension !== '.pdf') {
            return res.status(400).json({
                success: false,
                error: 'Only PDF files are allowed for Excel conversion.'
            });
        }
        console.log(`📁 Received PDF file for Excel conversion: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert PDF to Excel using intelligent routing
        outputFilePath = await convertPDFToOfficeWithDetection(inputFilePath, 'xlsx');
        // Read the converted Excel document
        const excelBuffer = await fs_extra_1.default.readFile(outputFilePath);
        // Set response headers for Excel download
        const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.setHeader('Content-Length', excelBuffer.length.toString());
        console.log(`📤 Sending Excel document: ${outputFileName} (${excelBuffer.length} bytes)`);
        // Send the Excel file
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('❌ PDF to Excel conversion failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred during PDF to Excel conversion'
        });
    }
    finally {
        // Clean up uploaded and converted files
        if (inputFilePath) {
            await cleanupFiles(inputFilePath);
        }
        if (outputFilePath) {
            await cleanupFiles(outputFilePath);
        }
    }
});
// PDF to PowerPoint conversion route (protected - requires authentication)
app.post('/pdf-to-powerpoint', auth_2.authenticate, upload.single('file'), async (req, res) => {
    let inputFilePath;
    let outputFilePath;
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select a PDF file.'
            });
        }
        inputFilePath = req.file.path;
        const originalFileName = req.file.originalname;
        const fileExtension = path_1.default.extname(originalFileName).toLowerCase();
        // Check if it's a PDF file
        if (fileExtension !== '.pdf') {
            return res.status(400).json({
                success: false,
                error: 'Only PDF files are allowed for PowerPoint conversion.'
            });
        }
        console.log(`📁 Received PDF file for PowerPoint conversion: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert PDF to PowerPoint using intelligent routing
        outputFilePath = await convertPDFToOfficeWithDetection(inputFilePath, 'pptx');
        // Read the converted PowerPoint document
        const pptBuffer = await fs_extra_1.default.readFile(outputFilePath);
        // Set response headers for PowerPoint download
        const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.pptx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.setHeader('Content-Length', pptBuffer.length.toString());
        console.log(`📤 Sending PowerPoint document: ${outputFileName} (${pptBuffer.length} bytes)`);
        // Send the PowerPoint file
        res.send(pptBuffer);
    }
    catch (error) {
        console.error('❌ PDF to PowerPoint conversion failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred during PDF to PowerPoint conversion'
        });
    }
    finally {
        // Clean up uploaded and converted files
        if (inputFilePath) {
            await cleanupFiles(inputFilePath);
        }
        if (outputFilePath) {
            await cleanupFiles(outputFilePath);
        }
    }
});
// Admin routes
app.get('/api/admin/users', auth_2.authenticate, auth_2.adminOnly, async (req, res) => {
    try {
        const users = await database_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                provider: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: { users },
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
});
app.patch('/api/admin/users/:userId/role', auth_2.authenticate, auth_2.adminOnly, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!['ADMIN', 'USER'].includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Invalid role. Must be ADMIN or USER',
            });
            return;
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true,
            },
        });
        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user: updatedUser },
        });
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role',
        });
    }
});
// Clean expired sessions on server start
(async () => {
    try {
        await auth_3.AuthService.cleanExpiredSessions();
        console.log('✅ Cleaned expired sessions');
    }
    catch (error) {
        console.error('Failed to clean expired sessions:', error);
    }
})();
// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 50MB.'
            });
        }
    }
    // Use our custom error handler
    (0, security_1.errorHandler)(error, req, res, next);
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 PDF Converter API running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`📁 Temp directory: ${tempDir}`);
    console.log('📋 Supported formats: .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf');
    console.log('🔄 PDF to JPG conversion available with Poppler + Sharp pipeline');
});
exports.default = app;
//# sourceMappingURL=server.js.map