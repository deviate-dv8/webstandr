FROM mcp/puppeteer

# Env
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Export port 8080 for Node
EXPOSE 8080

# Copy all app files into Docker Work directory
COPY . /app/

# Install dependencies
RUN npm install

# Build the app
RUN npm run build
# Start the app
CMD ["npm", "start"]
