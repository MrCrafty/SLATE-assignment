const { pool } = require('./db');

const createTables = async () => {
    try {
        // Create roles table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            );
        `);

        // Create users table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role_id INTEGER REFERENCES Roles(id),
            linked_student_id INTEGER REFERENCES Users(id)
);
        `);

        console.log("Tables checked and created if necessary.");
    } catch (err) {
        console.error("Error creating tables:", err.message);
    }
};

const insertRoles = async () => {
    try {
        await pool.query(`
            INSERT INTO roles (name) 
            VALUES ('student'), ('school'), ('parent') 
            ON CONFLICT (name) DO NOTHING;
        `);
        console.log("Roles inserted successfully.");
    } catch (err) {
        console.error("Error inserting roles:", err.message);
    } finally {
        pool.end();
    }
};

const runMigration = async () => {
    await createTables();
    await insertRoles();
};

runMigration();
