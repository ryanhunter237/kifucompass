# Kifu Compass

A web-based Go (Weiqi/Baduk) game interface that displays suggested next moves based on game databases. This tool helps players explore common move patterns and learn from professional game records.

## Features

- **Interactive 9x9 Go Board**: Full-featured game board with stone placement, undo/redo functionality
- **Move Suggestions**: Visual indicators showing popular next moves with frequency counts

## Usage

- **Place Stones**: Click on board intersections to place black and white stones alternately
- **Undo/Redo**: Use the control buttons to navigate through move history
- **Clear Board**: Reset the game to start over
- **View Suggestions**: Blue circles with numbers indicate popular next moves and their frequency

## Development

Run the full stack with Docker Compose to keep the API, database, frontend, and nginx proxy in sync during development.

- **Prerequisites**: Install Docker (with the Compose plugin) and ensure the `ogs_database_dbdata` volume exists with `docker volume create ogs_database_dbdata` before the first start.
- **Build & boot for a fresh test pass**: `docker compose up --build` rebuilds images after you change source code or dependencies; use it ahead of any manual QA or regression testing so that you are exercising the latest containers.
- **Iterate on features**: `docker compose up -d` starts the stack in the background, letting you refresh the UI at `http://localhost` or hit `http://localhost/api/movecounts` while you test changes.
- **Watch services while testing**: `docker compose logs -f api` (or `frontend`) tails logs so you can confirm requests and spot errors as you run through test scenarios.
- **Hot-restart a service mid-test**: `docker compose restart api` is handy after tweaking backend code; restart the specific service and repeat your checks without rebuilding everything.
- **Tear down after tests**: `docker compose down` stops the containers when you finish, keeping your environment clean for the next test session (the external database volume is preserved).
