
        const express = require('express');
        const { Client } = require('pg');
        const bodyParser = require('body-parser');
        const app = express();
        const port = process.env.PORT || 3000;

        app.use(express.static('public'));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        const db = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        db.connect(err => {
            if (err) throw err;
            console.log('Connected to the database');
        });

        // Routes
        app.get('/cars', (req, res) => {
            db.query('SELECT * FROM cars', (err, results) => {
                if (err) throw err;
                res.json(results.rows);
            });
        });
app.get('/car/:id', (req, res) => {
    const carId = req.params.id;
    db.query('SELECT * FROM cars WHERE id = $1', [carId], (err, results) => {
        if (err) throw err;
        const car = results.rows[0];
        res.send(`
            <div id="car-detail">
                <h1>${car.make} ${car.model}</h1>
                <p>${car.description}</p>
                <p>Price: $${car.price}</p>
                <img src="${car.image_url}" alt="${car.make} ${car.model}">
                <a href="https://wa.me/60172407116?text=I'm%20interested%20in%20the%20${car.make}%20${car.model}">Contact via WhatsApp</a>
            </div>
        `);
    });
});
        app.get('/car/:id', (req, res) => {
            const carId = req.params.id;
            db.query('SELECT * FROM cars WHERE id = $1', [carId], (err, results) => {
                if (err) throw err;
                const car = results.rows[0];
                res.send(`
                    <h1>${car.make} ${car.model}</h1>
                    <p>${car.description}</p>
                    <p>Price: $${car.price}</p>
                    <img src="${car.image_url}" alt="${car.make} ${car.model}">
                    <a href="https://wa.me/60172407116?text=I'm%20interested%20in%20the%20${car.make}%20${car.model}">Contact via WhatsApp</a>
                `);
            });
        });

        // Admin-protected API
        const validatePassword = (req, res) => {
            const password = req.body.password;
            if (password !== process.env.ADMIN_PASSWORD) {
                res.status(401).send('Unauthorized');
                return false;
            }
            return true;
        };

        app.post('/add-car', (req, res) => {
            if (!validatePassword(req, res)) return;
            const { make, model, year, price, description, image_url } = req.body;
            db.query('INSERT INTO cars (make, model, year, price, description, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
                [make, model, year, price, description, image_url], err => {
                    if (err) {
                        res.status(500).send('Error inserting car');
                        return;
                    }
                    res.send('Car added successfully');
                });
        });

        app.post('/reset-cars', (req, res) => {
            if (!validatePassword(req, res)) return;
            db.query('DELETE FROM cars', err => {
                if (err) {
                    res.status(500).send('Error resetting cars');
                    return;
                }
                res.send('All cars deleted');
            });
        });

        app.post('/delete-car', (req, res) => {
            if (!validatePassword(req, res)) return;
            const { id } = req.body;
            db.query('DELETE FROM cars WHERE id = $1', [id], err => {
                if (err) {
                    res.status(500).send('Error deleting car');
                    return;
                }
                res.send('Car deleted');
            });
        });

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    