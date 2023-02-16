# Node Js & Express MVC Web app.

A college project in Node JS using Express and MongoDB.<br>
Description: a basic "travel agency" website.

# Installation

1. Open a MongoDB project if you don't have one. 
2. Create a `.env` file and paste your MongoDB connection string in it, the file should look like this:
```
DB=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority
```
3. Create users in your MongoDB database according to the scheme in `database/account.js`. For example:
```
username: "admin"
password: "admin1"
permissions: "admin"
```
```
username: "bob"
password: "bob1"
permissions: "user"
IDnumber: "123456789"
cardNumber: "6789678967896789"
fullName: "Bob Bobby"
```
```
username: "david"
password: "david1"
permissions: "user"
```
4. Change "autoOpen" in `app.js` to your preferred launch method.
5. Run `npm i`
6. Start `app.js`.

# Usage
 
1. Login to your preferred user.
2. Admin users can: 
```
- adjust the seat ammount of each plane. (don't ask, college requirement)
- edit, delete and creates flights.
```
3. Regular users can:
```
- view existing flights, sort and filter flights.
- book tickets for available flights.
- have the app insert their payment details from the database (if they exist).
- or input a card manually to "pay" for the flight.
(Note that the app doesn't check for card validity and doesn't try to make a transaction.)
```
