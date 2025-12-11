import 'dotenv/config';

import { db } from '@/drizzle/db';
import { mockEndpoint, mockPreset } from '@/drizzle/migrations/schema';

async function seedTestData() {
  console.log('🌱 Начинаем создание тестовых данных...\n');

  const now = String(Date.now());

  // 1. GET /api/users - Простой endpoint с одним preset
  const usersEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: usersEndpointId,
    method: 'GET',
    path: '/api/users',
    description: 'Получить список пользователей',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: usersEndpointId,
    name: 'Успешный ответ',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify([
      { id: 1, name: 'Иван', email: 'ivan@example.com', role: 'admin' },
      { id: 2, name: 'Мария', email: 'maria@example.com', role: 'user' },
      { id: 3, name: 'Петр', email: 'petr@example.com', role: 'user' }
    ]),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан GET /api/users');

  // 2. GET /api/products - Endpoint с множественными presets и query параметрами
  const productsEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: productsEndpointId,
    method: 'GET',
    path: '/api/products',
    description: 'Получить список продуктов с фильтрацией',
    createdAt: now,
    updatedAt: now
  });

  // Preset 1: Все продукты (активный)
  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: productsEndpointId,
    name: 'Все продукты',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify([
      {
        id: 1,
        name: 'Ноутбук',
        category: 'electronics',
        price: 50000,
        inStock: true,
        color: 'black'
      },
      {
        id: 2,
        name: 'Смартфон',
        category: 'electronics',
        price: 30000,
        inStock: true,
        color: 'white'
      },
      {
        id: 3,
        name: 'Планшет',
        category: 'electronics',
        price: 25000,
        inStock: false,
        color: 'black'
      },
      { id: 4, name: 'Наушники', category: 'audio', price: 5000, inStock: true, color: 'blue' },
      {
        id: 5,
        name: 'Клавиатура',
        category: 'accessories',
        price: 3000,
        inStock: true,
        color: 'black'
      }
    ]),
    filterKeys: JSON.stringify(['category', 'inStock', 'color']),
    createdAt: now,
    updatedAt: now
  });

  // Preset 2: Пустой ответ
  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: productsEndpointId,
    name: 'Пустой ответ',
    enabled: '0',
    statusCode: 200,
    responseData: JSON.stringify([]),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  // Preset 3: Ошибка сервера
  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: productsEndpointId,
    name: 'Ошибка 500',
    enabled: '0',
    statusCode: 500,
    responseData: JSON.stringify({
      error: 'Internal Server Error',
      message: 'Что-то пошло не так'
    }),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан GET /api/products с 3 presets (фильтрация по category, inStock, color)');

  // 3. POST /api/orders - Создание заказа
  const ordersEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: ordersEndpointId,
    method: 'POST',
    path: '/api/orders',
    description: 'Создать новый заказ',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: ordersEndpointId,
    name: 'Успешное создание',
    enabled: '1',
    statusCode: 201,
    responseData: JSON.stringify({
      id: 123,
      status: 'created',
      total: 35000,
      items: [
        { productId: 1, quantity: 1, price: 30000 },
        { productId: 4, quantity: 1, price: 5000 }
      ],
      createdAt: new Date().toISOString()
    }),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан POST /api/orders');

  // 4. PUT /api/users/:id - Обновление пользователя
  const updateUserEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: updateUserEndpointId,
    method: 'PUT',
    path: '/api/users/1',
    description: 'Обновить пользователя',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: updateUserEndpointId,
    name: 'Успешное обновление',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify({
      id: 1,
      name: 'Иван Обновленный',
      email: 'ivan.updated@example.com',
      role: 'admin',
      updatedAt: new Date().toISOString()
    }),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан PUT /api/users/1');

  // 5. DELETE /api/products/:id - Удаление продукта
  const deleteProductEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: deleteProductEndpointId,
    method: 'DELETE',
    path: '/api/products/1',
    description: 'Удалить продукт',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: deleteProductEndpointId,
    name: 'Успешное удаление',
    enabled: '1',
    statusCode: 204,
    responseData: JSON.stringify(null),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  // Preset 2: Не найдено
  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: deleteProductEndpointId,
    name: 'Не найдено',
    enabled: '0',
    statusCode: 404,
    responseData: JSON.stringify({ error: 'Product not found' }),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан DELETE /api/products/1 с 2 presets');

  // 6. GET /api/comments - С множественными presets и фильтрацией
  const commentsEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: commentsEndpointId,
    method: 'GET',
    path: '/api/comments',
    description: 'Получить комментарии с фильтрацией',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: commentsEndpointId,
    name: 'Все комментарии',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify([
      { id: 1, text: 'Отличный продукт!', author: 'user1', postId: 1, approved: true, rating: 5 },
      { id: 2, text: 'Не понравилось', author: 'user2', postId: 1, approved: false, rating: 2 },
      { id: 3, text: 'Нормально', author: 'user3', postId: 2, approved: true, rating: 4 },
      { id: 4, text: 'Супер!', author: 'user1', postId: 2, approved: true, rating: 5 },
      { id: 5, text: 'Плохо', author: 'user4', postId: 3, approved: false, rating: 1 }
    ]),
    filterKeys: JSON.stringify(['author', 'approved', 'postId', 'rating']),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан GET /api/comments с фильтрацией по author, approved, postId, rating');

  // 7. PATCH /api/users/:id/status - Частичное обновление
  const patchUserStatusId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: patchUserStatusId,
    method: 'PATCH',
    path: '/api/users/1/status',
    description: 'Обновить статус пользователя',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: patchUserStatusId,
    name: 'Статус обновлен',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify({
      id: 1,
      status: 'active',
      updatedAt: new Date().toISOString()
    }),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан PATCH /api/users/1/status');

  // 8. HEAD /api/health - Проверка здоровья
  const healthEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: healthEndpointId,
    method: 'HEAD',
    path: '/api/health',
    description: 'Проверка здоровья API',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: healthEndpointId,
    name: 'Здоров',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify({}),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан HEAD /api/health');

  // 9. OPTIONS /api/cors - CORS preflight
  const corsEndpointId = crypto.randomUUID();
  await db.insert(mockEndpoint).values({
    id: corsEndpointId,
    method: 'OPTIONS',
    path: '/api/cors',
    description: 'CORS preflight запрос',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(mockPreset).values({
    id: crypto.randomUUID(),
    mockEndpointId: corsEndpointId,
    name: 'CORS разрешен',
    enabled: '1',
    statusCode: 200,
    responseData: JSON.stringify({}),
    filterKeys: JSON.stringify([]),
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Создан OPTIONS /api/cors');

  console.log('\n✨ Все тестовые данные успешно созданы!');
  console.log('\n📋 Созданные endpoints:');
  console.log('  - GET    /api/users');
  console.log('  - GET    /api/products (3 presets, фильтрация)');
  console.log('  - POST   /api/orders');
  console.log('  - PUT    /api/users/1');
  console.log('  - DELETE /api/products/1 (2 presets)');
  console.log('  - GET    /api/comments (фильтрация)');
  console.log('  - PATCH  /api/users/1/status');
  console.log('  - HEAD   /api/health');
  console.log('  - OPTIONS /api/cors');
  console.log('\n🧪 Теперь можно тестировать через UI или напрямую через API!');
}

seedTestData()
  .then(() => {
    console.log('\n✅ Скрипт выполнен успешно');
    // eslint-disable-next-line node/prefer-global/process
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Ошибка при создании тестовых данных:', error);
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1);
  });
