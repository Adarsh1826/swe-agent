from node:20-alpine

workdir /app
run apk add --no-cache git bash
copy package.json package-lock.json ./

run npm install


copy . .
run chmod +x /app/gitclone.sh
run npm run build

expose 3000


cmd ["node" , "dist/index.js"]