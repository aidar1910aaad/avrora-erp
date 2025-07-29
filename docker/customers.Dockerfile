FROM python:3.11-slim

WORKDIR /app

COPY ./services/customer_service /app
COPY ./services/shared /app/shared
COPY ./services/requirements.txt /app
COPY ./services/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh
RUN pip install --upgrade pip && pip install -r requirements.txt

ENV PYTHONPATH=/app

ENTRYPOINT ["bash", "/app/entrypoint.sh"]
