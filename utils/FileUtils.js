const fs = require("fs");

const createDirectoryIfNotExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log(`Directory '${directory}' created.`);
    } else {
        console.log(`Directory '${directory}' already exists.`);
    }
};

module.exports = {createDirectoryIfNotExists}