from node:20-alpine

workdir /app

copy package.json package-lock.json ./

run npm install


copy . .

expose 3000


cmd ["node" , "dist/index.js"]