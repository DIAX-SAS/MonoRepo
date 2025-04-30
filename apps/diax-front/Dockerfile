# Use the latest Node.js image
FROM node:latest AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package and yarn files from the Nx root
COPY package.json yarn.lock ./

# Install dependencies globally
RUN yarn global add nx && yarn install --frozen-lockfile

# Copy the backend project files
COPY . .

# Expose the application port
EXPOSE 80

RUN yarn nx run diax-front:build:production

# Set the command to run your application
CMD ["yarn", "nx", "run", "diax-front:serve", "--configuration=production","--port=80"]
