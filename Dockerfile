from node:20-alpine

workdir /app
run apk add --no-cache git bash
run git config --global user.name "sweagent0302-source"
run git config --global user.email "sweagent0302@gmail.com"
copy package.json package-lock.json ./

run npm install


copy . .
run chmod +x /app/src/shell/gitclone.sh
RUN chmod +x /app/src/shell/setup.sh
run npx prisma generate
run npm run build

expose 3000


cmd ["node" , "dist/index.js"]