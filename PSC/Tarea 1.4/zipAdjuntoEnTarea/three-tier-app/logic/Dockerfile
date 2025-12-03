# logic/Dockerfile
FROM python:3.11

WORKDIR /app

COPY logic.py .
COPY main_endpoint.py .

RUN pip install flask flask-cors redis

EXPOSE 8000

CMD ["python", "main_endpoint.py"]

