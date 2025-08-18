CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    card_number TEXT
);
INSERT INTO clients (name, email, phone, card_number)
VALUES ('Bob Smith', 'bob@example.com', '+1234567890', '4111111111111111');
CREATE TABLE IF NOT EXISTS client_transactions (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(id),
    amount DECIMAL(10, 2),
    transaction_date TIMESTAMP,
    transaction_type TEXT,
    status TEXT
);

INSERT INTO client_transactions (client_id, amount, transaction_date, transaction_type, status);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    price DECIMAL(10, 2),
    stock INT
);

INSERT INTO products (name, description, price, stock)
VALUES 
    ('Laptop', 'High-performance laptop', 1200.00, 50),
    ('Smartphone', 'Latest model smartphone', 800.00, 100),
    ('Headphones', 'Noise-cancelling headphones', 150.00, 200),
    ('Monitor', '4K Ultra HD monitor', 300.00, 75),
    ('Keyboard', 'Mechanical keyboard', 100.00, 150);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    order_date TIMESTAMP,
    status TEXT
);

INSERT INTO orders (client_id, product_id, quantity, order_date, status)
VALUES 
    (1, 1, 1, '2023-01-01 11:00:00', 'completed'),
    (1, 2, 2, '2023-01-02 16:00:00', 'pending'),
    (1, 3, 1, '2023-01-03 13:00:00', 'completed'),
    (1, 4, 1, '2023-01-04 10:00:00', 'failed'),
    (1, 5, 3, '2023-01-05 19:00:00', 'completed');
VALUES 
    (1, 100.50, '2023-01-01 10:00:00', 'purchase', 'completed'),
    (1, 200.75, '2023-01-02 15:30:00', 'refund', 'completed'),
    (1, 50.00, '2023-01-03 12:45:00', 'purchase', 'pending'),
    (1, 300.00, '2023-01-04 09:20:00', 'purchase', 'completed'),
    (1, 150.25, '2023-01-05 18:00:00', 'refund', 'failed');