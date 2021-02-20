module.exports = {
  apps : [{
    name: "app",
    script: "./dist/index.js",
    instances: "1",
    env: {
      NODE_ENV: "development",
      PORT: 8000,
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 8000,
    }  
  }]
}