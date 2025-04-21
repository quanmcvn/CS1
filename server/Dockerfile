# Dockerfile
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if any)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose your app port
EXPOSE 6968

# Start the app in dev mode
CMD ["npm", "run", "dev"]
