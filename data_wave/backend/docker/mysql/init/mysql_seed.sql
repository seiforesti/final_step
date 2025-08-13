CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    iban VARCHAR(34)
);
INSERT INTO users (full_name, email, password, iban)
VALUES ("Alice Doe", "alice@example.com", "secret123", "FR7630006000011234567890189");
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    transaction_date DATETIME,
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO transactions (user_id, transaction_date, amount, currency, description)
VALUES 
    (1, '2023-01-01 10:00:00', 150.00, 'USD', 'Grocery shopping'),
    (1, '2023-01-05 14:30:00', 2000.00, 'EUR', 'Salary payment'),
    (1, '2023-01-10 09:15:00', -50.00, 'USD', 'Restaurant bill'),
    (1, '2023-01-15 16:45:00', 300.00, 'USD', 'Electronics purchase'),
    (1, '2023-01-20 11:00:00', -20.00, 'USD', 'Coffee shop');