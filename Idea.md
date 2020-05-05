Scrible is a blogging system where users can log in and read/write articles.

Features
-Read articles up to a particular length(Word limit)when not logged in.
-When logged in, They can read the full article.
-They can sign in with their google accounts[& Twitter accounts], and they will get email updates when someone they follow writes a new article.
-They can comment on articles when logged in
-They can "Star"[Star here is the equivalent of liking an article] an aricle when logged in.
-Every logged in user can write/create a post!!
-Posts can be created with images.

Additional Features
-Users can decide to make their articles paid.If they do so, users have to pay to read them.

Database Models
-User model => Create a new User => 
                                    Email, 
                                    Password, 
                                    Username
                                    Avatar
               Log in a user
               Log out a user
               User forgot password
               Delete User
               Update UserCredentials
               Follow a user => [get notified when a user you follow posts a new article]

-Post model => Create a new post =>
                                    Post
                                        Text
                                        Image
                                    Comment
                                        Text
                                        Image
                                    Likes

-there shoud be a route where a user can search for a blogpost by Name of the article
- A user should be able to search for another user and see the users comments, & posts if any.

Routes
-Create User => Done
-Login User with email & password 
Login user with twitter
-Create Blogpost => Done
-Read blogpost 
-Comment on a blog post
-Edit blogpost => Done
-Star a blogpost
-Search for a blog post
- search for a user and should get his blogposts & Comments

Immediate To-Do
- handle the images being stored in the database, both the blogpost header and the user avatar

setting up