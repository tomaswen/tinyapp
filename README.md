# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Registered users will have the ability to create, update, and delete their own links as they see fit. However, users can share 
the link through a /u/:link format to anyone and they will be redirected to its corresponding website. TinyApp for now is 
run through localhost at *PORT: 8080*. TinyApp common error handling is done through an alert system as shown below in the 
last screenshot. TinyApp uses **bcrypt** to hash the passwords and **cookie-session** for cookie encryption to give the user 
a secure and comfortable time while creating a short URL. 

## Final Product

!["TinyApp homepage when not logged in."](https://github.com/tomaswen/tinyapp/blob/master/docs/tinyapp-home.png)
!["TinyApp main page displaying all URLs owned by the user"](https://github.com/tomaswen/tinyapp/blob/master/docs/tinyapp-urls.png)
!["TinyApp page for a specific short URL"](https://github.com/tomaswen/tinyapp/blob/master/docs/tinyapp-specificUrl.png)
!["TinyApp login page"](https://github.com/tomaswen/tinyapp/blob/master/docs/tinyapp-login.png)
!["TinyApp common error handling"](https://github.com/tomaswen/tinyapp/blob/master/docs/tinyapp-error.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
