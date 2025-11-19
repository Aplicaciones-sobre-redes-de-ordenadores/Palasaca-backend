# Dockerfile
FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --include=dev   # 👈 instala TODAS las dependencias, incluidas nodemon y dotenv

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]  