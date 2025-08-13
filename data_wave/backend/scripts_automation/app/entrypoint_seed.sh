#\!/bin/bash

#!/bin/bash
echo "📦 Container initialisé - Seed mode"

# Function to check and seed MySQL
seed_mysql() {
    echo "🔄 Checking and seeding MySQL..."
    if ! command -v mysql &> /dev/null
    then
        echo "❌ mysql command not found, skipping MySQL seeding."
        return
    fi
    mysql -h mysql-server -u root -proot testdb -e "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        iban VARCHAR(34)
    );
    CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        transaction_date DATETIME,
        amount DECIMAL(10, 2),
        currency VARCHAR(3),
        description VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    INSERT INTO users (full_name, email, password, iban)
    SELECT * FROM (SELECT 'Alice Doe', 'alice@example.com', 'secret123', 'FR7630006000011234567890189') AS tmp
    WHERE NOT EXISTS (
        SELECT email FROM users WHERE email = 'alice@example.com'
    ) LIMIT 1;
    INSERT INTO transactions (user_id, transaction_date, amount, currency, description)
    SELECT * FROM (SELECT 1, '2023-01-01 10:00:00', 150.00, 'USD', 'Grocery shopping') AS tmp
    WHERE NOT EXISTS (
        SELECT description FROM transactions WHERE description = 'Grocery shopping' AND user_id = 1
    ) LIMIT 1;
    "
    echo "✅ MySQL seeding done."
    echo "MySQL seeding completed successfully."
}

# Function to check and seed PostgreSQL
seed_postgres() {
    echo "🔄 Checking and seeding PostgreSQL..."
    if ! command -v psql &> /dev/null
    then
        echo "❌ psql command not found, skipping PostgreSQL seeding."
        return
    fi
    PGPASSWORD=admin psql -h postgres-server -U admin -d testdb -c "
    CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        card_number TEXT
    );
    CREATE TABLE IF NOT EXISTS client_transactions (
        id SERIAL PRIMARY KEY,
        client_id INT REFERENCES clients(id),
        amount DECIMAL(10, 2),
        transaction_date TIMESTAMP,
        transaction_type TEXT,
        status TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT,
        description TEXT,
        price DECIMAL(10, 2),
        stock INT
    );
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        client_id INT REFERENCES clients(id),
        product_id INT REFERENCES products(id),
        quantity INT,
        order_date TIMESTAMP,
        status TEXT
    );
    INSERT INTO clients (name, email, phone, card_number)
    SELECT 'Bob Smith', 'bob@example.com', '+1234567890', '4111111111111111'
    WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'bob@example.com');
    "
    echo "✅ PostgreSQL seeding done."
    echo "PostgreSQL seeding completed successfully."
}

# Function to check and seed MongoDB
seed_mongo() {
    echo "🔄 Checking and seeding MongoDB..."
    if [ ! -f /docker/mongo_seed/seed_mongo.py ]; then
        echo "❌ seed_mongo.py not found at /docker/mongo_seed/seed_mongo.py, skipping MongoDB seeding."
        return
    fi
    python /docker/mongo_seed/seed_mongo.py
    echo "✅ MongoDB seeding done."
    echo "MongoDB seeding completed successfully."
}

# Run seeds
seed_mysql
seed_postgres
seed_mongo

# Start the main application
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
