# Use latest Node.js image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package and yarn files from the Nx root
COPY package.json yarn.lock ./

# Install dependencies globally
RUN yarn global add nx && yarn install --frozen-lockfile

# Copy the backend project files
COPY . .

# Explicitly copy the .env.template file
COPY apps/diax-back/.env.template .env.template

# Rename the .env.template to .env
RUN mv .env.template .env

# Expose the application port
EXPOSE 3000

# Set the command to run your application
CMD ["yarn", "nx", "run", "diax-back:serve","--configuration=production"]