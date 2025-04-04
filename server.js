
        const express = require('express');
        const { Client } = require('pg');
        const app = express();
        const port = process.env.PORT || 3000;

        app.use(express.static('public')); // Serve static files (like CSS, images)

        // Database connection
        const db = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        db.connect((err) => {
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

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    