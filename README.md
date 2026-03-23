## Getting started

- npm install
- node server.js / npm start

## Usage

1. Put all JSON source data files under data folder. (has added one sample file in data folder)
2. Change the source JSON file name from which PDFs are genrated in constants.js file.
3. Start the server - this will read the JSON file specified and generate PDFs under *pdfs* folder.
4. It is also possible to request http://localhost:3000/ end point on a browser or as a GET request while server is running to regenerate the files without having to restart the server.