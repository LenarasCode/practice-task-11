require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

let productsCollection;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(); // Использует имя базы из строки подключения или дефолтную
        productsCollection = db.collection('products');
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ DB Error:', err);
    }
}
connectDB();

// --- Роуты (Все 5 методов для Task 11) ---

// 1. GET / - Главная
app.get('/', (req, res) => res.json({ status: "Server is online", port: PORT }));

// 2. GET /api/products - Получить все
app.get('/api/products', async (req, res) => {
    const products = await productsCollection.find().toArray();
    res.json(products);
});

// 3. GET /api/products/:id - Получить один
app.get('/api/products/:id', async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const product = await productsCollection.findOne({ _id: new ObjectId(req.params.id) });
    product ? res.json(product) : res.status(404).json({ error: "Not found" });
});

// 4. POST /api/products - Создать
app.post('/api/products', async (req, res) => {
    const result = await productsCollection.insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
});

// 5. PUT /api/products/:id - Обновить
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated successfully" });
});

// 6. DELETE /api/products/:id - Удалить
app.delete('/api/products/:id', async (req, res) => {
    await productsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Product deleted" });
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));