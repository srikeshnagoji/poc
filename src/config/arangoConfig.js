const { Database } = require("arangojs");

const connectToArangoDB = async () => {
  const systemDb = new Database({
    url: process.env.ARANGO_URL || "http://localhost:8529",
    auth: {
      username: process.env.ARANGO_USER || "root",
      password: process.env.ARANGO_PASSWORD || "openSesame",
    },
  });

  const dbName = process.env.ARANGO_DB || "company-poc";
  try {
    const dbExists = await systemDb.database(dbName).exists();
    if (!dbExists) {
      await systemDb.createDatabase(dbName);
      console.log(`Created database: ${dbName}`);
    }

    const db = new Database({
      url: process.env.ARANGO_URL || "http://localhost:8529",
      databaseName: process.env.ARANGO_DB || "company-poc",
      auth: {
        username: process.env.ARANGO_USER || "root",
        password: process.env.ARANGO_PASSWORD || "openSesame",
      },
    });

    // Create collections if they don't exist
    const collections = [
      { name: "companies", type: "document" },
      { name: "branches", type: "document" },
      { name: "departments", type: "document" },
      { name: "employees", type: "document" },
      { name: "company_branches", type: "edge" },
      { name: "branch_departments", type: "edge" },
      { name: "department_employees", type: "edge" },
    ];

    for (const collection of collections) {
      const exists = await db.collection(collection.name).exists();
      if (!exists) {
        if (collection.type === "edge") {
          await db.createEdgeCollection(collection.name);
        } else {
          await db.createCollection(collection.name);
        }
        console.log(
          `Created ${collection.type} collection: ${collection.name}`
        );
      }
    }

    console.log("Connected to ArangoDB");
    return db;
  } catch (error) {
    console.error("ArangoDB connection error:", error);
    throw error;
  }
};

module.exports = { connectToArangoDB };
