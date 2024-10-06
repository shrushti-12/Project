const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change this to your MySQL username
    password: 'Admin', // Change this to your MySQL password
    database: 'college'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Routes
app.get('/', (req, res) => {
    res.render('index'); // Render landing page with logo and company name
});

app.get('/admin/login', (req, res) => {
    res.render('admin-login'); // Render admin login page
});

app.post('/admin/dashboard', (req, res) => {
    const { username, password } = req.body;
    // Simple hardcoded validation (replace with your own logic)
    if (username === 'admin' && password === 'password') {
        req.session.isAdmin = true; // Set admin session
        res.redirect('/admin/dashboard');
    } else {
        res.send('Invalid credentials');
    }
});

app.get('/admin/dashboard', (req, res) => {
    if (req.session.isAdmin) {
        // Fetch users from the database
        db.query('SELECT * FROM users', (err, results) => {
            if (err) throw err;
            res.render('admin-dashboard', { users: results });
        });
    } else {
        res.redirect('/admin/login');
    }
});

app.post('/admin/add-user', (req, res) => {
    const { name, email, phone, address, caseDetail, compensationAmount, referrals, message } = req.body;
    const sql = 'INSERT INTO users (name, email, phone, address, caseDetail, compensationAmount, referrals, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, address, caseDetail, compensationAmount, referrals, message], (err) => {
        if (err) throw err;
        res.redirect('/admin/dashboard');
    });
});

app.post('/admin/update-message', (req, res) => {
    const { phone, message } = req.body;
    const sql = 'UPDATE users SET message = ? WHERE phone = ?';
    db.query(sql, [message, phone], (err) => {
        if (err) throw err;
        res.redirect('/admin/dashboard');
    });
});

app.get('/user/details', (req, res) => {
    res.render('user-details'); // Render user details page
});

app.post('/user/view-message', (req, res) => {
    const { phone } = req.body;
    const query = 'SELECT message FROM users WHERE phone = ?';
    db.query(query, [phone], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const userMessage=results[0].message
            res.send(`Message: ${userMessage}`); // Display message for the phone number
        } else {
            res.send('No user found with this phone number.');
        }
    });
});

// Start server
const PORT = 4002; // Change this to your desired port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});