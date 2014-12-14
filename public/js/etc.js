$(function() {
 
    // grab the initial top offset of the navigation 
    var sticky_header_offset_top = $('#sticky-header').offset().top;

    // our function that decides weather the navigation bar should have "fixed" css position or not.
    var sticky_header = function(){
        var scroll_top = $(window).scrollTop(); // our current vertical position from the top
         
        // if we've scrolled more than the navigation, change its position to fixed to stick to top,
        // otherwise change it back to relative
        if (scroll_top > sticky_header_offset_top) { 
            $('#sticky-header').removeClass('header-large').addClass('header-small');
        } else {
            $('#sticky-header').removeClass('header-small').addClass('header-large');
        }   
    };

    // run our function on load
    sticky_header();
     
    // and run it again every time you scroll
    $(window).scroll(function() {
        if (window.location.hash === '#/') { // only do scrolling check on main page
            sticky_header();
        }
    });
    // set initial header for non-main pages
    if (window.location.hash !== '#/') {
        $('#sticky-header').removeClass('header-large').addClass('header-small');
    }

    function updateSizeClass(c) {
        if ($('body').hasClass(c)) {
            return; // do nothing
        }
        _.each($('body').attr('class').split(' '), function(value, key, list) {
            if(value.indexOf('size-') > -1) {
                $('body').removeClass(value);
            }
        });
        console.log(c);
        $('body').addClass(c);
        return;
    }

});

function beginScrollNext() {
    $('html,body').animate({
        scrollTop: $('#page-next').offset().top - 70 // TODO - CHANGE 70 to responsive header height
    }, 800);
}