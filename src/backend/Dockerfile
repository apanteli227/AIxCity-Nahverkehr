# Use an official Python image as a base image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend code and requirements to the container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt


# Expose port 8000
EXPOSE 8000

# Define the command to run the backend
CMD ["uvicorn", "dashboard.main:app", "--host", "0.0.0.0", "--port", "8000"]
