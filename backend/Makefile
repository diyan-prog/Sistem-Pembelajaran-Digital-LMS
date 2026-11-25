build:
	go build -o bin/api ./cmd/api

run:
	go run ./cmd/api

test:
	go test ./...

vet:
	go vet ./...

lint:
	golangci-lint run

tidy:
	go mod tidy

clean:
	rm -rf bin