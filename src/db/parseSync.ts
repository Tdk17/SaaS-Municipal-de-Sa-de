import ParseFromNpm from 'parse';

// Handle different import behaviors under Vite / ESM
let Parse: any = ParseFromNpm;
if (!Parse || typeof Parse.initialize !== 'function') {
  if (Parse && Parse.default && typeof Parse.default.initialize === 'function') {
    Parse = Parse.default;
  } else if ((window as any).Parse && typeof (window as any).Parse.initialize === 'function') {
    Parse = (window as any).Parse;
  }
}
if (!Parse || typeof Parse.initialize !== 'function') {
  Parse = (window as any).Parse;
}

// Fallback to user provided keys if environment variables are not set
const appId = (import.meta as any).env.VITE_PARSE_APPLICATION_ID || "lnko7wlt4lCnBGrAPcSvvHavzfC4UI9U4l5HCgAP";
const jsKey = (import.meta as any).env.VITE_PARSE_JAVASCRIPT_KEY || "uXjgGhXrbf6XGH3PYm1ZV8VuRjEAuYUxwE2UNe4H";

if (Parse && typeof Parse.initialize === 'function') {
  Parse.initialize(appId, jsKey);
  Parse.serverURL = "https://parseapi.back4app.com";
} else {
  console.warn("Parse SDK could not be initialized because the Parse object was not found.");
}

let isSaving = false;
let saveTimeout: any = null;

/**
 * Debounced function to save the database state to Back4App Parse
 */
export function saveToParse(dbData: any) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    try {
      isSaving = true;
      const DatabaseClass = Parse.Object.extend("MunicipalDatabase");
      const query = new Parse.Query(DatabaseClass);
      query.equalTo("municipality", "SantaEsperanca");
      let dbObject = await query.first();

      if (!dbObject) {
        dbObject = new DatabaseClass();
        dbObject.set("municipality", "SantaEsperanca");
      }

      // Store the whole database payload as JSON string
      dbObject.set("data", JSON.stringify(dbData));
      await dbObject.save();
      console.log("Database synchronized successfully with Back4App Parse Cloud!");
    } catch (error) {
      console.error("Failed to sync database with Back4App Parse:", error);
    } finally {
      isSaving = false;
    }
  }, 1500); // 1.5s debounce to protect API limits
}

/**
 * Fetch the latest database state from Back4App Parse and update localStorage
 */
export async function loadFromParse(): Promise<any | null> {
  try {
    const DatabaseClass = Parse.Object.extend("MunicipalDatabase");
    const query = new Parse.Query(DatabaseClass);
    query.equalTo("municipality", "SantaEsperanca");
    const dbObject = await query.first();

    if (dbObject) {
      const jsonStr = dbObject.get("data");
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        localStorage.setItem('saas_municipal_saude_db', jsonStr);
        // Dispatch event so React components reload their states
        window.dispatchEvent(new CustomEvent('mockdb-updated'));
        console.log("Database successfully loaded from Back4App Parse Cloud!");
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load database from Back4App Parse:", error);
  }
  return null;
}
