var express = require('express');
var exphbs  = require('express-handlebars');
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var conString = "postgres://AdminMyBlog:123456@localhost:5432/myBlogAdmin";

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('hbs', exphbs({extname: 'hbs'}));
app.set('view engine', 'hbs');

app.use(express.static('public'));

app.get('/',function(req,res){
  if(!req.session.username){
    res.redirect('/login');
  }
  else
    res.render('home',{title: 'MyBlog.me Home',
                      message: 'this is my homepage',
                      layout: 'app',
                      home: 'active'});
});

app.get('/login',function(req,res){
  if(req.session.username){
    res.redirect('/');
  }
  else if(req.session.error)
    res.render('login',{title: 'Login My Blog',message: 'Login to  MyBlog',error: 'ERROR!!! Invalid username.'});
  else {
      res.render('login',{title: 'Login My Blog',message: 'Login to  MyBlog'});
  }
});
app.get('/albums',function(req,res){
  var client = new pg.Client(conString);
  client.connect();
  var images=[];
  var namebcrumbs =[
    'Albums'
  ]
  client.query("UPDATE albums set views = ( select sum(Views)  from photos where photos.id_albums = albums.id)");
  var query = client.query("SELECT * FROM albums",function(err, result) {
                     result.rows.forEach(function(row){
                       images.push({
                         id: row.id,
                         name: row.name,
                         creator: row.creator,
                         views: row.views,
                         image: 'images/'+ row.name + '/'+ row.image
                       });
                     });
                     if(!req.session.username){
                       res.redirect('/login');
                     }
                     else
                       res.render('albums',{title: 'MyBlog.me Albums',
                                            images: images,
                                            namebcrumbs: namebcrumbs,
                                            layout: 'app',
                                            album: 'active'});
                    client.end();
           });
});

app.get('/blog',function(req,res){
  if(!req.session.username){
    res.redirect('/login');
  }
  else
    res.render('blog',{title: 'MyBlog.me blog',
                        message: 'Blog',
                        layout: 'app',
                        blog: 'active'});
});

app.get('/about',function(req,res){
  if(!req.session.username){
    res.redirect('/login');
  }
  else
    res.render('about',{title: 'MyBlog.me about',
                        message: 'About',
                        layout: 'app',
                        about: 'active'});
});

app.get('/albums/:id',function(req,res){
  var client = new pg.Client(conString);
  client.connect();
  var images=[];
  var namebcrumbs =[
    'Albums',
    'Photos'
  ];
  var query = client.query("SELECT * from select_album($1);",[req.params.id],function(err, result) {
                     result.rows.forEach(function(row){
                       images.push({
                         id: row.id,
                         name: row.name,
                         creator: row.creator,
                         views: row.views,
                         id_views: row.id_views
                       });
                     });
                     if(!req.session.username){
                       res.redirect('/login');
                     }
                     else
                       res.render('photos',{title: 'MyBlog.me Photos',
                                            images: images,
                                            namebcrumbs: namebcrumbs,
                                            layout: 'app',
                                            album: 'active'});
                      client.end();
           });
});

app.get('/photos/:id',function(req,res){
  var client = new pg.Client(conString);
  var images=[];
  var namebcrumbs =[
    'Albums',
    'Photos',
    req.params.id
  ];
  client.connect();
  client.query("UPDATE photos set views = views+1 where id= $1;",[req.params.id]);
  var query = client.query("select * from photos where id= $1;",[req.params.id],function(err, result) {
              result.rows.forEach(function(row){
                    images.push({
                          id: row.id,
                          name: row.name,
                          creator: row.creator,
                          views: row.views,
                          id_views: row.id_views
                        });
                  });
                  if(!req.session.username){
                    res.redirect('/login');
                  }
                  else
                    res.render('imagee',{title: 'MyBlog.me Photos',
                                         images: images,
                                         namebcrumbs: namebcrumbs,
                                         layout: 'app',
                                         album: 'active'});
                   client.end();
           });
});

app.post('/log-in',function(req,res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query("SELECT username, password FROM users where username = $1 and password = $2",
                     [req.body.user, req.body.pass],function(err, result) {

                       if(result.rowCount === 0){
                         req.session.error=true;
                         res.redirect('/login');
                       }
                        else{
                          req.session.username = req.body.user;
                          res.redirect('/');
                          client.end();
                        }
             });
});

app.get('/register',function(req,res){
  if(req.session.exists){
    res.render('signup',{title: 'MyBlog.me sign-up',message: 'Sign Up',exists: 'Sorry, that username already exists.'});
  }
  else
    res.render('signup',{title: 'MyBlog.me sign-up',message: 'Sign Up'});
});

app.post('/sign-up',function(req,res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query("INSERT INTO users(username, password) SELECT $1::VARCHAR, $2 WHERE NOT EXISTS (SELECT username FROM users WHERE username = $1);",
                [req.body.user, req.body.pass],function(err, result) {
                  if(result.rowCount === 0){
                    req.session.exists = true;
                    res.redirect('/register');
                  }
                   else{
                      res.redirect('/');
                   }
                   client.end();
        });
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			res.redirect('/');
		}
	});

});

app.listen(8000,function(){
  console.log("listening on port 8000");
});
