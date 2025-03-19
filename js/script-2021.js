
  //  Button  //
  var btn = $('#button');

$(window).scroll(function () {
if ($(window).scrollTop() > 700) {
btn.addClass('show');
} else {
btn.removeClass('show');
}
});

btn.on('click', function (e) {
e.preventDefault();
$('html, body').animate({
scrollTop: 0
}, '300');
});
  //   Button//



//  Tab of content //
function opentab(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }
  
  // Get the element with id="defaultOpen" and click on it
  document.getElementById("defaultOpen").click();



//   End Tab of Content//

// Sticky-tab//
window.onscroll = function() {myFunction()};

var header = document.getElementById("fixed");
var sticky = header.offsetTop;

function myFunction() {
  if (window.pageYOffset > sticky ) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}

//End Sticky-tab //

