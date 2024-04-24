# Project Title

This project is a Node.js application for fetching data from the Dash Hudson API and generating a CSV file based on the retrieved data. It utilizes environment variables for authentication and configuration. The application fetches media data from Dash Hudson API, extracts relevant information such as media ID, URL, and engagement predictions, and writes this data into a CSV file. The CSV file can be used for further analysis or reporting purposes.


## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)

## Prerequisites

Before running this project, ensure that you have the following installed:

- Node.js: [Download and Install Node.js](https://nodejs.org/)

## Installation

1. Clone the repository:

```sh
git clone https://github.com/yourusername/project.git
```

2. Install dependencies:

```sh
npm install
```

## Usage

### Environment Setup

1. Create a `.env` file in the root directory of the project.
2. Add your environment variables to the `.env` file:
```sh
BEARER_TOKEN=your_bearer_token_here
BRAND_ID=your_brand_id_here
```
Please refer to this [public doc](https://developer.dashhudson.com/docs/quickstart) for how to generate bearer token and where to find the brand ID in Dash Hudson. Replace `your_bearer_token_here` and `your_brand_id_here` with your actual values.

### Running the Code

```sh
node app.js
```
