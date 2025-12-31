# Build stage
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o petin-backend-core ./cmd

# Final stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/petin-backend-core .
COPY configs.json .
CMD ["./petin-backend-core"]
