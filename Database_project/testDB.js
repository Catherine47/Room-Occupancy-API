const db = require("./db"); // Ensure this is your correct DB connection file

async function testDB() {
  try {
    const result = await db.one("SELECT NOW()");
    console.log("Database is running. Current timestamp:", result.now);
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

testDB();
