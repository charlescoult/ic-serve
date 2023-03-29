
# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN yarn build

# Expose port 8080 to the host machine
EXPOSE 8080

# Start the React app
CMD ["yarn", "start"]

