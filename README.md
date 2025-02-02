# Slate Assignment

This project is a student portal API built with Node.js, Express, and PostgreSQL. It provides authentication, student achievements management, and password reset functionalities.

## Project Structure

The main file for the project is server.js, which is in the main folder. All the other files are in the respective folders as per its functionality.

## Prerequisites

To run this project, you need below two

- Internet
- Docker (Windows Container)

that's it.

To run the project, make sure Docker is up and running. You can check by opening the Windows running apps tray, indicited using Up Arrow in your task bar. Once Docker is running, open up Powershell as an Admin and type

```
docker-compose up --build
```

This will download all the required images and will start the server on **port 5000**

`All the api endpoints are already setup in the Postman API collection.`

To start, open the register POST api request in the collection, and enter the details in Body as Raw/JSON format like,

```
{
    "username":"Parent",
    "email":"Parent@slate.com",
    "password":"123456789",
    "role":"parent",
    "linked_student_id":"b0af6e0d-5e50-4171-a913-2875a17b57f5"
}
```

By-default, there are 3 roles added in the database, `student, parent, school`.

To create a **Parent** user will need a Linked_Student_id , which you can get in the response on creating a **Student** user.

Similarly, to Login, use the Username and Password used when, registering. The auth Token will be automatically stored in the Postman Collection Variables.

You can then access the achievements, of the students. You can only access the achievements of the student if your ARE the student or you are the PARENT of the student, for both, the linked_student_id is used, then you can also add Achievements.

To access student's achievements, you need to entert the Linkedin_student_id in the Url as a query string, which is also already written in the postman.

> **A School can access all the students achievements**

If you forget your password, you can change the password using the below steps,

- Firstly, go to the **Forgot Password** request, enter your email address, in the Body. As there is no Frontend application, according to the current implementation, you will receive the Id and the Token required to change the password as a Response.
- Now, after you have received your Token and Id, navigate to the **Reset Password** request in which you have to enter the Token, Id and new Password in the Body as Json Object, which will then reset your password and then you can login using it.

Thank you
