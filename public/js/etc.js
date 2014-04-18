$(function() {
 
    // grab the initial top offset of the navigation 
    var sticky_header_offset_top = $('#sticky-header').offset().top;

    // our function that decides weather the navigation bar should have "fixed" css position or not.
    var sticky_header = function(){
        var scroll_top = $(window).scrollTop(); // our current vertical position from the top
         
        // if we've scrolled more than the navigation, change its position to fixed to stick to top,
        // otherwise change it back to relative
        //console.log(scroll_top + ' == ' + sticky_header_offset_top);
        if (scroll_top > sticky_header_offset_top) { 
            //$('#sticky-header').css({ });
            $('#sticky-header').removeClass('header-large').addClass('header-small');
            $('#pageTitle').removeClass('pageTitle-large').addClass('pageTitle-small');
            $('#navigation').removeClass('navigation-large').addClass('navigation-small');

        } else {
            $('#sticky-header').removeClass('header-small').addClass('header-large');
            $('#pageTitle').removeClass('pageTitle-small').addClass('pageTitle-large');
            $('#navigation').removeClass('navigation-small').addClass('navigation-large');
        }   
    };

    // run our function on load
    sticky_header();
     
    // and run it again every time you scroll
    $(window).scroll(function() {
         sticky_header();
    });
});