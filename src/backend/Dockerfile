# Use an official Python image as a base image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the data collection script to the container
COPY . .

# Install any dependencies if needed
# install psycopg2 dependencies
RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && pip install psycopg2
RUN pip install --no-cache-dir -r requirements.txt

# Set PYTHONPATH
ENV PYTHONPATH="/app/src/backend"

# Expose port (if needed)
EXPOSE 8079

# Define the command to run the data collection script
CMD ["python", "main.py"]