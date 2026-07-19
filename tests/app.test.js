const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp, resetDb, connectDb } = require('../server');

test('register and list products', async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  await connectDb();
  await resetDb();

  const app = await createApp();
  const server = app.listen(0);

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ava', email: 'ava@example.com', password: 'secret123' })
    });

    assert.equal(registerResponse.status, 201);

    const productsResponse = await fetch(`${baseUrl}/api/products`);
    assert.equal(productsResponse.status, 200);
    const products = await productsResponse.json();
    assert.ok(Array.isArray(products));
    assert.ok(products.length >= 10);
    const names = products.map((product) => product.name);
    assert.ok(names.includes('Dress'));
    assert.ok(names.includes('Snacks'));
    assert.ok(names.includes('Detergent'));
    assert.ok(names.includes('Smartphone'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongod.stop().catch(() => {});
  }
});
