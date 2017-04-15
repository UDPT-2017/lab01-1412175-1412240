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
  var query = client.query("SELECT * FROM albums",function(err, result) {
                     result.rows.forEach(function(row){
                       images.push({
                         id: row.id,
                         name: row.name,
                         creator: row.crator,
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
  else{
    var image=[
      {photo:"image/avatar1.jpg",caption:"Trần Hiệp-1412175"},
      {photo:"image/avatar2.jpg",caption:"Bùi Đình Khánh-1412175"}
    ];

    res.render('about',{title: 'MyBlog.me About',
                        message: 'About Us',
                        info:'Nhóm chúng tôi là "Chim cút nướng". Gồm 2 thành viên:',
                        address:'Địa chỉ:Trường đại học khoa học tự nhiên TPHCM 227, Nguyễn Văn Cừ, Quận 5, TP Hồ Chí Minh',
                        layout: 'app',
                        about: 'active',
                        image:image});
}});

app.get('/photos/:id',function(req,res){
  var client = new pg.Client(conString);
  client.connect();
  var images=[];
  var name_album='';
  var namebcrumbs =[
    'Albums',
    'Photos'
  ];
  var query = client.query("SELECT * FROM photos where id_albums = $1",[req.params.id],function(err, result) {
                     result.rows.forEach(function(row){
                       images.push({
                         id: row.id,
                         name: row.name,
                         creator: row.crator,
                         views: row.views,
                         id_views: row.id_views
                       });
                         console.log(row.name);
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
