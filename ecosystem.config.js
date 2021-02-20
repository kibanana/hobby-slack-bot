module.exports = {
  apps : [{
    name: "app",
    script: "./dist/index.js --max-old-space-size=8192 --stack-size=1968",
    instances: "1",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}