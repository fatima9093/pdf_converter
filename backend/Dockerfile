FROM node:18

# Install poppler-utils (Linux Poppler binaries)
RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
