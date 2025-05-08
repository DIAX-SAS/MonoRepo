# Use the latest Node.js image
FROM node:latest AS builder

ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=1dgddk7rc0bir0mt3g403kojcc
ENV NEXT_PUBLIC_API_BASE_PATH=https://backend.diax.website
ENV NEXT_PUBLIC_SOCKET_URI=wss://d0978261uk2h0hot7q0x-ats.iot.us-east-1.amazonaws.com
ENV NEXT_PUBLIC_COGNITO_DOMAIN=https:/crud-diax.auth.us-east-1.amazoncognito.com
ENV NEXT_PUBLIC_FRONT_URI=https://diax.website

# Set the working directory inside the container
WORKDIR /app

# Copy package and yarn files from the Nx root
COPY package.json yarn.lock ./

# Install dependencies globally
RUN  yarn install --frozen-lockfile

# Copy the backend project files
COPY . .

# Expose the application port
EXPOSE 80

RUN yarn nx run diax-front:build:production

# Set the command to run your application
CMD ["yarn", "nx", "run", "diax-front:serve", "--configuration=production","--port=80"]
