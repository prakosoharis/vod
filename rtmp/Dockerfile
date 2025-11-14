FROM alfg/nginx-rtmp:latest

# Copy our custom nginx configuration
COPY nginx-rtmp.conf /etc/nginx/nginx.conf

# Create necessary directories
RUN mkdir -p /usr/local/nginx/html/hls /usr/local/nginx/html/data

# Set correct permissions (using root since nginx user may not exist)
RUN chown -R 1001:1001 /usr/local/nginx/html

EXPOSE 1935 80

CMD ["nginx", "-g", "daemon off;"]