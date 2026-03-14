# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM golang:1.26-alpine AS builder
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o bin/api ./cmd/api

# ─── Stage 2: Produktion (minimales Image) ────────────────────────────────────
FROM scratch AS runner

COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /build/bin/api /api

EXPOSE 3001
ENTRYPOINT ["/api"]

# ─── Stage: Entwicklung (mit Hot-Reload) ─────────────────────────────────────
FROM golang:1.26-alpine AS development
RUN apk add --no-cache git
RUN go install github.com/air-verse/air@latest

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

EXPOSE 3001
CMD ["air", "-c", ".air.toml"]
