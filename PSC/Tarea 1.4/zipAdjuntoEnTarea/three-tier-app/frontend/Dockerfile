
# frontend/Dockerfile
FROM python:3.11

WORKDIR /app

COPY main_server.py .
COPY user_interface.html .

RUN pip install flask

EXPOSE 9999

CMD ["python", "main_server.py"]
