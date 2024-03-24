# Use an official Node.js image as a base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application with Vite
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "dev"]

