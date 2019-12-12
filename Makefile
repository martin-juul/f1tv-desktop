
deps:
	npm install
	@echo "Dependencies installed!"

start:
	npm run start

build:
	npm run electron:local

build-linux:
	npm run electron:linux

build-mac:
	npm run electron:mac

build-win:
	npm run electron:windows

test:
	npm run test
