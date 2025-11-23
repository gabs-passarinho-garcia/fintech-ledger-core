/**
 * Script to generate frontend type definitions from backend
 * Compiles the backend TypeScript and extracts the App type for Eden Treaty
 */

import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const BACKEND_DIR = resolve(import.meta.dir, "../../backend");
const FRONTEND_DIR = resolve(import.meta.dir, "..");
const BACKEND_DIST_FILE = join(BACKEND_DIR, "dist/src/app.d.ts");
const FRONTEND_TYPES_FILE = join(FRONTEND_DIR, "src/types/app.d.ts");

/**
 * Compiles the backend TypeScript to generate declaration files only
 * Executes the command in the backend directory to use the correct tsconfig.json
 * Ignores compilation errors as the tsconfig has noEmitOnError: false
 * The important thing is to generate the type declaration file
 */
async function compileBackend(): Promise<void> {
  console.info("🔨 Generating backend type declarations...");

  // Execute tsc in the backend directory to use the backend's tsconfig.json
  const buildProcess = Bun.spawn(
    ["bunx", "--bun", "tsc", "--emitDeclarationOnly"],
    {
      cwd: BACKEND_DIR, // Execute in backend directory
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  // Wait for process to complete but ignore exit code
  // The tsconfig has noEmitOnError: false, so types may be generated even with errors
  await buildProcess.exited;

  // Check if the declaration file was generated (that's what matters)
  if (existsSync(BACKEND_DIST_FILE)) {
    console.info("✅ Backend type declarations generated");
  } else {
    console.warn(
      "⚠️  Backend type declarations file not found, but continuing...",
    );
  }
}

/**
 * Adjusts import paths in the generated type file to work in the frontend context
 * @param content - The content of the backend type file
 * @returns Adjusted content with corrected import paths
 */
function adjustImports(content: string): string {
  // Replace relative imports from backend dist to point to backend source
  // The frontend tsconfig has a path alias: "backend/*": ["../backend/src/*"]
  let adjusted = content;

  // Replace './common/container/ContainerHandler' with the correct path
  adjusted = adjusted.replace(
    /from ['"]\.\/common\/container\/ContainerHandler['"]/g,
    "from 'backend/common/container/ContainerHandler'",
  );

  // Replace any other './common/' imports
  adjusted = adjusted.replace(
    /from ['"]\.\/common\/([^'"]+)['"]/g,
    "from 'backend/common/$1'",
  );

  // Replace '../common/' imports (if any)
  adjusted = adjusted.replace(
    /from ['"]\.\.\/common\/([^'"]+)['"]/g,
    "from 'backend/common/$1'",
  );

  return adjusted;
}

/**
 * Generates the frontend type file from the backend declaration file
 */
async function generateTypes(): Promise<void> {
  console.info("📝 Generating frontend type definitions...");

  // Check if backend dist file exists
  if (!existsSync(BACKEND_DIST_FILE)) {
    console.error(
      `❌ Backend declaration file not found: ${BACKEND_DIST_FILE}`,
    );
    console.error(
      "   The type declaration file was not generated. Check backend compilation errors.",
    );
    process.exit(1);
  }

  // Read the backend declaration file
  const backendTypes = await Bun.file(BACKEND_DIST_FILE).text();

  // Adjust imports for frontend context
  const adjustedTypes = adjustImports(backendTypes);

  // Ensure the types directory exists
  const typesDir = join(FRONTEND_DIR, "src/types");
  if (!existsSync(typesDir)) {
    mkdirSync(typesDir, { recursive: true });
  }

  // Write the adjusted types to the frontend
  await Bun.write(FRONTEND_TYPES_FILE, adjustedTypes);

  console.info(`✅ Type definitions generated: ${FRONTEND_TYPES_FILE}`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.info("🚀 Generating frontend types from backend...\n");

  try {
    // Compile backend first to ensure we have the latest types
    await compileBackend();

    // Generate the frontend type file
    await generateTypes();

    console.info("\n✨ Type generation completed successfully!");
  } catch (error) {
    console.error("❌ Error generating types:", error);
    process.exit(1);
  }
}

// Run the script
main();

// Export empty to make this a module (required for top-level await)
export {};
