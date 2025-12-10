.PHONY: db/migrations/new
db/migrations/new:
	@migrate create -ext sql -dir migrations -seq $(name)

.PHONY: db/migrations/up
db/migrations/up:
	@migrate -database postgres://postgres:bmwb1gtr@localhost:5432/access_management?sslmode=disable -path migrations up

.PHONY: db/migrations/down
db/migrations/down:
	@migrate -database postgres://postgres:bmwb1gtr@localhost:5432/access_management?sslmode=disable -path migrations down

.PHONY: db/migrations/version
db/migrations/version:
	@migrate -database postgres://postgres:bmwb1gtr@localhost:5432/access_management?sslmode=disable -path migrations version

.PHONY: db/migrations/force
db/migrations/force:
	@migrate -database postgres://postgres:bmwb1gtr@localhost:5432/access_management?sslmode=disable -path migrations force $(version)