# Tech Educators - Week 04 - Guest Book

I placed a form at the top of the page which will take in a users name
and the message from the suer, I also took an email address as I was
planning that message deletion would require that you submit an email 
address after clicking the delete button, however, decided to just leave 
this open as I wanted more to lean towards emulating a login system in 
order to toy around. The screen utilisation is designed for a mobile 
phone screen which stretches out in order to utilise screen space more 
effectively on wider screens.

The backend API provides multiple routes for interaction, a GET /messages
route provides the means for the client to request information from the server,
as well as a POST /messages route for sending messages to the client. 
I also provided a seed.js file in the server which will populate the database
with some entries.

Furthermore, I opted to add form validation on the client in order to ensure 
that a supported client will not send invalid data, but, also, I ensured that 
data is validated on the server in order to protect against bad data being 
inserted into 
the database.
I added a likes endpoint which allows for people to add a like to the database, 
as well as the means to delete messages, in a proper implementation, I would tie 
this to a user login in order to support removing likes and preventing duplicate 
likes from being added by a person. for the sake of testing and time, I opted to 
not implement this, especially as I'm not 100% sure on how I would tackle JWT 
without a disk to store a keypair.
HMAC based tokens looked attractive, however, I opted to not go down that route 
for the sake of the assignment.


I also opted to add a websocket to allow for live commenting, this allows for a 
client to see new messages without refreshing the page, I also opted to allow 
for using web sockets to support a client to watch new likes come in live. 

I tend to find that design is kinda hard, I find creating the wireframes in my 
mind of how I generally want stuff to be laid out on the page is the general easy 
part, but, approaching adding a level of flair is hard, because I often find myself
want to add things like borders to add some more hard visual boundaries. This time,
I opted to keep them to a minimum, and I feel that generally it looks a lot more
streamlined.
