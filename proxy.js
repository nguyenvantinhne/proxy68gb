const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

const ALLOWED_DOMAINS = ['http://tooltxvip.top', 'https://tooltxvip.top'];

// Cấu hình CORS chỉ cho phép đúng domain
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, false); // Không origin -> chặn luôn
    const isAllowed = ALLOWED_DOMAINS.includes(origin);
    callback(isAllowed ? null : new Error('Blocked by CORS'), isAllowed);
  },
  methods: ['GET'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Kiểm tra thêm `Origin` hoặc `Referer` để chặn bot/Postman
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowed = ALLOWED_DOMAINS.some(domain => origin.startsWith(domain));
  
  if (!isAllowed) {
    return res.status(403).json({
      status: 'error',
      message: 'CHÀO EM NHA !!!'
    });
  }

  next();
});

// Gọi API gốc
const ORIGIN_API = 'https://ws68gb.onrender.com/api/68gb';

app.get('/api/68gb', async (req, res) => {
  try {
    const response = await axios.get(ORIGIN_API);
    const data = response.data;

    const result = {
      phien_hien_tai: data.phien_hien_tai || data.data?.next_session || '...',
      du_doan: data.du_doan || data.data?.prediction || '...',
      do_tin_cay: data.do_tin_cay || parseInt(data.data?.confidence || 0),
      timestamp: Date.now(),
      status: 'success'
    };

    res.json(result);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Không lấy được dữ liệu',
      timestamp: Date.now()
    });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Chạy tại http://localhost:${PORT}/api/68gb`);
});
