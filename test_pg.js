const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

pool.connect()
  .then((client) => {
    console.log("Connected successfully!");
    console.log("Client host:", client.client.host);
    console.log("Client port:", client.client.port);
    return client.query("SELECT 1 as test");
  })
  .then((result) => {
    console.log("Query result:", result.rows);
    client.end();
  })
  .catch((err) => {
    console.error("Connection error:", err.message);
    console.error("Error code:", err.code);
    client.end();
  });