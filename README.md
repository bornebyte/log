# Log - A Command-Line Journaling Tool

`log` is a simple yet powerful command-line tool for creating, managing, and searching personal logs or notes directly from your terminal. It stores data locally in a JSON file and provides a rich set of commands for interacting with your entries.

## Features

- **Create & Manage Entries**: Quickly log new entries with titles, bodies, and categories.
- **Multiple Entry Types**: Supports plain text and list-based entries.
- **Search**: Full-text search across titles, bodies, and categories.
- **Secure**: Password-protected access to all commands.
- **Organize**: Mark entries as favorites (`fav`), hide sensitive entries, and categorize your logs.
- **Admin Controls**: A separate admin password can be set to manage user permissions.
- **Data Management**: Backup, restore, and reset your log data.

## Prerequisites

- Node.js (v14 or higher recommended)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bornebyte/log.git
    cd log
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Make the script executable (optional but recommended):**
    This allows you to run `log` as a command.
    ```bash
    # On macOS / Linux
    chmod +x index.js
    
    # You can then create a symlink to run it from anywhere
    # sudo ln -s /path/to/your/log/index.js /usr/local/bin/log
    ```
    If you don't make it executable, you will run commands with `node index.js <command>`. For simplicity, this guide assumes you've made it executable and aliased as `log`.

## Getting Started

Before you can start logging, you need to initialize the tool. This will create a `config.json` file and ask for a default username.

```bash
./index.js init
```

Next, set your password. This password will be required every time you run a command.

```bash
./index.js chpass
```

Now you're ready to go!

## Usage

All commands (except `init`) require you to enter your password first.

### Common Commands

| Command          | Alias | Description                                        |
| ---------------- | ----- | -------------------------------------------------- |
| `l`              |       | Create a new log entry (interactive).              |
| `g`              |       | Get and display all log entries.                   |
| `s`              |       | Search for entries (interactive).                  |
| `u`              |       | Update an existing entry by ID.                    |
| `d`              |       | Delete (soft delete) an entry by ID.               |
| `list`           |       | List all entry IDs.                                |
| `show fav`       |       | Show all entries marked as favorites.              |
| `show hidden`    |       | Show the content of all hidden entries.            |
| `mkfav <id>`     |       | Mark an entry as a favorite.                       |
| `rmfav <id>`     |       | Remove an entry from favorites.                    |
| `hide <id>`      |       | Hide an entry's content from the default view.     |
| `unhide <id>`    |       | Unhide an entry.                                   |
| `chpass`         |       | Change your user password.                         |
| `chuser`         |       | Change your username.                              |
| `whoami`         |       | Display the current username.                      |
| `backup`         |       | Create a backup of your data file.                 |
| `v`              |       | Show the application version.                      |

### Example

```bash
# Create a new log entry
$ ./index.js l
Password: ****
Login as myuser
Title : My first log
Type : plain
Body : This is a test of the command line log tool.
Category : test project
Hidden (True/False) : f

# Search for the entry
$ ./index.js s
Password: ****
Login as myuser
Search : test
```

## Contributing

Contributions are welcome! If you'd like to help improve `log`, please feel free to fork the repository, make your changes, and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
