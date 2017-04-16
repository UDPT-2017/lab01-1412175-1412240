var express = require('express');
var exphbs  = require('express-handlebars');
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var app = express();
var conString = "postgres://AdminMyBlog:123456@localhost:5432/myBlogAdmin";

require('./config/passport.js')(passport);

var accout ={
  username: '',
  ava: ''
};

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
  app.use(passport.session());
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
                      username: accout.username,
                      ava: accout.ava,
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
                         image: '/images/'+ row.name + '/'+ row.image
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
                                            username: accout.username,
                                            ava: accout.ava,
                                            album: 'active'});
                    client.end();
           });
});

app.get('/blog',function(req,res){
  if(!req.session.username){
    res.redirect('/login');
  }
  else{
    var client = new pg.Client(conString);
    client.connect();
    var blogs=[];
    var namebcrumbs =[
      'Blog'
    ]
    var query = client.query("SELECT * FROM blogs",function(err, result) {
                     result.rows.forEach(function(row){
                       blogs.push({
                         id: row.id,
                         name: row.title,
                         content: row.contents.substr(0,15)+"...",
                         creator:row.creator,
                         views: row.views,
                         image: row.image
                       });
                     });

                     if(!req.session.username){
                       res.redirect('/login');
                     }
                     else
                       res.render('blog',{title: 'MyBlog.me Blog',
                                            blogs: blogs,
                                            namebcrumbs: namebcrumbs,
                                            layout: 'app',
                                            username: accout.username,
                                            ava: accout.ava,
                                            blog: 'active'});
                    client.end();
           });
  }

});

app.get('/about',function(req,res){
  if(!req.session.username){
    res.redirect('/login');
  }
  else{
    var image=[
      {photo:"/images/avatar1.jpg",caption:"Trần Hiệp-1412175"},
      {photo:"/images/avatar2.jpg",caption:"Bùi Đình Khánh-1412175"}
    ];

    res.render('about',{title: 'MyBlog.me About',
                        message: 'About Us',
                        info:'Nhóm chúng tôi là "Chim cút nướng". Gồm 2 thành viên:',
                        address:'Địa chỉ:Trường đại học khoa học tự nhiên TPHCM 227, Nguyễn Văn Cừ, Quận 5, TP Hồ Chí Minh',
                        layout: 'app',
                        about: 'active',
                        username: accout.username,
                        ava: accout.ava,
                        image:image});
      }
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
                                            username: accout.username,
                                            ava: accout.ava,
                                            album: 'active'});
                      client.end();
           });
});

app.get('/blog/:id',function(req,res){
var client = new pg.Client(conString);
 client.connect();
 var namebcrumbs =[
   'Albums',
   'Content'
 ];
 var query = client.query("SELECT * FROM blogs where id = $1",[req.params.id],function(err, result) {
                       var blogs={
                         id: result.rows[0].id,
                         name: result.rows[0].title,
                         content: result.rows[0].contents,
                         creator:result.rows[0].creator,
                         views: result.rows[0].views,
                        image: '/'+ result.rows[0].image
                       };

                     if(!req.session.username){
                       res.redirect('/login');
                     }
                     else
                       res.render('blogview',{title: 'MyBlog.me Blog',
                                            blogs: blogs,
                                            namebcrumbs: namebcrumbs,
                                            layout: 'app',
                                            username: accout.username,
                                            ava: accout.ava,
                                            blog: 'active'});
                      client.end();
           });
});

app.get('/photos/:id',function(req,res){
  var client = new pg.Client(conString);
 client.connect();
 var images=[];
 var name_album='';
 var namebcrumbs =[
   'Albums',
   'photos',
   req.params.id
 ];
 client.query("UPDATE photos set views = views+1 where id= $1;",[req.params.id]);
 var query = client.query("SELECT * FROM photos where id = $1",[req.params.id],function(err, result) {
                    result.rows.forEach(function(row){
                      images.push({
                        id: row.id,
                        name: row.name,
                        creator: row.crator,
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
                                           username: accout.username,
                                           ava: accout.ava,
                                           album: 'active'});
                     client.end();
          });
});

app.post('/login',function(req,res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query("SELECT * FROM users where (username = $1 or email=  $1) and password = $2",
                     [req.body.user, req.body.pass],function(err, result) {
                       if(result.rowCount === 0){
                         req.session.error=true;
                         res.redirect('/login');
                       }
                        else{
                          accout.username = result.rows[0].name;
                          accout.ava = result.rows[0].ava;
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

app.post('/signup',function(req,res) {
    var imgAva = '/images/ava-default.png';
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query("INSERT INTO users(username, password, email, ava, name) SELECT $1::VARCHAR, $2 , $3, $4, $5 WHERE NOT EXISTS (SELECT username FROM users WHERE username = $1 or email = $3);",
                [req.body.user, req.body.pass, req.body.email, imgAva, req.body.name],function(err, result) {
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

app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
   // handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
       passport.authenticate('facebook', function(err, result){
         console.log(result);
}));


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
