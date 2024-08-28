# Gunakan image Node.js versi terbaru sebagai base image
FROM node:22

# Set working directory di dalam kontainer
WORKDIR /usr/src/mysql-bot

# Salin file package.json dan package-lock.json ke dalam kontainer
COPY package*.json ./

# Install dependensi aplikasi
RUN npm install

# Salin sisa file aplikasi ke dalam kontainer
COPY . .

# Ekspos port aplikasi jika diperlukan (misalnya 3000)
EXPOSE 21001

# Perintah untuk menjalankan aplikasi
CMD ["node", "app.js"]
