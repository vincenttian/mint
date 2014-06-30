#Mint Family Summer 2014 Intuit Lean StartIn

###Libraries Used

Node.js Authentication:
http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local

Mongoose Docs:
http://mongoosejs.com/docs/

Python Shell:
https://www.npmjs.org/package/python-shell

###Setting Up Your Environment

#####Step 1: Clone the git repo 
$ git clone https://github.com/vincenttian/mint/

#####Step 2: Install Node package dependencies

cd into the cloned directory with $ cd mint and then run

$ npm install

#####Step 3: Install Brew (This may take a while)

If you already have brew installed, skip this step. Otherwise, download it.

$ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

#####Step 4: Install MongoDB

$ brew install mongodb

#####Step 5: Install pip (python install package manager)

$ easy_install pip

#####Step 6: Install python packages

$ pip install requests

###MongoDB

#####Start up the server

$ sudo mongod
#####Local Mongo shell

$ mongo


	Use a database

	> use <database>


	Show all db's

	> show dbs


	Show all collections

	> show collections


	Query all users

	> db.users.find()


	Find Specific User

	> db.users.findOne({linkedin_email:'jordeenchang@gmail.com'})


	Drop Specific collection

	> db.users.drop()


	Find All people in Bay Area

	> db.allpeoples.find({location: "San Francisco Bay Area"})
