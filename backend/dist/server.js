"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const sharp_1 = __importDefault(require("sharp"));
const archiver_1 = __importDefault(require("archiver"));
// Authentication imports
const auth_1 = __importDefault(require("./routes/auth"));
const fileRecords_1 = __importDefault(require("./routes/fileRecords"));
const systemLogs_1 = __importDefault(require("./routes/systemLogs"));
const contact_1 = __importDefault(require("./routes/contact"));
const security_1 = require("./middleware/security");
const auth_2 = require("./middleware/auth");
const auth_3 = require("./lib/auth");
const database_1 = __importDefault(require("./lib/database"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Dynamic import for pdf-poppler (only on non-Linux platforms)
async function loadPdfPoppler() {
    if (process.platform === 'linux') {
        throw new Error('pdf-poppler not available on Linux');
    }
    return await Promise.resolve().then(() => __importStar(require('pdf-poppler')));
}
// Cross-platform Python executable detection
async function findPythonExecutable() {
    const pythonExecutables = [
        'python',
        'python3',
        'py'
    ];
    // Add platform-specific paths
    if (process.platform === 'win32') {
        pythonExecutables.unshift('C:\\Python\\python.exe');
        pythonExecutables.unshift('C:\\Python39\\python.exe');
        pythonExecutables.unshift('C:\\Python310\\python.exe');
        pythonExecutables.unshift('C:\\Python311\\python.exe');
        pythonExecutables.unshift('C:\\Python312\\python.exe');
        pythonExecutables.unshift('C:\\Python313\\python.exe');
    }
    else {
        pythonExecutables.unshift('/usr/bin/python3');
        pythonExecutables.unshift('/usr/local/bin/python3');
        pythonExecutables.unshift('/opt/python3/bin/python3');
    }
    for (const exe of pythonExecutables) {
        try {
            if (path_1.default.isAbsolute(exe)) {
                // Full path - check if file exists
                if (await fs_extra_1.default.pathExists(exe)) {
                    return exe;
                }
            }
            else {
                // Command name - test if it's available
                try {
                    await execAsync(`${exe} --version`, { timeout: 5000 });
                    return exe;
                }
                catch {
                    // Continue to next executable
                    continue;
                }
            }
        }
        catch {
            // Continue to next executable
            continue;
        }
    }
    // Fallback to 'python' if nothing else works
    return 'python';
}
// Utility function to log system events
async function logSystemEvent(params) {
    try {
        const { type, message, details, userId, userEmail, severity, req } = params;
        // Get client info if request is provided
        const ipAddress = req ? (req.ip || req.connection.remoteAddress || 'unknown') : undefined;
        const userAgent = req ? req.get('User-Agent') || 'unknown' : undefined;
        await database_1.default.systemLog.create({
            data: {
                type,
                message,
                details,
                userId,
                userEmail,
                severity,
                ipAddress,
                userAgent
            }
        });
        console.log(`📝 System log created: ${type} - ${message}`);
    }
    catch (error) {
        console.error('❌ Failed to create system log:', error);
    }
}
// Comprehensive conversion tracking function
async function trackBackendConversion(params) {
    try {
        const { toolType, originalFileName, convertedFileName, fileSize, userId, status = 'COMPLETED', req } = params;
        // Get client info for tracking
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        // Create conversion record
        await database_1.default.conversion.create({
            data: {
                userId,
                originalFileName,
                convertedFileName,
                toolType,
                fileSize,
                status,
                processingLocation: 'BACKEND',
                isAuthenticated: !!userId,
                ipAddress,
                userAgent
            }
        });
        // Create file record for FileManagement component (only for authenticated users)
        if (userId) {
            await database_1.default.fileRecord.create({
                data: {
                    filename: originalFileName,
                    fileType: mapToolToFileType(toolType),
                    originalExtension: getFileExtension(originalFileName),
                    uploadedById: userId,
                    status: mapConversionStatusToFileStatus(status),
                    fileSize,
                    downloadUrl: convertedFileName ? `/downloads/${convertedFileName}` : undefined,
                    errorMessage: status === 'FAILED' ? 'Conversion failed' : undefined
                }
            });
        }
        // Update user total conversions if authenticated
        if (userId) {
            await database_1.default.user.update({
                where: { id: userId },
                data: {
                    totalConversions: {
                        increment: 1
                    }
                }
            });
        }
        console.log(`✅ Tracked backend conversion: ${toolType} for ${userId ? 'authenticated' : 'anonymous'} user`);
        // Log successful conversion
        await logSystemEvent({
            type: 'USER_ACTION',
            message: `File conversion completed: ${toolType}`,
            details: `File: ${originalFileName}, Size: ${fileSize} bytes, Status: ${status}`,
            userId,
            userEmail: userId ? undefined : undefined, // Will be populated by user lookup if needed
            severity: 'LOW',
            req
        });
    }
    catch (error) {
        console.error('❌ Failed to track backend conversion:', error);
        // Log conversion tracking error
        await logSystemEvent({
            type: 'SYSTEM_ERROR',
            message: 'Failed to track conversion in database',
            details: `Tool: ${params.toolType}, File: ${params.originalFileName}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            userId: params.userId,
            severity: 'MEDIUM',
            req: params.req
        });
    }
}
// Helper functions for file type mapping
function mapToolToFileType(toolType) {
    const mapping = {
        'word-to-pdf': 'WORD',
        'excel-to-pdf': 'EXCEL',
        'powerpoint-to-pdf': 'POWERPOINT',
        'pdf-to-word': 'PDF',
        'pdf-to-excel': 'PDF',
        'pdf-to-powerpoint': 'PDF',
        'pdf-to-jpg': 'PDF'
    };
    return mapping[toolType] || 'OTHER';
}
function getFileExtension(filename) {
    return path_1.default.extname(filename).toLowerCase() || '.unknown';
}
function mapConversionStatusToFileStatus(status) {
    const mapping = {
        'COMPLETED': 'COMPLETED',
        'FAILED': 'FAILED',
        'PENDING': 'PENDING',
        'PROCESSING': 'CONVERTING'
    };
    return mapping[status] || 'PENDING';
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Trust proxy for Railway deployment (handles X-Forwarded-For headers)
app.set('trust proxy', 1);
// Create uploads and temp directories
const uploadsDir = path_1.default.join(__dirname, '../uploads');
const tempDir = path_1.default.join(__dirname, '../temp');
fs_extra_1.default.ensureDirSync(uploadsDir);
fs_extra_1.default.ensureDirSync(tempDir);
// Security middleware
app.use(security_1.securityHeaders);
app.use((0, cors_1.default)(security_1.corsOptions));
app.use(security_1.generalRateLimit);
app.use((0, cookie_parser_1.default)()); // Parse HTTP-only cookies
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(security_1.sanitizeInput);
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        res.json({ db: 'connected', status: 'ok' });
    }
    catch (e) {
        res.status(500).json({ db: 'disconnected', error: e.message });
    }
});
// Authentication routes
app.use('/api/auth', security_1.authRateLimit, auth_1.default);
// File records routes
app.use('/api', fileRecords_1.default);
// System logs routes
app.use('/api', systemLogs_1.default);
// Contact form routes
app.use('/api', contact_1.default);
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
        const fileExtension = path_1.default.extname(inputPath).toLowerCase();
        console.log(`Converting ${inputFileName} to PDF...`);
        console.log(`File type detected: ${fileExtension}`);
        // For Excel files, use specialized conversion with multiple fallback methods
        if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            return await convertExcelToPDF(inputPath);
        }
        // Enhanced LibreOffice command with specific options for different file types
        let command;
        if (fileExtension === '.docx' || fileExtension === '.doc') {
            // Enhanced Word to PDF conversion
            command = `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to "pdf:writer_pdf_Export" --outdir "${outputDir}" "${inputPath}"`;
        }
        else if (fileExtension === '.pptx' || fileExtension === '.ppt') {
            // Enhanced PowerPoint to PDF conversion
            command = `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to "pdf:impress_pdf_Export" --outdir "${outputDir}" "${inputPath}"`;
        }
        else {
            // Fallback for other file types
            command = `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
        }
        console.log(`Executing: ${command}`);
        const { stdout, stderr } = await execAsync(command, {
            timeout: 60000 // Increased timeout to 60 seconds for complex conversions
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
// Specialized Excel to PDF conversion with multiple fallback methods
async function convertExcelToPDF(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        console.log(`🔄 Starting specialized Excel to PDF conversion for: ${inputFileName}`);
        // Multiple conversion methods to try in order of preference
        const conversionMethods = [
            // Method 1: Using calc_pdf_Export with explicit filter
            `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to "pdf:calc_pdf_Export" --outdir "${outputDir}" "${inputPath}"`,
            // Method 2: Standard PDF conversion with calc-specific options
            `soffice --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
            // Method 3: Using LibreOffice Calc directly with macro execution disabled
            `soffice --calc --headless --invisible --nodefault --nolockcheck --nologo --norestore --convert-to pdf --outdir "${outputDir}" "${inputPath}"`,
            // Method 4: Basic fallback
            `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`
        ];
        let lastError = null;
        for (let i = 0; i < conversionMethods.length; i++) {
            const command = conversionMethods[i];
            console.log(`📝 Attempting Excel conversion method ${i + 1}/${conversionMethods.length}`);
            console.log(`🔧 Command: ${command}`);
            try {
                const { stdout, stderr } = await execAsync(command, {
                    timeout: 90000 // 90 seconds timeout for Excel conversions
                });
                if (stderr) {
                    console.warn(`⚠️ LibreOffice stderr (method ${i + 1}):`, stderr);
                }
                console.log(`📄 LibreOffice stdout (method ${i + 1}):`, stdout);
                // Check if the PDF was created
                const outputPdfPath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}.pdf`);
                if (await fs_extra_1.default.pathExists(outputPdfPath)) {
                    // Verify the PDF has content (not just an empty file)
                    const stats = await fs_extra_1.default.stat(outputPdfPath);
                    if (stats.size > 1000) { // At least 1KB to ensure it's not empty
                        console.log(`✅ Excel to PDF conversion successful with method ${i + 1}: ${outputPdfPath} (${stats.size} bytes)`);
                        return outputPdfPath;
                    }
                    else {
                        console.warn(`⚠️ PDF created but appears empty (${stats.size} bytes), trying next method...`);
                        await fs_extra_1.default.remove(outputPdfPath); // Clean up empty PDF
                    }
                }
                else {
                    console.warn(`⚠️ PDF not created with method ${i + 1}, trying next method...`);
                }
            }
            catch (error) {
                console.warn(`⚠️ Method ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
                lastError = error instanceof Error ? error : new Error('Unknown error');
                // If this isn't the last method, continue to the next one
                if (i < conversionMethods.length - 1) {
                    console.log(`🔄 Trying next conversion method...`);
                    continue;
                }
            }
        }
        // If we get here, all methods failed
        throw new Error(`All Excel to PDF conversion methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    catch (error) {
        console.error('❌ Excel to PDF conversion failed:', error);
        throw new Error(`Failed to convert Excel file to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Helper function to convert PDF to JPG using pdf-poppler and sharp
async function convertPDFToJPG(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        console.log(`Converting ${inputFileName} to JPG...`);
        console.log(`🖥️ Platform: ${process.platform}`);
        // First, get the page count to understand what we're dealing with
        try {
            const execAsync = (0, util_1.promisify)(child_process_1.exec);
            const { stdout } = await execAsync(`pdfinfo "${inputPath}"`);
            const pageMatch = stdout.match(/Pages:\s*(\d+)/);
            const pageCount = pageMatch ? parseInt(pageMatch[1]) : 1;
            console.log(`📊 PDF has ${pageCount} page(s) according to pdfinfo`);
        }
        catch (pdfInfoError) {
            console.log('⚠️ Could not get page count with pdfinfo, proceeding with conversion...');
        }
        // Only configure pdf-poppler options for non-Linux platforms
        let opts = {};
        if (process.platform !== 'linux') {
            opts = {
                format: 'jpeg',
                out_dir: outputDir,
                out_prefix: inputFileNameWithoutExt,
                page: null // null = all pages
            };
            console.log(`🖥️ Non-Linux platform detected: ${process.platform} - using pdf-poppler`);
        }
        // Convert all PDF pages to images
        let pdfInfo;
        // On Linux, always use direct system commands to avoid pdf-poppler issues
        if (process.platform === 'linux') {
            console.log("🐧 Linux detected - using direct system poppler commands...");
            try {
                // Get page count
                const { stdout } = await execAsync(`pdfinfo "${inputPath}"`);
                const pageMatch = stdout.match(/Pages:\s*(\d+)/);
                const pageCount = pageMatch ? parseInt(pageMatch[1]) : 1;
                console.log(`📊 PDF has ${pageCount} page(s), converting with direct poppler...`);
                // Convert each page individually using pdftoppm
                for (let page = 1; page <= pageCount; page++) {
                    await execAsync(`pdftoppm -jpeg -f ${page} -l ${page} "${inputPath}" "${outputDir}/${inputFileNameWithoutExt}-${page}"`);
                    console.log(`✅ Converted page ${page}/${pageCount}`);
                }
                pdfInfo = { pages: pageCount };
                console.log("✅ PDF pages converted via direct system poppler");
            }
            catch (systemError) {
                console.error("❌ Direct system poppler failed:", systemError);
                throw new Error(`PDF conversion failed on Linux: ${systemError}`);
            }
        }
        else {
            // On non-Linux platforms, use pdf-poppler
            console.log(`🖥️ Non-Linux platform (${process.platform}) - using pdf-poppler...`);
            try {
                const pdfPoppler = await loadPdfPoppler();
                pdfInfo = await pdfPoppler.default.convert(inputPath, opts);
                console.log("✅ PDF pages converted via pdf-poppler");
                console.log("🔍 Poppler conversion info:", pdfInfo);
            }
            catch (popplerError) {
                console.error("❌ pdf-poppler failed:", popplerError.message);
                throw popplerError;
            }
        }
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
        // Use cross-platform Python detection
        const pythonExecutable = await findPythonExecutable();
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
// Layout-preserving PDF to PowerPoint conversion function (preserves original layout using PyMuPDF + python-pptx)
async function convertPDFToPowerPointLayoutPreserving(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const outputFilePath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}_layout.pptx`);
        console.log(`🚀 Layout-preserving PDF to PowerPoint conversion started`);
        console.log(`📁 Input: ${inputPath}`);
        console.log(`📁 Output: ${outputFilePath}`);
        // Check if input file exists
        if (!await fs_extra_1.default.pathExists(inputPath)) {
            throw new Error(`Input PDF file not found: ${inputPath}`);
        }
        // Prepare Python command for layout-preserving converter
        const pythonScript = path_1.default.join(__dirname, '..', 'ocr-service', 'pdf_to_ppt_layout_preserving.py');
        // Try different Python executables in order of preference
        const pythonExecutable = await findPythonExecutable();
        const command = `"${pythonExecutable}" "${pythonScript}" "${inputPath}" "${outputFilePath}"`;
        console.log(`🐍 Executing layout-preserving Python converter: ${command}`);
        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 300000, // 5 minutes timeout
                encoding: 'utf8',
                cwd: path_1.default.dirname(pythonScript)
            });
            if (stderr && !stderr.includes('WARNING') && !stderr.includes('INFO')) {
                console.warn(`⚠️ Layout-preserving converter stderr:`, stderr);
            }
            if (stdout) {
                console.log(`📄 Layout-preserving converter output:`, stdout);
            }
            // Check if output file was created
            if (!await fs_extra_1.default.pathExists(outputFilePath)) {
                throw new Error(`Layout-preserving converter did not create output file: ${outputFilePath}`);
            }
            const stats = await fs_extra_1.default.stat(outputFilePath);
            console.log(`✅ Layout-preserving PowerPoint conversion successful: ${outputFilePath} (${stats.size} bytes)`);
            return outputFilePath;
        }
        catch (execError) {
            console.error(`❌ Layout-preserving Python converter execution failed:`, execError);
            throw new Error(`Layout-preserving PowerPoint conversion failed: ${execError instanceof Error ? execError.message : 'Unknown error'}`);
        }
    }
    catch (error) {
        console.error(`❌ Layout-preserving PDF to PowerPoint conversion failed:`, error);
        throw new Error(`Layout-preserving conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        // Use cross-platform Python detection
        const pythonExecutable = await findPythonExecutable();
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
        // Use cross-platform Python detection
        const pythonExecutable = await findPythonExecutable();
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
// Professional PDF to Excel conversion using Camelot + Tabula
async function convertPDFToExcelProfessional(inputPath) {
    try {
        const outputDir = tempDir;
        const inputFileName = path_1.default.basename(inputPath);
        const inputFileNameWithoutExt = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const outputFilePath = path_1.default.join(outputDir, `${inputFileNameWithoutExt}_professional.xlsx`);
        console.log(`🏆 Converting PDF to Excel using professional methods (Camelot + Tabula): ${inputFileName}`);
        console.log(`📁 Input: ${inputPath}`);
        console.log(`📁 Output: ${outputFilePath}`);
        // Path to professional PDF converter script
        const converterScriptPath = path_1.default.join(__dirname, '../ocr-service/professional_pdf_converter.py');
        // Check if Python script exists
        if (!await fs_extra_1.default.pathExists(converterScriptPath)) {
            throw new Error(`Professional PDF converter script not found: ${converterScriptPath}`);
        }
        // Use cross-platform Python detection
        const pythonExecutable = await findPythonExecutable();
        const pythonCommand = `"${pythonExecutable}" "${converterScriptPath}" "${inputPath}" "${outputFilePath}" --verbose`;
        console.log(`🔧 Executing professional PDF to Excel conversion: ${pythonCommand}`);
        // Clean environment to avoid LibreOffice Python conflicts
        const cleanEnv = { ...process.env };
        if (cleanEnv.PATH) {
            cleanEnv.PATH = cleanEnv.PATH
                .split(';')
                .filter(pathPart => !pathPart.toLowerCase().includes('libreoffice'))
                .join(';');
        }
        const { stdout, stderr } = await execAsync(pythonCommand, {
            timeout: 120000, // 2 minutes timeout for complex PDFs
            env: cleanEnv
        });
        if (stderr) {
            console.warn('Professional converter stderr:', stderr);
        }
        console.log('Professional converter stdout:', stdout);
        // Parse the JSON result from the converter
        try {
            const lines = stdout.split('\n');
            const resultLine = lines.find(line => line.includes('CONVERSION RESULT:') || line.includes('{'));
            if (resultLine) {
                const jsonStart = resultLine.indexOf('{');
                if (jsonStart !== -1) {
                    const result = JSON.parse(resultLine.substring(jsonStart));
                    console.log('📊 Professional conversion result:', result);
                    if (!result.success) {
                        throw new Error(`Professional conversion failed: ${result.error}`);
                    }
                    console.log(`✅ Professional conversion successful: ${result.tables_found} tables found using ${result.method_used}`);
                }
            }
        }
        catch (parseError) {
            console.warn('Could not parse conversion result JSON, but continuing...', parseError);
        }
        // Check if output file was created
        if (!await fs_extra_1.default.pathExists(outputFilePath)) {
            throw new Error(`Professional conversion output file not found: ${outputFilePath}`);
        }
        const stats = await fs_extra_1.default.stat(outputFilePath);
        console.log(`📏 Professional conversion output file size: ${stats.size} bytes`);
        if (stats.size === 0) {
            throw new Error('Professional conversion produced an empty file');
        }
        return outputFilePath;
    }
    catch (error) {
        console.error(`❌ Professional PDF to Excel conversion failed:`, error);
        throw new Error(`Professional PDF to Excel conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            // For PowerPoint, use the layout-preserving converter to maintain original layout
            console.log(`🎯 Using layout-preserving PowerPoint converter`);
            outputFilePath = await convertPDFToPowerPointLayoutPreserving(inputPath);
            console.log(`✅ Layout-preserving PowerPoint conversion successful`);
            return outputFilePath;
        }
        else if (outputFormat === 'xlsx') {
            // For Excel, use the new professional converter with multiple methods
            console.log(`🏆 Using professional PDF to Excel converter (Camelot + Tabula + fallbacks)`);
            try {
                outputFilePath = await convertPDFToExcelProfessional(inputPath);
                console.log(`✅ Professional Excel conversion successful`);
                return outputFilePath;
            }
            catch (professionalError) {
                console.warn(`⚠️ Professional Excel conversion failed, falling back to LibreOffice + OCR: ${professionalError}`);
                // Fallback to the old method if professional converter fails
                if (pdfType === 'text-based') {
                    console.log(`🔄 Fallback: Using LibreOffice for text-based PDF`);
                    try {
                        outputFilePath = await convertPDFToOffice(inputPath, outputFormat);
                        console.log(`✅ LibreOffice fallback conversion successful`);
                        return outputFilePath;
                    }
                    catch (libreOfficeError) {
                        console.warn(`⚠️ LibreOffice fallback failed, using OCR: ${libreOfficeError}`);
                        outputFilePath = await convertPDFWithOCR(inputPath, outputFormat);
                        console.log(`✅ OCR fallback conversion successful`);
                        return outputFilePath;
                    }
                }
                else {
                    console.log(`🔄 Fallback: Using OCR for image-based/scanned PDF`);
                    outputFilePath = await convertPDFWithOCR(inputPath, outputFormat);
                    console.log(`✅ OCR fallback conversion successful`);
                    return outputFilePath;
                }
            }
        }
        else {
            // For other formats, use the existing LibreOffice + OCR approach
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
// Main conversion route (public - no authentication required)
app.post('/convert', upload.single('file'), async (req, res) => {
    let inputFilePath;
    let outputFilePath;
    try {
        console.log('🚀 /convert endpoint hit:', {
            origin: req.get('Origin'),
            userAgent: req.get('User-Agent'),
            method: req.method,
            hasFile: !!req.file,
            ip: req.ip
        });
        // Check if file was uploaded
        if (!req.file) {
            console.log('❌ No file uploaded');
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
        // Track conversion (anonymous user)
        await trackBackendConversion({
            toolType: 'office-to-pdf',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: undefined, // Anonymous conversion
            status: 'COMPLETED',
            req
        });
        // Send the PDF file
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('❌ Conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'office-to-pdf',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'FAILED',
                req
            });
            // Log conversion error
            await logSystemEvent({
                type: 'CONVERSION_ERROR',
                message: `Office to PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: `File: ${req.file.originalname}, Size: ${req.file.size} bytes, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'MEDIUM',
                req
            });
        }
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
// PDF to JPG conversion route (public - no authentication required)
app.post('/pdf-to-jpg', upload.single('file'), async (req, res) => {
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
            // Track conversion (anonymous user)
            await trackBackendConversion({
                toolType: 'pdf-to-jpg',
                originalFileName,
                convertedFileName: outputFileName,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'COMPLETED',
                req
            });
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
            // Track conversion (anonymous user)
            await trackBackendConversion({
                toolType: 'pdf-to-jpg',
                originalFileName,
                convertedFileName: outputFileName,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'COMPLETED',
                req
            });
        }
    }
    catch (error) {
        console.error('❌ PDF to JPG conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-jpg',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'FAILED',
                req
            });
        }
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
// PDF to Word conversion route (public - no authentication required)
app.post('/pdf-to-word', upload.single('file'), async (req, res) => {
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
        // Track conversion (anonymous user)
        await trackBackendConversion({
            toolType: 'pdf-to-word',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: undefined, // Anonymous conversion
            status: 'COMPLETED',
            req
        });
        // Send the Word file
        res.send(wordBuffer);
    }
    catch (error) {
        console.error('❌ PDF to Word conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-word',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'FAILED',
                req
            });
        }
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
// PDF to Excel conversion route (public - no authentication required)
app.post('/pdf-to-excel', upload.single('file'), async (req, res) => {
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
        // Track conversion (anonymous user)
        await trackBackendConversion({
            toolType: 'pdf-to-excel',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: undefined, // Anonymous conversion
            status: 'COMPLETED',
            req
        });
        // Send the Excel file
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('❌ PDF to Excel conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-excel',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'FAILED',
                req
            });
        }
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
// PDF to PowerPoint conversion route (public - no authentication required)
app.post('/pdf-to-powerpoint', upload.single('file'), async (req, res) => {
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
        // Track conversion (anonymous user)
        await trackBackendConversion({
            toolType: 'pdf-to-powerpoint',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: undefined, // Anonymous conversion
            status: 'COMPLETED',
            req
        });
        // Send the PowerPoint file
        res.send(pptBuffer);
    }
    catch (error) {
        console.error('❌ PDF to PowerPoint conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-powerpoint',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: undefined, // Anonymous conversion
                status: 'FAILED',
                req
            });
        }
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
// Authenticated conversion routes (for tracking user conversions)
// These routes are optional - if the user is authenticated, they'll get their conversion tracked
// Authenticated PDF to Word conversion route
app.post('/api/convert/pdf-to-word', auth_2.authenticate, upload.single('file'), async (req, res) => {
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
        console.log(`📁 Authenticated PDF to Word conversion for user ${req.user?.userId}: ${originalFileName} (${req.file.size} bytes)`);
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
        // Track conversion
        await trackBackendConversion({
            toolType: 'pdf-to-word',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: req.user?.userId,
            status: 'COMPLETED',
            req
        });
        // Send the Word file
        res.send(wordBuffer);
    }
    catch (error) {
        console.error('❌ Authenticated PDF to Word conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-word',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'FAILED',
                req
            });
        }
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
// Authenticated PDF to Excel conversion route
app.post('/api/convert/pdf-to-excel', auth_2.authenticate, upload.single('file'), async (req, res) => {
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
        console.log(`📁 Authenticated PDF to Excel conversion for user ${req.user?.userId}: ${originalFileName} (${req.file.size} bytes)`);
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
        // Track conversion
        await trackBackendConversion({
            toolType: 'pdf-to-excel',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: req.user?.userId,
            status: 'COMPLETED',
            req
        });
        // Send the Excel file
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('❌ Authenticated PDF to Excel conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-excel',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'FAILED',
                req
            });
        }
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
// Authenticated PDF to PowerPoint conversion route
app.post('/api/convert/pdf-to-powerpoint', auth_2.authenticate, upload.single('file'), async (req, res) => {
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
        console.log(`📁 Authenticated PDF to PowerPoint conversion for user ${req.user?.userId}: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert PDF to PowerPoint using enhanced converter
        outputFilePath = await convertPDFToOfficeWithDetection(inputFilePath, 'pptx');
        // Read the converted PowerPoint document
        const pptBuffer = await fs_extra_1.default.readFile(outputFilePath);
        // Set response headers for PowerPoint download
        const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.pptx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
        res.setHeader('Content-Length', pptBuffer.length.toString());
        console.log(`📤 Sending PowerPoint document: ${outputFileName} (${pptBuffer.length} bytes)`);
        // Track conversion
        await trackBackendConversion({
            toolType: 'pdf-to-powerpoint',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: req.user?.userId,
            status: 'COMPLETED',
            req
        });
        // Send the PowerPoint file
        res.send(pptBuffer);
    }
    catch (error) {
        console.error('❌ Authenticated PDF to PowerPoint conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-powerpoint',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'FAILED',
                req
            });
        }
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
// Authenticated Office to PDF conversion route
app.post('/api/convert/to-pdf', auth_2.authenticate, upload.single('file'), async (req, res) => {
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
        console.log(`📁 Authenticated Office to PDF conversion for user ${req.user?.userId}: ${originalFileName} (${req.file.size} bytes)`);
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
        // Track conversion
        await trackBackendConversion({
            toolType: 'office-to-pdf',
            originalFileName,
            convertedFileName: outputFileName,
            fileSize: req.file.size,
            userId: req.user?.userId,
            status: 'COMPLETED',
            req
        });
        // Send the PDF file
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('❌ Authenticated Office to PDF conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'office-to-pdf',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'FAILED',
                req
            });
        }
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
// Authenticated PDF to JPG conversion route
app.post('/api/convert/pdf-to-jpg', auth_2.authenticate, upload.single('file'), async (req, res) => {
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
        console.log(`📁 Authenticated PDF to JPG conversion for user ${req.user?.userId}: ${originalFileName} (${req.file.size} bytes)`);
        console.log(`📍 Saved to: ${inputFilePath}`);
        // Convert PDF to JPG using Poppler
        outputFilePaths = await convertPDFToJPG(inputFilePath);
        console.log(`🔍 Conversion result: ${outputFilePaths.length} files generated`);
        console.log(`📄 Output files:`, outputFilePaths.map(filePath => path_1.default.basename(filePath)));
        if (outputFilePaths.length === 1) {
            // Single page - send the JPG file directly
            const jpgBuffer = await fs_extra_1.default.readFile(outputFilePaths[0]);
            const outputFileName = `${path_1.default.basename(originalFileName, fileExtension)}.jpg`;
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
            res.setHeader('Content-Length', jpgBuffer.length.toString());
            console.log(`📤 Sending JPG: ${outputFileName} (${jpgBuffer.length} bytes)`);
            // Track conversion
            await trackBackendConversion({
                toolType: 'pdf-to-jpg',
                originalFileName,
                convertedFileName: outputFileName,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'COMPLETED',
                req
            });
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
            // Pipe the archive to the response
            archive.pipe(res);
            // Add each JPG file to the archive
            for (const filePath of outputFilePaths) {
                const fileName = path_1.default.basename(filePath);
                archive.file(filePath, { name: fileName });
            }
            console.log(`📤 Sending ZIP archive: ${outputFileName} (${outputFilePaths.length} files)`);
            // Track conversion
            await trackBackendConversion({
                toolType: 'pdf-to-jpg',
                originalFileName,
                convertedFileName: outputFileName,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'COMPLETED',
                req
            });
            // Finalize the archive
            await archive.finalize();
        }
    }
    catch (error) {
        console.error('❌ Authenticated PDF to JPG conversion failed:', error);
        // Track failed conversion
        if (req.file) {
            await trackBackendConversion({
                toolType: 'pdf-to-jpg',
                originalFileName: req.file.originalname,
                fileSize: req.file.size,
                userId: req.user?.userId,
                status: 'FAILED',
                req
            });
        }
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
        // Clean up all output files
        for (const filePath of outputFilePaths) {
            await cleanupFiles(filePath);
        }
    }
});
// Auth verification endpoint for frontend token validation
app.get('/api/auth/verify', auth_2.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        res.json({
            success: true,
            user: {
                id: req.user.userId,
                email: req.user.email,
                role: req.user.role
            }
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Token verification failed'
        });
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
                isBlocked: true,
                lastLogin: true,
                totalConversions: true,
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
// Block/Unblock user endpoint
app.patch('/api/admin/users/:userId/block', auth_2.authenticate, auth_2.adminOnly, async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBlocked } = req.body;
        if (typeof isBlocked !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isBlocked must be a boolean value',
            });
            return;
        }
        // Prevent blocking admin users
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true, email: true },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.role === 'ADMIN' && isBlocked) {
            res.status(400).json({
                success: false,
                message: 'Cannot block admin users',
            });
            return;
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: { isBlocked },
            select: {
                id: true,
                name: true,
                email: true,
                isBlocked: true,
                updatedAt: true,
            },
        });
        // Revoke all sessions for blocked users
        if (isBlocked) {
            await auth_3.AuthService.revokeAllUserSessions(userId);
        }
        res.json({
            success: true,
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: { user: updatedUser },
        });
    }
    catch (error) {
        console.error('Update user block status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user block status',
        });
    }
});
// Conversion tracking API endpoint
app.post('/api/track-conversion', async (req, res) => {
    try {
        const { toolType, originalFileName, convertedFileName, fileSize, processingLocation, userId, status = 'COMPLETED' } = req.body;
        // Validate required fields
        if (!toolType || !originalFileName || !fileSize || !processingLocation) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: toolType, originalFileName, fileSize, processingLocation'
            });
        }
        // Get client info for anonymous tracking
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        // Create conversion record
        const conversion = await database_1.default.conversion.create({
            data: {
                userId,
                originalFileName,
                convertedFileName,
                toolType,
                fileSize,
                status,
                processingLocation,
                isAuthenticated: !!userId,
                ipAddress,
                userAgent
            }
        });
        // Create file record for FileManagement component (only for authenticated users)
        if (userId) {
            await database_1.default.fileRecord.create({
                data: {
                    filename: originalFileName,
                    fileType: mapToolToFileType(toolType),
                    originalExtension: getFileExtension(originalFileName),
                    uploadedById: userId,
                    status: mapConversionStatusToFileStatus(status),
                    fileSize,
                    downloadUrl: convertedFileName ? `/downloads/${convertedFileName}` : undefined,
                    errorMessage: status === 'FAILED' ? 'Conversion failed' : undefined
                }
            });
        }
        // Update user total conversions if authenticated
        if (userId) {
            await database_1.default.user.update({
                where: { id: userId },
                data: {
                    totalConversions: {
                        increment: 1
                    }
                }
            });
        }
        console.log(`✅ Tracked conversion: ${toolType} for ${userId ? `user ${userId}` : 'anonymous'}`);
        res.json({
            success: true,
            conversionId: conversion.id
        });
    }
    catch (error) {
        console.error('❌ Failed to track conversion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track conversion'
        });
    }
});
// Statistics API endpoint (temporarily without auth for testing)
app.get('/api/statistics', auth_2.authenticate, async (req, res) => {
    try {
        console.log('Statistics API - Processing request for timeRange:', req.query.timeRange);
        const { timeRange = '30d' } = req.query;
        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        // Get total uploads in time range
        const totalUploads = await database_1.default.conversion.count({
            where: {
                createdAt: {
                    gte: startDate
                }
            }
        });
        // Get previous period for comparison
        const previousPeriodStart = new Date(startDate);
        const periodLength = now.getTime() - startDate.getTime();
        previousPeriodStart.setTime(startDate.getTime() - periodLength);
        const previousPeriodUploads = await database_1.default.conversion.count({
            where: {
                createdAt: {
                    gte: previousPeriodStart,
                    lt: startDate
                }
            }
        });
        // Calculate upload growth percentage
        const uploadGrowth = previousPeriodUploads === 0 ? 0 :
            ((totalUploads - previousPeriodUploads) / previousPeriodUploads) * 100;
        // Get daily uploads for the time range
        const dailyUploads = await database_1.default.conversion.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 30
        });
        // Transform daily uploads data
        const transformedDailyUploads = dailyUploads.map(day => ({
            date: day.createdAt.toISOString().split('T')[0],
            count: day._count.id
        }));
        // Get conversion success rate
        const conversionStats = await database_1.default.conversion.groupBy({
            by: ['status'],
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _count: {
                status: true
            }
        });
        let successful = 0;
        let failed = 0;
        conversionStats.forEach(stat => {
            if (stat.status === 'COMPLETED') {
                successful = stat._count.status;
            }
            else if (stat.status === 'FAILED') {
                failed = stat._count.status;
            }
        });
        const totalConversions = successful + failed;
        const successRate = totalConversions === 0 ? 0 : (successful / totalConversions) * 100;
        // Get previous period success rate for comparison
        const previousConversionStats = await database_1.default.conversion.groupBy({
            by: ['status'],
            where: {
                createdAt: {
                    gte: previousPeriodStart,
                    lt: startDate
                }
            },
            _count: {
                status: true
            }
        });
        let previousSuccessful = 0;
        let previousFailed = 0;
        previousConversionStats.forEach(stat => {
            if (stat.status === 'COMPLETED') {
                previousSuccessful = stat._count.status;
            }
            else if (stat.status === 'FAILED') {
                previousFailed = stat._count.status;
            }
        });
        const previousTotalConversions = previousSuccessful + previousFailed;
        const previousSuccessRate = previousTotalConversions === 0 ? 0 : (previousSuccessful / previousTotalConversions) * 100;
        const successRateGrowth = previousSuccessRate === 0 ? 0 :
            ((successRate - previousSuccessRate) / previousSuccessRate) * 100;
        // Calculate total storage used
        const storageResult = await database_1.default.conversion.aggregate({
            _sum: {
                fileSize: true
            }
        });
        const totalBytes = Number(storageResult._sum.fileSize) || 0;
        const formatFileSize = (bytes) => {
            if (bytes === 0)
                return { formatted: '0 Bytes', percentage: 0 };
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
            // Assume 100GB capacity for percentage calculation
            const capacityBytes = 100 * 1024 * 1024 * 1024; // 100GB
            const percentage = (bytes / capacityBytes) * 100;
            return { formatted, percentage: Math.min(percentage, 100) };
        };
        const storageInfo = formatFileSize(totalBytes);
        // Get previous period storage for comparison
        const previousStorageResult = await database_1.default.conversion.aggregate({
            _sum: {
                fileSize: true
            },
            where: {
                createdAt: {
                    gte: previousPeriodStart,
                    lt: startDate
                }
            }
        });
        const previousBytes = Number(previousStorageResult._sum.fileSize) || 0;
        const storageGrowth = previousBytes === 0 ? 0 :
            ((totalBytes - previousBytes) / previousBytes) * 100;
        // Get failed conversions growth
        const failedGrowth = previousFailed === 0 ? 0 :
            ((failed - previousFailed) / previousFailed) * 100;
        // Get all file type statistics
        const fileTypeStats = await database_1.default.conversion.groupBy({
            by: ['toolType'],
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _count: {
                toolType: true
            },
            orderBy: {
                _count: {
                    toolType: 'desc'
                }
            }
        });
        // Map tool type to readable name
        const typeMapping = {
            'pdf-to-jpg': 'PDF to Image',
            'office-to-pdf': 'Office to PDF',
            'pdf-to-word': 'PDF to Word',
            'pdf-to-ppt': 'PDF to PowerPoint',
            'pdf-to-excel': 'PDF to Excel',
            'compress-pdf': 'PDF Compression',
            'split-pdf': 'PDF Split',
            'merge-pdf': 'PDF Merge'
        };
        // Transform all file type statistics
        const allFileTypes = fileTypeStats.map(stat => {
            const count = Number(stat._count.toolType);
            const percentage = totalUploads === 0 ? 0 : (count / totalUploads) * 100;
            return {
                type: typeMapping[stat.toolType] || stat.toolType,
                count,
                percentage: Math.round(percentage * 10) / 10
            };
        });
        let mostPopularFileType = {
            type: 'N/A',
            count: 0,
            percentage: 0
        };
        if (allFileTypes.length > 0) {
            mostPopularFileType = allFileTypes[0];
        }
        // Get monthly uploads for trends
        const monthlyUploads = await database_1.default.conversion.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: new Date(now.getFullYear() - 1, now.getMonth(), 1)
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 12
        });
        const transformedMonthlyUploads = monthlyUploads.map(month => ({
            month: month.createdAt.toISOString().slice(0, 7), // YYYY-MM format
            count: month._count.id
        }));
        const statistics = {
            dailyUploads: transformedDailyUploads,
            monthlyUploads: transformedMonthlyUploads,
            mostUploadedFileType: mostPopularFileType,
            allFileTypes: allFileTypes,
            conversionSuccessRate: {
                successful,
                failed,
                rate: Math.round(successRate * 10) / 10
            },
            totalStorageUsed: {
                bytes: totalBytes,
                formatted: storageInfo.formatted,
                percentage: Math.round(storageInfo.percentage * 10) / 10
            },
            growthRates: {
                uploads: Math.round(uploadGrowth * 10) / 10,
                successRate: Math.round(successRateGrowth * 10) / 10,
                failures: Math.round(failedGrowth * 10) / 10,
                storage: Math.round(storageGrowth * 10) / 10
            }
        };
        res.json({
            success: true,
            data: statistics
        });
    }
    catch (error) {
        console.error('❌ Failed to fetch statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
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
