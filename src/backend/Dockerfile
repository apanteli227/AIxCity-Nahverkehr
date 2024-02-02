# Use an official Python image as a base image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the data collection script to the container
COPY . /app

# Install any dependencies if needed
# install psycopg2 dependencies
RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && pip install psycopg2
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (if needed)
EXPOSE 8079

# Define the command to run the data collection script
CMD ["python", "data_collection/public_transit/public_transit_data_cleaner.py"]
# CMD ["uvicorn", "dashboard.main:app", "--host", "0.0.0.0", "--port", "8000"]