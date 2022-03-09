# Blog-api

## _Backend api of a blog view/creation sites_

Blog-api is a simple backend of api-endpoints to interact with the blog site Database.

visit _server_/docs for a Swagger description of all endpoints

1 users

- login
- logout

2 post

- list/public
- list/protected
- /count
- /create
- /publish
- /comment
- postDetails/{postId}

## deployment

`git push heroku main`
Obviously assuming we want to deploy main to the Heroku server.

## tests

`npm run test` currently using supertest & jest

## current consumers

https://github.com/JohnGammie/blog-api-viewer-react
