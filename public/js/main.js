$(document).ready(function(){
  $(window).resize(function() {
  var path = $(this);
  var contW = path.width();
  if(contW > 768){
      document.getElementsByClassName("blog-sidenav")[0].style.display = "block";
      document.getElementsByClassName("blog-main")[0].style.marginLeft = "230px";
      document.getElementsByClassName("drag-out")[0].style.display = "none";
    }
  else{
        document.getElementsByClassName("blog-sidenav")[0].style.display = "none";
        document.getElementsByClassName("blog-main")[0].style.marginLeft = "15px";
        document.getElementsByClassName("breadcrumb")[0].style.marginLeft = "20px;";
    }
  });
  $('#btn-in').click(function(){
      document.getElementsByClassName("blog-sidenav")[0].style.display = "block";
      document.getElementsByClassName("drag-out")[0].style.display = "block";
      document.getElementsByClassName("blog-main")[0].style.marginLeft = "230px";
  })
  $('#btn-out').click(function(){
      document.getElementsByClassName("blog-sidenav")[0].style.display = "none";
      document.getElementsByClassName("drag-out")[0].style.display = "none";
      document.getElementsByClassName("blog-main")[0].style.marginLeft = "15px";
  })
});


    function myMap() {
        var mapOptions = {
            center: new google.maps.LatLng(10.762828, 106.681984),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.HYBRID
        }
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    }
