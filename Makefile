DECK ?= deck@10.0.0.128
PLUGIN ?= ollama-deck

.PHONY: setup build typecheck lint tests check deploy clean

setup:
	npm install

build: setup
	npm run build

typecheck:
	npx tsc --noEmit

lint:
	python3 -m py_compile main.py

tests:
	python3 -m pytest tests -q

check: typecheck lint tests build
	@echo "All quality gates passed."

## Copy the plugin to the Deck and print the (sudo) install commands
deploy: build
	scp -r . "$(DECK):/tmp/$(PLUGIN)"
	@echo
	@echo "On the Steam Deck, run as deck (with sudo for the plugins dir):"
	@echo "  sudo rm -rf /home/deck/homebrew/plugins/$(PLUGIN)"
	@echo "  sudo cp -r /tmp/$(PLUGIN)/ /home/deck/homebrew/plugins/$(PLUGIN)"
	@echo "  # then reload Decky (Settings > Reload, or restart plugin_loader)"

clean:
	rm -rf node_modules dist