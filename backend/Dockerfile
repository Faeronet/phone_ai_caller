FROM golang:1.22-alpine AS builder

WORKDIR /src
RUN apk add --no-cache git

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o /out/backend ./cmd/server

FROM alpine:3.20

RUN apk add --no-cache ca-certificates wget
WORKDIR /app

COPY --from=builder /out/backend ./backend

RUN mkdir -p /app/uploads/products && chmod -R 755 /app/uploads

EXPOSE 8081

HEALTHCHECK --interval=5s --timeout=3s --retries=20 CMD wget -qO- /dev/null http://localhost:8081/healthz || exit 1

ENTRYPOINT ["/app/backend"]

