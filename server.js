const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const USERS_FILE = './users.json';

app.use(bodyParser.json());

const loadUsers = () => {
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE);
        return JSON.parse(data);
    }
    return { employees: [] };
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

if (!fs.existsSync(USERS_FILE)) {
    saveUsers({
        companyName: "Example Company",
        employees: []
    });
}


app.get('/', (req, res) => {
    res.send('Welcome to the REST API!');
});

app.get('/users', (req, res) => {
    const data = loadUsers();
    res.json(data);
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const data = loadUsers();
    const user = data.employees.find((emp) => emp.id === parseInt(id));

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

app.post('/users', (req, res) => {
    const newUser = req.body;
    const data = loadUsers();

    if (!newUser.id || !newUser.name || !newUser.position || !newUser.location) {
        return res.status(400).json({ message: "All fields (id, name, position, location) are required." });
    }

    if (data.employees.some((emp) => emp.id === newUser.id)) {
        return res.status(400).json({ message: "User with this ID already exists." });
    }

    data.employees.push(newUser);
    saveUsers(data);
    res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    const data = loadUsers();
    const userIndex = data.employees.findIndex((emp) => emp.id === parseInt(id));

    if (userIndex !== -1) {
        data.employees[userIndex] = { ...data.employees[userIndex], ...updatedUser };
        saveUsers(data);
        res.json(data.employees[userIndex]);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const data = loadUsers();
    const userIndex = data.employees.findIndex((emp) => emp.id === parseInt(id));

    if (userIndex !== -1) {
        const removedUser = data.employees.splice(userIndex, 1);
        saveUsers(data);
        res.json(removedUser);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
