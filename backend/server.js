const express = require('express');
const cors = require('cors');
const axios = require('axios');
const redis = require('redis');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Redis Client
let redisClient;
(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('✅ Redis connected'));

  await redisClient.connect();
})();

// MongoDB Client
let mongoClient;
let db;
let ipsCollection;

(async () => {
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017/ipsqls');
    await mongoClient.connect();
    console.log('✅ MongoDB connected');
    
    db = mongoClient.db('ipsqls');
    ipsCollection = db.collection('ips');
    
    // Crear índice en el campo ip
    await ipsCollection.createIndex({ ip: 1 }, { unique: true });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
})();

/**
 * Busca información de IP con la siguiente estrategia:
 * 1. Redis (cache rápido en memoria)
 * 2. MongoDB (persistencia)
 * 3. API externa (ip-api.com)
 */
async function getIpInfo(ip) {
  try {
    // 1. Buscar en Redis
    const cachedData = await redisClient.get(`ip:${ip}`);
    if (cachedData) {
      console.log(`🟢 Cache hit (Redis): ${ip}`);
      return { ...JSON.parse(cachedData), source: 'redis' };
    }

    // 2. Buscar en MongoDB
    const mongoData = await ipsCollection.findOne({ ip });
    if (mongoData) {
      console.log(`🟡 Cache hit (MongoDB): ${ip}`);
      
      // Guardar en Redis para futuras consultas
      await redisClient.setEx(
        `ip:${ip}`,
        parseInt(process.env.CACHE_TTL) || 86400,
        JSON.stringify(mongoData)
      );
      
      return { ...mongoData, source: 'mongodb' };
    }

    // 3. Consultar API externa
    console.log(`🔵 Fetching from API: ${ip}`);
    const apiUrl = process.env.IP_API_URL || 'http://ip-api.com/json';
    const response = await axios.get(`${apiUrl}/${ip}`);
    const data = { ip, ...response.data, fetchedAt: new Date() };

    // Guardar en MongoDB (solo si la respuesta fue exitosa)
    if (data.status === 'success') {
      await ipsCollection.updateOne(
        { ip },
        { $set: data },
        { upsert: true }
      );

      // Guardar en Redis
      await redisClient.setEx(
        `ip:${ip}`,
        parseInt(process.env.CACHE_TTL) || 86400,
        JSON.stringify(data)
      );
    }

    return { ...data, source: 'api' };
  } catch (error) {
    console.error(`Error processing IP ${ip}:`, error.message);
    throw error;
  }
}

// Rutas
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    redis: redisClient.isOpen ? 'connected' : 'disconnected',
    mongodb: mongoClient ? 'connected' : 'disconnected'
  });
});

// Obtener información de una IP
app.get('/api/ip/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ error: 'Formato de IP inválido' });
    }

    const data = await getIpInfo(ip);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener información de IP',
      message: error.message 
    });
  }
});

// Obtener información de múltiples IPs (en batch)
app.post('/api/ips/batch', async (req, res) => {
  try {
    const { ips } = req.body;
    
    if (!Array.isArray(ips)) {
      return res.status(400).json({ error: 'Se esperaba un array de IPs' });
    }

    const results = [];
    for (const ip of ips) {
      try {
        const data = await getIpInfo(ip);
        results.push(data);
        
        // Pequeño delay para respetar rate limit de ip-api.com (si se usa)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          ip,
          status: 'fail',
          message: error.message,
          source: 'error'
        });
      }
    }

    res.json({ results, total: results.length });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al procesar batch de IPs',
      message: error.message 
    });
  }
});

// Estadísticas de caché
app.get('/api/stats', async (req, res) => {
  try {
    const totalIps = await ipsCollection.countDocuments();
    const redisKeys = await redisClient.keys('ip:*');
    
    res.json({
      mongodb: {
        totalIps,
        message: `${totalIps} IPs almacenadas en MongoDB`
      },
      redis: {
        cachedIps: redisKeys.length,
        message: `${redisKeys.length} IPs en caché Redis`
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      message: error.message 
    });
  }
});

// Limpiar caché
app.delete('/api/cache/clear', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: 'Caché Redis limpiado' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al limpiar caché',
      message: error.message 
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await redisClient.quit();
  await mongoClient.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
