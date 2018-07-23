# That's Delicious

A full stack restaurant application where users can **search**, **geolocate**, **review** and **add/edit** their favourite restaurants from around the world.

[Demo can be found here](https://thats-delicious-wb.herokuapp.com/)

The application has three main models — **Users**, **Stores** and **Reviews** — all of which are relational. It is designed to hit upon many of today's application needs such as **user authentication/authorization**, **database storage/relationships/aggregations/queries**, **Ajax REST API**, **file upload** and **image resizing**.

> ES6 features are heavily used throughout the code base, as well as, ES7 (async/await)

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/64px-Node.js_logo.svg.png" alt="NodeJS" width="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Mongo-db-logo.png" alt="mongoDB" width="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/GoogleMaps_logo.svg/64px-GoogleMaps_logo.svg.png" alt="GoogleMaps" width="50px">
  <img src="https://camo.githubusercontent.com/ab4819e1fbf93a827274582b4598439be2d07efa/68747470733a2f2f73332d65752d776573742d312e616d617a6f6e6177732e636f6d2f69682d6d6174657269616c732f75706c6f6164732f75706c6f61645f36373662343336666366343765373162316638356362643864333138613038302e706e67" alt="PassportJS" width="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png" alt="Express" width="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Sass_Logo_Color.svg/64px-Sass_Logo_Color.svg.png" alt="Sass" width="50px">
  <img src="https://github.com/pugjs/pug-logo/blob/master/PNG/pug-final-logo_-colour-64.png?raw=true" alt="PugJS" width="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Webpack.png/64px-Webpack.png" alt="Webpack" width="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/64px-Unofficial_JavaScript_logo_2.svg.png" alt="JS" width="50px">
</p>

---

## Developer Installation

1. Clone/Download this repository
1. In your terminal, switch your current working directory to the root of this project
    ```bash
    cd /thats-delicious
    ```
1. Copy ```variables.env.sample``` to ```variables.env```
      * Add your mongoDB credentials to ```DATABASE``` key
      * Add your SMTP server credentials to ```MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT``` keys
1. Install project dependencies and run the project locally
    ```bash
    npm i && npm run dev
    ```
1. The app should now be running. open your browser at ```http://localhost:7777/```

### Loading test/sample data locally

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

_This will populate 18 stores with 3 users and 24 reviews to your database._

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

The logins for the users are as follows:

| Name          | Email (login)                 | Password |
| :-----------: | :---------------------------: | :------: |
| John          | john@example<span></span>.com | john     |
| Jane          | jane@example<span></span>.com | jane     |
| Bob           | bob@example<span></span>.com  | bob      |

