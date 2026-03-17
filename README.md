# log

Terminal journaling utility for creating, searching, and managing private log entries.

## What changed

- The CLI now supports proper global command usage through npm bin mapping.
- Runtime files are now stored in a user directory (`~/.log-cli`) instead of the project folder.
- Docker support is included.

## Requirements

- Node.js 18+

## Install

### Option 1: Clone and use globally (recommended)

```bash
git clone https://github.com/bornebyte/log.git
cd log
npm install
npm link
```

Now you can run the command from anywhere:

```bash
log help
```

### Option 2: Use locally in repo

```bash
npm install
node index.js help
```

## First run

```bash
log init
log chpass
```

Default password is empty, so on first secure command just press Enter.

## Data location

All runtime files are stored under:

```bash
~/.log-cli
```

Includes:

- `config.json`
- `data/data.json`
- `backup/backup.json`

## Docker

### Build image

```bash
docker build -t log-cli .
```

### Run command with persistent data volume

```bash
docker run --rm -it -v log-data:/root/.log-cli log-cli init
docker run --rm -it -v log-data:/root/.log-cli log-cli l
docker run --rm -it -v log-data:/root/.log-cli log-cli g
```

### Docker Compose

```bash
docker compose build
docker compose run --rm log init
docker compose run --rm log l
```

## Common commands

- `log l` create entry
- `log g` show entries
- `log s` search entries
- `log u` update entry
- `log d` soft delete entry
- `log list` list IDs
- `log show fav` show favorites
- `log show hidden` show hidden entries
- `log mkfav` mark favorite by ID
- `log rmfav` remove favorite by ID
- `log hide` hide by ID
- `log unhide` unhide by ID
- `log restore` un-delete by ID
- `log backup` create backup
- `log chpass` change user password
- `log chuser` change username
- `log v` version

## License

MIT. See LICENSE.
