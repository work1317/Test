// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function (app) {
//   app.use(
//     '/',  // This is the base path for your API requests
//     createProxyMiddleware({
//       target: 'http://localhost:8000',  // Your backend server address
//       changeOrigin: true,              // Needed for CORS
//       secure: false,                   // Disable SSL verification (for local dev)
//     })
//   );
// };


const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '', // Remove `/api` when forwarding to backend
      },
      logLevel: 'debug', // Optional: helps you debug proxying
    })
  );
};
