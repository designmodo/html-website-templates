/*

   _____ _       _                 _  _____
  / ___/| (*)   | |               | |/ ___/  v 4.1
 | (___ | |_  __| | ___ ____      | | (___
  \___ \| | |/ _` |/ _ / __/  _   | |\___ \
  ____) | | | (_| |  __\__ \ | |__| |____) |
 /_____/|_|_|\__,_|\___/___/  \____//_____/


This file contains scripts required for the proper functionality and display
of your Slides Project. It also requires plugins.js and jquery-3.3.1 to run this script properly.

https://designmodo.com/slides/

*/

window.inAction = 1;
window.allowSlide = 1;
window.blockScroll = 1;
window.effectOffset = 500;
window.effectSpeed = 1000;
window.slideSpeed = 1000;
window.cleanupDelay = 1400;
window.horizontalMode = 0;
window.sidebarShown = 0;
window.loadingProgress = 0;
window.smoothScroll = 0;
window.scrollSpeed = 0.5;
window.preload = 1;
window.setHashLink = 1;
window.hideSidebarOnBodyClick = 1;
window.collectScrolls = 0;
window.sliderStatus = 0;
window.minScrollToSlide = 500;
window.minSwipeToSlide = 4;
window.enableMobileZoom = 0;
window.hideOnScrollSensitivity = 100;
window.allowParallaxOnMobile = 1;
window.hidePopupOnBodyClick = 1;

var $html = $('html');

//On Window load
$(window).on('load', function(){
  window.loaded = 1;
});

//On DOM ready
$(document).ready(function() { "use strict";
  var $body = $('body');

  //add window a trigger
  setTimeout(function(){
    $(window).trigger('ready');
  },1);

  //Redraw
  $body.hide().show(0);

  //Detect mode
  window.isScroll = $body.hasClass('scroll');
  window.isSimplifiedMobile = $body.hasClass('simplifiedMobile');
  if (window.isScroll || window.isSimplifiedMobile && window.isMobile) { $html.addClass('scrollable'); }

  $html.addClass('page-ready');

  //Set speed
  if ($body.hasClass('fast')){
    //fast
    window.slideSpeed = 700;
    window.cleanupDelay = 1200;
    window.effectSpeed = 800;
    window.scrollSpeed = 0.35;
    window.effectOffset = 400;
  } else if ($body.hasClass('slow')){
    //slow
    window.slideSpeed = 1400;
    window.cleanupDelay = 2000;
    window.effectSpeed = 1400;
    window.effectOffset = 400;
    window.scrollSpeed = .8;
    window.effectOffset = 600;
  }

  //How many stages?
  window.stage = 1;
  window.stages = $('.slide').length;

  //Horizonal Mode
  if ($body.hasClass('horizontal')){
    window.horizontalMode = 1;
  }

  //Preload
  if ($body.hasClass('noPreload')){
    window.preload = 0;
  }

  //Is it animated?
  if ($body.hasClass('animated')){
    window.isAnimated = "auto";
  } else if ($body.hasClass('animateOnEvent')) {
    window.isAnimated = "animateOnEvent";
    if (window.isMobile) {
      window.isAnimated = "auto";
      $body.removeClass('animateOnEvent').addClass('animated');
    }
  }

  //Remove animation for Simplified Mobile Option
  if (window.isSimplifiedMobile && window.isMobile) {
    window.isAnimated = false;
    $body.removeClass('animated animateOnEvent');
    $("[class*='ae-']").addClass('done');
  }

  if (!window.isAnimated) {
    window.cleanupDelay = 0;
  }

  //Is scroll hijacked?
  if ($body.hasClass('smoothScroll') && !window.isMobile){
    window.smoothScroll = 1;
  }

  //Check hash on start
  function updateHash(){
    var hashLink = window.location.href.split("#")[1];
    if (hashLink) {
      //find a slide
      if ( $('.slide[data-name="' +hashLink+ '"]').length > 0 ){
        //asking for the slide?
        var requestedElement = $('.slide[data-name="' +hashLink+ '"]');

        //scroll to a desired slide
        if ( (window.isMobile && window.isSimplifiedMobile) || window.isScroll ){
          //scroll mode
          if (requestedElement.length) {
            if (!window.preload || window.loaded) {
              $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
            } else {
              $(window).on('load', function(){
                $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
              });
            }
          }
        } else {
          //slide mode
          window.stage = $('.slide').index(requestedElement) + 1;
          showSlide(window.stage);
        }
      }
    }
  }

  updateHash();

  //Listen history changes
  $(window).on('popstate',function(e) {
    setTimeout(function(){
      updateHash();
    },100);
    e.preventDefault();
  });

  //Show Progress Bar
  if (window.preload){
    var imgs = [];
    $("*").each(function() {
      if($(this).css("background-image") !== "none") {
        imgs.push($(this).css("background-image").replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, ''));
      } else if ($(this).is('img')){
        imgs.push($(this).attr("src"));
      }
    });

    window.images = imgs.length;
    window.progressBar = $('.progress-bar');

    //preload images (sort of)
    $.cacheImage(imgs, { complete: function () {
      window.loadingProgress++;
      updateProgressBar();
    }});

    //show progress
    function updateProgressBar(){

      //loading
      var progress = window.loadingProgress/window.images;

      // animate
      window.progressBar.css('width',progress * 100 + "%");

      if (window.loadingProgress == window.images) {
        window.progressBar.addClass('loaded');
      }
    }

    updateProgressBar();
  }

  //Initiate slide
  showSlide(window.stage);

  $('.grid.masonry').masonry({
    itemSelector: 'li',
    transitionDuration: '0.1s'
  });

  $('.grid.masonry').imagesLoaded().progress( function() {
    $('.grid.masonry').masonry('layout');
  });

  //On page load
  if (!window.preload || !window.images || window.loaded) {
    runTheCode();
  }

  if (!window.loaded) {
    $(window).on('load', function(){
      runTheCode();
    });
  }

  function runTheCode(){
    $html.addClass('page-loaded');
    window.inAction = 0;
    window.blockScroll = 0;
    window.loaded = 1;

    setTimeout(function(){
      if (window.isScroll){
        updateScroll();
        updateNavigation();
      } if (window.isMobile && window.isSimplifiedMobile){
        $('.slide').addClass('selected animate active');
        updateScroll();
        updateNavigation();
      } else {
        showSlide(window.stage);
      }
    },500);
  }








/***
 *       _____ _ _     _         _____ _
 *      / ____| (_)   | |       / ____| |
 *     | (___ | |_  __| | ___  | |    | |__   __ _ _ __   __ _  ___
 *      \___ \| | |/ _` |/ _ \ | |    | '_ \ / _` | '_ \ / _` |/ _ \
 *      ____) | | | (_| |  __/ | |____| | | | (_| | | | | (_| |  __/
 *     |_____/|_|_|\__,_|\___|  \_____|_| |_|\__,_|_| |_|\__, |\___|
 *                                                        __/ |
 *     Slide Appearance Manager                          |___/
 */

  function showSlide(requested){

    requested = parseInt(requested);

    if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
      return;
    }

    updateNavigation();

    var newSlide = $('.slide').eq(requested - 1),
        currenSlide = $('.slide.selected'),
        currenSlideIndex = currenSlide.index('.slide') + 1;

    //cleanup
    hideDropdown();
    unzoomImage();
    hideSidebar();
    window.allowSlide = 1;

    //reset
    $body.removeClass('sidebarShown lastSlide firstSlide hidePanel-top hidePanel-bottom');

    //It it first or last stage?
    if (window.setStageClasses != 0) {
      if (window.stage === 1){
        $body.addClass('firstSlide');
      }
      if ((window.stages === window.stage)&&(window.stages !== 1)) {
        $body.addClass('lastSlide');
      }

      $body.removeClassByPrefix("stage-").addClass('stage-'+window.stage);
    }

    //white slide?
    if ( newSlide.hasClass('whiteSlide') ){
      $body.addClass('whiteSlide');
    } else {
      $body.removeClass('whiteSlide');
    }

    //prepare slides for transporting
    if (currenSlideIndex !== requested && window.setStageClasses != 0){
      currenSlide.removeClass('selected').addClass('active');
      newSlide.removeClass('before after').addClass('selected active');

      //set order
      newSlide.prevAll('.slide').addClass('before').removeClass('after');
      newSlide.nextAll('.slide').addClass('after').removeClass('before');

      //set a trigger
      $(window).trigger("slideChange", [parseInt(requested), newSlide]);
    }

    //set hash
    if (window.setHashLink){
      if (newSlide.attr('data-name') || newSlide.attr('id')) {
        window.location.hash = (newSlide.attr('data-name')) ? newSlide.attr('data-name') : newSlide.attr('id');
      } else if ((window.location.toString().indexOf('#')>0)&&(location.protocol !== "file:")&&(location.href.split('#')[0])){
        if (history.pushState) {
          window.history.pushState("", "", location.href.split('#')[0]);
        } else {
          window.location.hash = "";
        }
      }
    }

    //prepare to show slide
    newSlide.find('.content, .container').scrollTop(0);

    if (window.loaded){
      //wait for animation
      window.blockScroll = 1;

      setTimeout(function(){
        if (currenSlideIndex !== requested){
          currenSlide.removeClass('active animate');
        }

        //avoid accident scrolls
        window.blockScroll = 0;
      },window.effectSpeed);

      if (window.effectOffset > window.slideSpeed) { window.effectOffset = window.slideSpeed; }

      setTimeout(function(){
        newSlide.addClass('animate');
      },window.slideSpeed - window.effectOffset);


      //clear element animation on done
      $('.done').removeClass('done');

      clearTimeout(window.clearElementAnimation);
      window.clearElementAnimation = setTimeout(function(){
        $(".slide.selected [class*='ae-']").addClass('done');
      }, window.slideSpeed + window.effectSpeed + window.cleanupDelay);
    }
    //end showSlide();
  }

  //remove animation from a clickable element
  $(".animated").on("click", "[class*='ae-']:not('.done')", function(){ $(this).addClass('done'); });

  //Change slide
  window.changeSlide = function(n){
    if (n === "increase"){
      if ((window.stage + 1) >= window.stages){
        n = window.stages;
      } else {
        n = window.stage + 1;
      }
    } else if (n === "decrease"){
      if ((window.stage - 1) < 1){
        n = 1;
      } else {
        n = window.stage - 1;
      }
    }

    if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
      window.stage = n;
      var requestedElement = $('.slide:eq('+ (window.stage - 1) +')'),
          finalPosition = $(requestedElement).offset().top;

      $('html,body').stop().clearQueue().animate({scrollTop:finalPosition},1000);
    } else {
      if ((n !== window.stage)&&( n <= window.stages)){
        if (window.inAction !== 1){
          window.inAction = 1;
          window.stage = n;

          var delay = 0;
          if ($('.zoom-overlay-open').length > 0) {
            unzoomImage();
            delay = 550;
          }

          setTimeout(function(){
            showSlide(window.stage);
            setTimeout(function(){ window.inAction = 0; }, window.slideSpeed);
          }, delay);
        }
      }
    }
  };

  $('.nextSlide').on('click', function(){
    window.changeSlide('increase');
  });

  $('.prevSlide').on('click', function(){
    window.changeSlide('decrease');
  });

  $('.toFirstSlide').on('click', function(){
    window.changeSlide(1);
    if (history.pushState) {
      window.history.pushState("", "", location.href.split('#')[0]);
    } else {
      window.location.hash = "";
    }

    hideSidebar();
  });

  $('.toLastSlide').on('click', function(){
    window.changeSlide(window.stages);
    if (history.pushState) {
      window.history.pushState("", "", location.href.split('#')[0]);
    } else {
      window.location.hash = "";
    }
    hideSidebar();
  });

  $('[class*="toSlide-"]').on('click', function(){
    var num = parseInt($(this).attr('class').split('toSlide-')[1].split(' ')[0]);
    window.changeSlide(num);
    hideSidebar();
  });

  //zoom out image
  function unzoomImage(type){
    if ($('.zoom-overlay-open').length > 0){
      $('.zoom-img').click();

      if (type) {
        $('.zoom-img-wrap, .zoom-overlay').remove();
      }
    }
  }

  //set
  $(window).on('resize load ready',function(){
    //cleanup after image zoom
    $('[data-action="zoom"]').removeAttr('style');
    if ($('.zoom-overlay').length > 0){
      unzoomImage('fast');
    }

    //common stuff
    window.windowHeight = $(window).height();
    window.windowWidth = $(window).width();
    window.documentHeight = $(document).height();
  });








/***       *
 *         |         |          |
 *               |
 *       _____            *   _ _
 *      / ____|           |  | | |
 *     | (___   ___ _ __ ___ | | |
 *      \___ \ / __| '__/ _ \| | |
 *      ____) | (__| | | (_) | | |
 *     |_____/ \___|_|  \___/|_|_|
 *
 *      Scrolling
 */

  var eventCount = 0,
      eventCountStart;

  $('html,body').on('DOMMouseScroll mousewheel scroll touchmove', function(event){
    var $currentSection = $('.slide.selected .content'),
        scrollsize = Math.ceil(Math.abs(event.deltaY) * event.deltaFactor),
        browserScrollRate = (window.isFirefox) ? 2 : 1,
        OSScrollRate = (window.isWindows) ? browserScrollRate * 2 : browserScrollRate,
        wheelDelta = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : event.deltaY * event.deltaFactor,
        energy = wheelDelta * browserScrollRate * OSScrollRate,
        scrollDirection = (event.deltaY >= 0) ? "up" : "down",
        curSecScrolltop = $currentSection.scrollTop(),
        currentSectionHeight = $currentSection.find('.container').outerHeight(),
        deviceZoom = detectZoom.device(),
        minScrollToSlide = (window.isFirefox && window.isWindows) ? 200 : window.minScrollToSlide;

    //skip empty events
    if (!scrollsize) return;

    //scroll mode
    if (window.isScroll && ((!window.sidebarShown)&&(!window.popupShown)&&(!window.blockScroll))) {

      //smooth scroll
      if (window.smoothScroll && !window.isMobile){

        //lock default scroll
        event.preventDefault();

        if (energy > 1500) { energy = 1500; }
        if (energy < -1000) { energy = -1500; }

        var scrollObject = $(window),
            scrollTop = scrollObject.scrollTop(),
            finalScroll = scrollTop - energy;

        TweenLite.to(scrollObject, window.scrollSpeed, {
          scrollTo : { y: finalScroll, autoKill:false },
          ease: Power4.easeOut,
          overwrite: "all"
        });

      } else {
        if (!window.isWindows){
          $currentSection.scrollTop(curSecScrolltop - energy);
        }
      }
    }

    //slide mode
    if ( !window.isScroll && !(window.isMobile && window.isSimplifiedMobile)){

      // scroll oversized content
      if ((currentSectionHeight > window.windowHeight)){

        if ((( scrollDirection === "up" ) && ( $currentSection.scrollTop() === 0 )) || (( scrollDirection === "down" ) && ( $currentSection.scrollTop() + window.windowHeight >= Math.floor(currentSectionHeight / deviceZoom) ))){
          window.allowSlide = 1;
        } else {
          window.allowSlide = 0;
        }

        //hide panels on scroll
        if (window.panelsToHide) {
          if (scrollDirection === "down" && $currentSection.scrollTop() > 0) {
            $body.addClass('hidePanel-top');
          } else if (scrollDirection === "up"){
            $body.removeClass('hidePanel-top');
          }

          $body.addClass('hidePanel-bottom');

          if (scrollDirection === "down" && $currentSection.scrollTop() + window.windowHeight >= Math.floor(currentSectionHeight / deviceZoom)) {
            $body.removeClass('hidePanel-bottom');
          } else if (scrollDirection === "up"){
            $body.addClass('hidePanel-bottom');
          }
        }

        if ((!window.sidebarShown)&&(!window.popupShown)&&(!window.blockScroll)) {

          if (window.smoothScroll){
            //lock default scroll
            event.preventDefault();

            //smooth scroll
            if (energy > 1500) { energy = 1500; }
            if (energy < -1000) { energy = -1500; }

            TweenLite.to($currentSection, 0.5, {
              scrollTo : { y: curSecScrolltop - energy, autoKill:false },
              ease: Power4.easeOut,
              overwrite: 5
            });

          } else {
            curSecScrolltop = (scrollDirection === "up") ? curSecScrolltop - scrollsize : curSecScrolltop + scrollsize;
            $currentSection.scrollTop(curSecScrolltop);
          }
        }
      //end scroll oversized content
      }

      if (window.allowSlide && scrollsize) {
        if (scrollDirection == "down") {
          window.collectScrolls = window.collectScrolls + scrollsize;
        } else {
          window.collectScrolls = window.collectScrolls - scrollsize;
        }

        setTimeout(function(){
          window.collectScrolls = 0;
        },200);
      }

      //change slide on medium user scroll
      if ((Math.abs(window.collectScrolls) >= minScrollToSlide) && (window.allowSlide) && (!window.sidebarShown) && (!window.popupShown) && (!window.disableOnScroll)){

        window.collectScrolls = 0;

        //should we even..
        if ((scrollDirection === "down" && window.stage !== window.stages)||(scrollDirection === "up" && window.stage !== 1)){

          //ok let's go
          if (window.inAction !== 1){
            if (scrollDirection === "down"){
              window.changeSlide('increase');
            } else {
              window.changeSlide('decrease');
            }
          }
        }
      }
    }
    //end on mousewheel event
  });

  //scroll or simplified mobile
  if ( (window.isMobile && window.isSimplifiedMobile) || window.isScroll ){
    $(window).on('DOMMouseScroll mousewheel scroll touchmove load', function(){
      updateScroll();
    });
  }

  //Hide share with delay
  var hideDropdownOnScrollDelay = 0;

  function updateScroll(){

    //Hide dropdown
    hideDropdownOnScrollDelay++;
    if (hideDropdownOnScrollDelay >= 2){
      hideDropdown();
      hideDropdownOnScrollDelay = 0;
    }

    $('.slide').each(function(index, element) {

      var $element = $(element),
          elementIndex = $element.index('.slide'),
          scrollTop = $(document).scrollTop(),
          positionY = $element.offset().top,
          elementHeight = $element.height(),
          halfWay = (window.windowHeight/2 > elementHeight) ? elementHeight/2 : window.windowHeight/2,
          halfOnScreen = ((positionY < (window.windowHeight + scrollTop - halfWay)) && (positionY > (scrollTop - elementHeight + halfWay))),
          scale = (((scrollTop + window.windowHeight) - positionY) / (window.windowHeight + elementHeight) - 0.5) * 2,
          allowToSelect = true;

      //checking first slide
      if (scrollTop === 0) {
        if (index === 0) {
          allowToSelect = true;
        } else {
          allowToSelect = false;
        }
      }

      //checking last slide
      if (scrollTop + window.windowHeight === window.documentHeight) {
        if (index === window.stages - 1) {
          allowToSelect = true;
        } else {
          allowToSelect = false;
        }
      }

      if (window.setStageClasses != 0) {
        if (halfOnScreen && allowToSelect) {
          //set order

          $element.prevAll('.slide').addClass('before').removeClass('after');
          $element.nextAll('.slide').addClass('after').removeClass('before');
          $element.addClass('selected animate active').removeClass('after before');

          if ((window.stage !== elementIndex + 1) || !window.firstTimeTrigger){
            window.stage = elementIndex + 1;

            //set a trigger
            $(window).trigger("slideChange", [window.stage, $element]);

            if (window.stage === 1){
              $body.addClass('firstSlide');
            } else {
              $body.removeClass('firstSlide');
            }

            if (window.stages === window.stage) {
              $body.addClass('lastSlide');
            } else {
              $body.removeClass('lastSlide');
            }
            $body.removeClassByPrefix("stage-").addClass('stage-'+window.stage);

            //white slide?
            if ($element.hasClass('whiteSlide')){
              $body.addClass('whiteSlide');
            } else {
              $body.removeClass('whiteSlide');
            }

            if (window.isAnimated == "auto") {
              //clearTimeout(window.clearElementAnimation);
              window.clearElementAnimation = setTimeout(function(){
                $element.find("[class*='ae-']").addClass('done');
              }, window.effectSpeed + window.cleanupDelay);
            }

            updateNavigation();
          }

          if (!window.firstTimeTrigger){
            window.firstTimeTrigger = 1;
            $(window).trigger("slideChange", [window.stage, $element]);
          }

        } else {
          $element.removeClass('selected');
        }
      }

      //Parallax background
      if ((scale > -1 && scale < 1) && !(window.allowParallaxOnMobile && window.isMobile)) {
        if ($element.hasClass('parallax') || $element.find('.parallax-element')){

          $element.find('.parallax-element').each(function() {
            var $el = $(this),
                velocity = parseInt($el.data('parallax-velocity')) ? parseInt($el.data('parallax-velocity')) : 50,
                precentage =  scale * velocity;

            if (velocity > 100) velocity = 100;
            $el.css('-webkit-transform',"translate3d(0, " + precentage + "%, 0)").css('transform',"translate3d(0, " + precentage + "%, 0)");
          });
        }
      }
    });

    //Animate elements on Scroll
    if (window.isAnimated == "animateOnEvent") {

      if (!window.preload) {
        $("[class*='ae-']").each(function(i, element) {
          var $ae = $(element);
          if (isElementInView($ae)) {
            $ae.addClass("do").one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
              $(this).removeClassByPrefix('ae-').removeClass("do").addClass("done");
            });
          }
        });
      } else if (window.loaded){
        $("[class*='ae-']").each(function(i, element) {
          var $ae = $(element);
          if (isElementInView($ae)) {
            $ae.addClass("do").one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
              $(this).removeClassByPrefix('ae-').removeClass("do").addClass("done");
            });
          }
        });
      }
    }
  }

  function isElementInView(element) {
    var pageTop = $(window).scrollTop(),
        $element = $(element),
        elementHeight = $element.height(),
        pageBottom = pageTop + window.windowHeight,
        elementTop = $element.offset().top,
        elementBottom = elementTop + elementHeight;

    if (elementHeight >= window.windowHeight/5) {
      return (pageBottom >= elementTop + elementHeight/5);
    } else {
      return ((pageTop < elementTop) && (pageBottom > elementBottom));
    }
  };










/***
 *       _____
 *      / ____|       (*)
 *     | (_____      ___ _ __   ___
 *      \___ \ \ /\ / / | '_ \ / _ \
 *      ____) \ V  V /| | |_) |  __/
 *     |_____/ \_/\_/ |_| .__/ \___|
 *                      | |
 *                      |_|
 *
 *     Swipes for mobile devices
 */


  $('.mobile .slides:not(.scroll):not(.simplifiedMobile), .slides.desktopSwipe').swipe({
    swipeStatus:function(event, phase, direction, distance){

      window.allowSwipeUp = 1;
      window.allowSwipeDown = 1;

      //set height for current slide
      var $currentSection = $('.slide.selected .content'),
          currentSectionHeight = Math.floor($currentSection.find('.container').outerHeight()),
          next = "up",
          prev = "down",
          minSwipeToSlide = window.minSwipeToSlide,
          windowHeight = window.innerHeight;

      if (window.sidebarShown){
        $currentSection = $('.sidebar .content');
      }

      if (window.popupShown){
        $currentSection = $('.popup .content');
      }

      if (phase === "start") {
        window.scrollTop = $currentSection.scrollTop();
      }

      //horizontal mode
      if (window.horizontalMode){
        next = "left";
        prev = "right";
      }

      //lock slide
      if ( !window.horizontalMode && ( currentSectionHeight > windowHeight) ){
        if (window.scrollTop + windowHeight < currentSectionHeight){
          window.allowSwipeUp = 0;
        }
        if (window.scrollTop > 0) {
          window.allowSwipeDown = 0;
        }
      }

      if (!window.sidebarShown && !window.disableOnSwipe) {
        if (window.horizontalMode){
          if (direction === next && distance > minSwipeToSlide){
            window.changeSlide('increase');
          } else if (direction === prev && distance > minSwipeToSlide){
            window.changeSlide('decrease');
          }
        } else {
          if (direction === next && distance > minSwipeToSlide && window.allowSwipeUp && window.allowSlide){
            window.changeSlide('increase');
          } else if (direction === prev && distance > minSwipeToSlide && window.allowSwipeDown && window.allowSlide){
            window.changeSlide('decrease');
          }
        }
      }
    },
    maxTimeThreshold:0,
    fingers:'all',
    allowPageScroll:"vertical"
  });

  $('.slides.desktopSwipe *').on('click',function(){
    $(this).addClass('selectable');
  });








/***
 *      _____                 _
 *     |  __ \               | |
 *     | |__) |_ _ _ __   ___| |___
 *     |  ___/ _` | '_ \ / _ \ / __|
 *     | |  | (_| | | | |  __/ \__ \
 *     |_|   \__,_|_| |_|\___|_|___/
 *
 *     Responsive Panels
 */

  if($('.panel .compact').length > 0){

    $('.panel .compact').each(function(index, element) {
      var panel = $(element).parents('.panel'),
          desktop = $(panel).find('.desktop'),
          compact = element,
          forceMobileView = $(panel).hasClass('forceMobileView');

      $(window).on('load resize ready',function(){

        var documentWidth = $(document).width(),
            panelsPadding = parseInt($(panel).css('padding-left').replace('px','')) + parseInt($(panel).css('padding-right').replace('px',''));

        if ((window.isMobile || $(document).width() < 767) && forceMobileView) {

          $(desktop).addClass('hidden');
          $(compact).removeClass('hidden');

        } else {

          $(desktop).removeClass('hidden');
          $(compact).addClass('hidden');

          var totalWidth = 0;

          desktop.children().each(function(){
            if ( $(this).outerWidth() > $(this).children().outerWidth() ){
              totalWidth += Math.round($(this).outerWidth());
            } else {
              totalWidth += Math.round($(this).children().outerWidth());
            }
          });

          // if width of space is not enough or we are on mobile
          if ((totalWidth + Math.round(panelsPadding) > documentWidth + 2 ) || ((window.isMobile || documentWidth < 767) && forceMobileView)) {
            $(desktop).addClass('hidden');
            $(compact).removeClass('hidden');
          } else {
            $(desktop).removeClass('hidden');
            $(compact).addClass('hidden');
          }
        }

      });

    });
  }

  //HIDE PANELS ON SCROLL
  if ($('.panel.hideOnScroll').length > 0) {
    window.panelsToHide = true;

    if (window.isScroll || window.isSimplifiedMobile){
      var lastScrollTop,
          i = 0,
          sensitivity = window.hideOnScrollSensitivity ? window.hideOnScrollSensitivity : 100,
          panelToHide = $('.panel.hideOnScroll');

      //hide if height larger than screen size
      $(window).on('mousewheel', function(event) {
        var scrollTop = $(this).scrollTop(),
            $panelToHide = $(panelToHide),
            scrollSize = Math.ceil(Math.abs(event.deltaY) * event.deltaFactor);

        if (scrollTop > lastScrollTop) {
          i += scrollSize;
          if (i >= sensitivity) {
            $panelToHide.addClass('hide');
            i = sensitivity;
          }
        } else {
          i -= scrollSize;
          if (i <= sensitivity/5) {
            i = 0;
            $panelToHide.removeClass('hide');
          }
        }
        lastScrollTop = scrollTop;

        //show on top and bottom
        if ((scrollTop + window.windowHeight + sensitivity >= window.documentHeight) || (scrollTop + sensitivity <= 0)) {
          $panelToHide.removeClass('hide');
        }
      });
    }
  }








/***
 *      _  __
 *     | |/ /
 *     | ' / ___ _   _ ___
 *     |  < / _ \ | | / __|
 *     | . \  __/ |_| \__ \
 *     |_|\_\___|\__, |___/
 *                __/ |
 *               |___/
 *
 *      Listen the Keys
 */

  $(document).on("keydown",function(e){
    var delta = 2.5,
        scrollTime = 0.3,
        scrollDistance = 50,
        $currentSection = $('.slide.selected .content'),
        scrollTop = $currentSection.scrollTop(),
        finalScroll = scrollTop + parseInt(delta * scrollDistance);

    if (window.window.disableKeyNavigation || e.target.nodeName.toLowerCase() == 'input' || e.target.nodeName.toLowerCase() == 'textarea') {
      return;
    }

    /* [ ← ] */
    if (e.keyCode === 37){
      e.preventDefault();
      if (window.horizontalMode){ window.changeSlide('decrease'); }
    }

    /* [ ↑ ] */
    if (e.keyCode === 38){
      if (!window.horizontalMode){
        e.preventDefault();
        window.changeSlide('decrease');
      } else {
        e.preventDefault();
        TweenLite.to($currentSection, window.scrollSpeed, {
          scrollTo : { y: finalScroll, autoKill:true },
          ease: Power4.easeOut,
          overwrite: 5
        });
      }
    }

    /* [ → ] */
    if (e.keyCode === 39){
      if (window.horizontalMode){
        e.preventDefault();
        window.changeSlide('increase');
      }
    }

    /* [ ↓ ] */
    if (e.keyCode === 40){
      if (!window.horizontalMode) {
        e.preventDefault();
        window.changeSlide('increase');
      } else {
        e.preventDefault();
        TweenLite.to($currentSection, window.scrollSpeed, {
          scrollTo : { y: finalScroll, autoKill:true },
          ease: Power4.easeOut,
          overwrite: 5
        });
      }
    }

    /* [ esc ] */
    if (e.keyCode === 27){
      hideSidebar();
      hideDropdown();
      hidePopup();
      unzoomImage();
    }
  });








/***
*    _   _                           _
*   | \ | |           (*)           | | (*)                 *
*   |  \| | __ ___   ___  __ _  __ _| |_ _  ___  _ __       *
*   | . ` |/ _` \ \ / | |/ _` |/ _` | __| |/ _ \| '_ \     (*) [Tooltip]
*   | |\  | (_| |\ V /| | (_| | (_| | |_| | (_) | | | |     *
*   |_| \_|\__,_| \_/ |_|\__, |\__,_|\__|_|\___/|_| |_|     *
*                         __/ |
*                        /___/
*
*    Generate Navigation Dots and Tootlips
*/



  var navParent = $('.navigation'),
      navigation = $(navParent).find('ul'),
      slidesNumber = $('.slide:not(.exclude)').length;

  if ($(navigation).length > 0) {

    if ($(navigation).is(':empty')) {

      $(navigation).each(function(index, element) {
        for (var i = 1; i <= slidesNumber; i++){

          // Add Tooltips
          var title = $('.slide:not(.exclude):eq('+(i - 1)+')').data('title');
          if (title === undefined) {
            $(element).append('<li></li>');
          } else {
            $(element).append('<li data-title="'+title+'"></li>');
          }
        }
      });
    }

    //Navigation clicks
    $('.navigation li').on("click touchend", function(){
      var thisIndes = $(this).index(),
          realIndex = $('.slide:not(.exclude):eq('+thisIndes+')').index('.slide');

      $(this).blur();

      window.changeSlide(realIndex + 1);
    });

    if (!$('.side').hasClass('compact')){
      //Collapse sidemenu to compact
      $(window).on('load resize ready',function(){
        var containerHeight = window.windowHeight - 140,
            container = $('.side').removeClass('compact').find('ul'),
            totalWidth = 0;

        $(container).children().each(function(){
          totalWidth += Math.round($(this).outerHeight(true));
        });

        if (totalWidth > containerHeight){
          $('.side').addClass('compact');
        } else {
          $('.side').removeClass('compact');
        }
      });
    }
  }

  //In-page #Navigation
  $("a[href^='#'][target!='_blank']").click(function(e){

    var url = $(this).attr('href'),
        hashLink = url.split('#')[1],
        requestedElement = hashLink ? $('.slide[id="' +hashLink+ '"], .slide[data-name="' +hashLink+ '"]') : $('.slide:eq(0)');

    if( requestedElement.length > 0 ){

      e.preventDefault();

      if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
        var target = requestedElement;
        if (target.length) {
          $('html,body').stop().clearQueue().animate({scrollTop:target.position().top},1000);
        }
        if (window.setHashLink){
          window.location.hash = hashLink;
        }
      } else {
        window.stage = $('.slide').index(requestedElement) + 1;
        showSlide(window.stage);
      }
      hideSidebar();
    }

  });

  //Update Navigation
  function updateNavigation(){
    setTimeout(function(){
      if ( $(navigation).length > 0 ){
        $(navigation).each(function(index, element) {
          $(element).find('li.selected').removeClass('selected');

          var $selectedSlide = $('.slide.selected'),
              parentSlide = parseInt($selectedSlide.data('parent-slide-id')),
              selectedIndex = $selectedSlide.index('.slide:not(.exclude)');

          if (selectedIndex !== -1) {
            $(element).find('li').eq(selectedIndex).addClass('selected');
          } else if (parentSlide) {
            selectedIndex  = $('.slide[data-slide-id="'+ parentSlide +'"]').index('.slide:not(.exclude)');
            $(element).find('li').eq(selectedIndex).addClass('selected');
          }
        });
      }
    },100);
  }








/***
*       _____ _     _      _
*      / ____(_)   | |    | |
*     | (___  _  __| | ___| |__   __ _ _ __
*      \___ \| |/ _` |/ _ \ '_ \ / _` | '__|
*      ____) | | (_| |  __/ |_) | (_| | |
*     |_____/|_|\__,_|\___|_.__/ \__,_|_|
*
*     Sidebar Panel
*/

  $('.sidebarTrigger[data-sidebar-id]').on('click', function(){

    var sidebarID = $(this).data('sidebar-id');
    window.showSidebar(sidebarID);

  });

  window.showSidebar = function(id){
    var sidebarID = id,
        element = $('.sidebar[data-sidebar-id="' + sidebarID + '"]'),
        isAnimated = $(element).hasClass('animated');

    if (!window.sidebarShown){
      if (element.length > 0) {
        window.sidebarShown = 1;
        window.allowSlide = 0;
        $(element).removeClass('animate active').addClass('visible');
        $html.addClass('sidebarShown sidebar_' + sidebarID);
        $(element).find('.content').scrollTop(0);

        if (isAnimated){
          clearTimeout(window.removeAnimationTimeout);
          setTimeout(function(){
            $(element).addClass('animate active');
          },100);
        }
      }
    } else {
      hideSidebar();
    }

    //clean up
    hideDropdown();

  }

  function hideSidebar(){

    if (window.sidebarShown){
      $html.removeClass('sidebarShown').removeClassByPrefix('sidebar_');
      var $sidebar = $('.sidebar.visible');
      $sidebar.removeClass('visible');

      window.removeAnimationTimeout = setTimeout(function(){
        $sidebar.removeClass('animate active').find('.done').removeClass('done');
      },500);
      window.sidebarShown = 0;
      window.allowSlide = 1;
    }
  }

  //Hide on click outside
  $(document).on('mouseup touchstart', function (e){
    var container = $(".sidebarShown .sidebar, .dropdownTrigger");
    if (!container.is(e.target) && container.has(e.target).length === 0 && window.hideSidebarOnBodyClick) {
      hideSidebar();
    }
  });

  //Hide on .close Click
  $('.sidebar .close, .sidebar [data-sidebar-action="close"]').on('click touchstart', function(){
    hideSidebar();
  });








/***
*     _____                            __
*    |  __ \           _   _ _ __     |  |_
*    | |__) ___  _ __ | | | | '_ \    |__| |
*    |  ___/ _ \| '_ \| | | | |_) |     |__|
*    | |  | (_) | |_)  \__,_| .__/
*    |_|   \___/| .__/      | |
*               | |         |_|
*    PopUp      |_|
*/


  $('.popupTrigger[data-popup-id]').on('click', function(){
    var popupID = $(this).data('popup-id');
    window.showPopup(popupID);
  });

  window.showPopup = function(id){
    var popupID = id,
        element = $('.popup[data-popup-id="' + popupID + '"]'),
        isAnimated = element.hasClass('animated');

    if (element.length > 0) {
      hideSidebar();
      $(element).addClass('visible');

      //set a trigger
      $(window).trigger('popupShown');

      if (isAnimated){
        setTimeout(function(){
          $(element).addClass('animate active');

          clearTimeout(window.clearPopupElementAnimation);
          window.clearPopupElementAnimation = setTimeout(function(){
            $(element).find("[class*='ae-']").addClass('done');
          }, window.effectSpeed + window.cleanupDelay);
        },100);
      }

      $html.addClass('popupShown popup_' + popupID);
      $(element).find('.content').scrollTop(0);
      window.allowSlide = 0;

      //Add Popup ID in the stack
      if (!window.popupShown) window.popupShown = [];
      window.popupShown.push(popupID);

      //Autoplay Iframe
      if ($(element).hasClass('autoplay')){
        var $element = $(element),
            iframe = $element.find('iframe'),
            HTML5video = $element.find('video');

        if ( iframe.length > 0  ) {
          var iframeSrc = $(iframe).attr('src'),
              symbol = (iframeSrc.indexOf('?') > -1) ? "&" : "?";

          $(iframe).attr('src',iframeSrc + symbol + "autoplay=1");
        } else if (HTML5video.length > 0){
          $(HTML5video)[0].play();
        }
      }
    }

    //clean up
    hideDropdown();
  }

  function hidePopup(popupID) {
    popupID = typeof popupID !== 'undefined' ? popupID : false;

    if ( $.isArray(window.popupShown) ){

      var popupToHide = popupID ? popupID : window.popupShown.slice(-1)[0],
          $element = $('.popup.visible[data-popup-id="' + popupToHide + '"]'),
          iframe = $element.find('iframe'),
          video = $element.find('video');

      //stop iframe autoplay
      if (iframe.length > 0 ) {
        $(iframe).each(function(n, element){
          var iframeSrc = $(element).attr('src'),
              symbol = (iframeSrc.indexOf('?autoplay') > -1) ? "?" : "&";

          $(element).attr('src', $(element).attr('src').replace(symbol+'autoplay=1',''));
        });
      }

      //stop videos
      if (video.length > 0) {
        $(video).each(function(n, element){
          $(element)[0].pause();
          $(element)[0].currentTime = 0;
        });
      }

      //clear element animation on done
      clearTimeout(window.clearPopupElementAnimation);
      $element.addClass('hidePopup');
      $(window).trigger('popupHidden');

      setTimeout(function(){
        window.allowSlide = 1;

        $element.removeClass('visible animate active hidePopup').removeAttr('style').find('.done').removeClass('done');
        $html.removeClass('popup_' + popupToHide);

        //remove last shown id
        if($.isArray(window.popupShown)) {
          var i = window.popupShown.indexOf(popupToHide);
          if(i != -1) {
            window.popupShown.splice(i, 1);
          }
        }

        if (window.popupShown.length <= 0) {
          $html.removeClass('popupShown');
          window.popupShown = false;
        }
      }, 500);
    }
  }

  //Hide on body click
  if (window.hidePopupOnBodyClick){
    $(document).on('click', function (e){
      var container = $(".popupShown .popup .popupContent, .popupTrigger");
      if (!container.is(e.target) && container.has(e.target).length === 0 && container.length > 0) {
        hidePopup();
      }
    });
  }

  //Hide on .close Click
  $('.popup [data-popup-action="close"]').on('click', function(){
    hidePopup($(this).parents('.popup').data('popup-id'));
  });

  //Set hash link on popup reveal (works only with window.setHashLink = 0);
  if (window.setPopupHash) {
    //Set hash on click
    $('.popupTrigger[data-popup-id]').on('click', function(){
      var hash = $(this).attr('data-popup-id');
      window.location.hash = "#" + hash;
    });

    //Collect unique hash links
    window.setPopupHash = [];
    $('.popupTrigger').each(function(){
      var hash = $(this).attr('data-popup-id');

      if($.inArray(hash, window.setPopupHash) == -1) {
        window.setPopupHash.push(hash);
      }
    });

    //Open popup if hash presented
    if($.inArray(window.location.hash.split("#")[1], window.setPopupHash) !== -1) {
      setTimeout(function(){
        $('.popupTrigger[data-popup-id="'+window.location.hash.split("#")[1]+'"]').click();
      }, 500);

      $(window).on('popupHidden', function(){
        if (history.pushState) {
          window.history.pushState("", "", location.href.split('#')[0]);
        } else {
          window.location.hash = "";
        }
      });
    }
  }



/***
*       _____       ______ ______ ______
*      / ____|     |  ____|  ____|  ____|
*     | |  __  __ _| |__  | |__  | |__
*     | | |_ |/ _` |  __| |  __| |  __|
*     | |__| | (_| | |    | |____| |____
*      \_____|\__,_|_|    |______|______|
*
*     Grid and Flex Element Equalizer
*/

  $(window).on('resize load ready popupShown',function(){

    setTimeout(function(){
      equalizeElements();
    }, 1);
  });

  function equalizeElements(){

    var gridEl = $('.grid.equal, .flex.equal');
    if (gridEl.length) {
      $(gridEl).each(function(index, element) {

        var screenWidth = window.windowWidth,
            collapseWidth = ($(element).hasClass('later')) ? 767 : 1024,
            collapseWidth = $(element).data('equal-collapse-width') ? parseInt($(element).data('equal-collapse-width')) : collapseWidth,
            equalElement = $(element).find('.equalElement'),
            equalMobile = $(this).hasClass('equalMobile');

        if ((screenWidth >= collapseWidth)||(equalMobile)){
          var height = 0;

          //fetch max height
          $(equalElement).each(function(index, el) {

            $(el).css('height','auto');

            if (height < $(el).outerHeight()) {
              height = $(el).outerHeight();
            }

          });

          //apply
          $(element).find('.equalElement').each(function(index, el) {
            $(el).css('height', height + "px");
          });
        } else {
          $(equalElement).css("height", "auto");
        }
      });
    }
  }

  //Detect Resize
  $(window).on('resize',function(){
    $html.addClass('resizing');
  }).on('resizeEnd',function(){
    $html.removeClass('resizing');
  });








/***
*       _____ _ _     _
*      / ____| (_)   | |
*     | (___ | |_  __| | ___ _ __
*      \___ \| | |/ _` |/ _ \ '__|
*      ____) | | | (_| |  __/ |
*     |_____/|_|_|\__,_|\___|_|
*
*      Slider       * *(*)* *
*/


  var sliderEl = $('.slider');

  if ($(sliderEl).length > 0) {

    $(sliderEl).each(function(index, element) {

      //check status
      var $el = $(element),
          sliderID = $el.data('slider-id'),
          nextIndex = $el.find('.selected').index();

      //set status
      if (window.sliderStatus) {
        $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
      }

      //autoplay
      if ($el.hasClass('autoplay')) {

        var interval = ($el.data('slider-interval')) ? parseInt($el.data('slider-interval')) : 5000;

        var autoplay = setInterval(function(){
          $el.trigger('next');
        },interval);

        //stop interval on user interaction
        if ($el.data('slider-stoponclick') != false) {
          $('[data-slider-id="'+sliderID+'"]').on('mousedown touchstart', function(){
            clearInterval(autoplay);
          });
        }
      }

      //clickable
      if ($el.hasClass('clickable') || $el.hasClass('autoplay')){
        $el.on('click next', function(event){

          var $el = $(this),
              $selected = $el.children('.selected'),
              $nextElement = $selected.nextOrFirst('li'),
              nextIndex = $nextElement.index(),
              sliderID = $el.data('slider-id'),
              $controller = $('.controller[data-slider-id="'+sliderID+'"]'),
              isAnimated = $el.hasClass('animated'),
              clickTarget = event.target;

          //break
          if($(clickTarget).data('slider-event') == "cancel") return;

          //uselect old
          $selected.removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
            $(this).removeClass('hide');
          });

          //select next
          $nextElement.removeClass('hide').addClass('selected');

          //set status
          if (window.sliderStatus) {
            $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
          }

          //animated
          if (isAnimated) {
            $el.addClass('animateOnEvent');
            $el.find('li').removeClassByPrefix('ae-').removeClass('do');
            $el.find('.selected').each(function(index){
              $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
            });

            $(window).scroll();
          }

          if (sliderID && $controller.length > 0){
            $controller.children('.selected').removeClass('selected');
            $controller.children('li:eq('+nextIndex+')').addClass('selected');
          }
        });
      }
    });
  }

  // controller
  var $controller = $('.controller');

  if ($controller.length > 0) {

    var controllerSelector = $controller.data('controller-selector') ? $controller.data('controller-selector') : "li";

    $controller.on('click', controllerSelector, function(){
      var $controllerElement = $(this),
          $controller = $controllerElement.closest('.controller'),
          $selectedElement = $controller.find('.selected'),
          nextIndex = $($controller.find(controllerSelector)).index($controllerElement),
          sliderId = $controller.data('slider-id'),
          $slider = $('.slider[data-slider-id="'+sliderId+'"]'),
          isAnimated = $slider.hasClass('animated');

      if (!$controllerElement.hasClass('selected')){
        $selectedElement.removeClass('selected');
        $controllerElement.addClass('selected');
        $slider.children('.selected').removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
          $(this).removeClass('hide');
        });

        $slider.children('li').eq(nextIndex).removeClass('hide').addClass('selected');

        //set status
        if (window.sliderStatus) {
          $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
        }
      }

      //is animated
      if (isAnimated) {
        $slider.addClass('animateOnEvent');
        $slider.find('>li').removeClassByPrefix('ae-').removeClass('do');
        $slider.find('.selected').each(function(index){
          $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
        });

        $(window).scroll();
      }
    });
  }

  //Next and prev buttons
  $('[data-slider-action]').click(function(){

    if ($(this).data('slider-id')){
      var $this = $(this),
          $desiredElement, nextIndex,
          sliderID = $this.data('slider-id'),
          action = $this.data('slider-action'),
          $slider = $('.slider[data-slider-id="' + sliderID + '"]'),
          $controller = $('.controller[data-slider-id="'+sliderID+'"]'),
          controllerSelector = $controller.data('controller-selector') ? $controller.data('controller-selector') : "li",
          $selected = $slider.find('.selected'),
          isAnimated = $slider.hasClass('animated');

      //detect direction
      if (action === "next"){
        $desiredElement = $selected.nextOrFirst("li");
      } else if (action === "prev") {
        $desiredElement = $selected.prevOrLast("li");
      } else if (parseInt(action) || action === 0 ) {
        nextIndex = parseInt(action);
        $desiredElement =$slider.find('>li:eq(' + nextIndex + ")");
      }

      //select element
      nextIndex = $desiredElement.index();
      $selected.removeClass('selected');
      $desiredElement.removeClass('hide').addClass('selected');

      //set status
      if (window.sliderStatus) {
        $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
      }

      //is animated
      if (isAnimated) {
        $slider.addClass('animateOnEvent');
        $slider.find('li').removeClassByPrefix('ae-').removeClass('do');
        $slider.find('.selected').each(function(index){
          $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
        });
        $(window).scroll();
      }

      //change controller
      if ((sliderID) && ($controller.length > 0) ){
        $controller.find('.selected').removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
          $this.removeClass('hide');
        });
        $controller.find(controllerSelector).eq(nextIndex).addClass('selected');
      }

    }
  });

  //Auto Height
  $('[data-slider-id].autoHeight').each(function(index, element) {
    $(window).on('click resize load ready next',function(){
      var totalHeight = 0,
          el = $(element).find('.selected');

      $(element).find('.selected').children().each(function(){
        totalHeight += Math.round($(this).outerHeight(true));
      });

      $(element).height(totalHeight + "px");
    });
  });

  $(".slider.clickable[data-slider-id], .controller[data-slider-id]").on('click', function(event){
    if($(event.target).data('slider-event') != "cancel") $(window).resize();
  });







/***
*      _____                      _
*     |  __ \                    | |
*     | |  | |_ __ ___  _ __   __| | _____      ___ __
*     | |  | | '__/ _ \| '_ \ / _` |/ _ \ \ /\ / / '_ \
*     | |__| | | | (_) | |_) | (_| | (_) \ V  V /| | | |
*     |_____/|_|  \___/| .__/ \__,_|\___/ \_/\_/ |_| |_|
*                      | |
*                      |_|
*
*     Dropdown Window and Share
*/


  window.dropdownShown = false;
  //click
  $('.dropdownTrigger').on('click', function(){
    showDropdown($(this));
  });

  //hover
  $('.dropdownTrigger.hover').hover(function(){
    showDropdown($(this), "hover");
  });

  function showDropdown($this, $isHover){
    $isHover = typeof $isHover !== 'undefined' ? $isHover : false;

    //show
    var offset = $this.offset(),
        position = $this.position(),
        offsetY = window.popupShown ? Math.ceil(position.top) : Math.ceil(offset.top),
        offsetX = Math.ceil(offset.left),
        dropdownID = $this.data('dropdown-id'),
        $element = $('.dropdown[data-dropdown-id="' + dropdownID + '"]'),
        elementPosition = $this.data('dropdown-position') ? $this.data('dropdown-position') : $element.attr('class'),
        elementPosition = elementPosition.split(' ');

    //hide
    if (!$isHover) {
      hideDropdown();
    }

    //vertical position
    if ( elementPosition.indexOf('bottom') != -1 ) {
      offsetY = offsetY - $element.outerHeight();
      $element.removeClass('top').addClass('bottom');
    } else {
      offsetY = offsetY + $this.outerHeight();
      $element.removeClass('bottom').addClass('top');
    }

    //horizontal position
    if ( elementPosition.indexOf('right') != -1 ) {
      offsetX = offsetX - $element.outerWidth() + $this.outerWidth();
      $element.removeClass('left center').addClass('right');
    } else if ( elementPosition.indexOf('left') != -1 ) {
      $element.removeClass('right center').addClass('left');
    } else if ( elementPosition.indexOf('center')  != -1 ) {
      offsetX = offsetX - ($element.outerWidth()/2) + ($this.outerWidth()/2);
      $element.removeClass('right left').addClass('center');
    }

    $element.addClass('show').css('top',offsetY).css('left',offsetX);
    $html.addClass('dropdownShown dropdown_' + dropdownID);
    window.dropdownShown = true;
  }

  function hideDropdown(){
    //hide
    if (window.dropdownShown){
      $html.removeClass('dropdownShown').removeClassByPrefix('dropdown_');
      window.dropdownShown = false;
      hideDropdownOnScrollDelay = 0;
      $('.dropdown.show').addClass('hide').one('webkitTransitionEnd otransitionend msTransitionEnd transitionend', function(){
        $(this).removeClass('show hide')
        $html.removeClass('dropdownShown').removeClassByPrefix('dropdown_');;
      });
      $(window).trigger('dropdownHidden');
    }
  }

  //remove on resize
  $(window).on('resize',function(){
    hideDropdown();
  });

  //remove on click outside
  $(document).on('mouseup touchstart', function (e){
    var container = $(".dropdownShown .dropdown");
    if (!container.is(e.target) && container.has(e.target).length === 0 && window.dropdownShown) {
      hideDropdown();
    }
  });

  //set url for share
  window.shareUrl = window.location.href;
  if ($('.share').data('url')) {
    window.shareUrl = $('.dropdown').data('url');
  }
  //set text for share
  window.shareText = document.title;
  if ($('.share').data('text')) {
    window.shareText = $('.dropdown').data('url');
  }

  $('.share').sharrre({
    enableHover: false,
    url: window.shareUrl,
    text: window.shareText,
    enableCounter: false,
    share: {
      twitter: true,
      facebook: true,
      pinterest: true,
      googlePlus: true,
      stumbleupon: true,
      linkedin: true
    },

    buttons: {
      pinterest: {
        media: $('.dropdown').data('pinterest-image'),
        description: $('.dropdown').data('text') + " " + $('.dropdown').data('url')
      }
    },

    template: $('.share').html(),

    render: function(api) {

      $(api.element).on('click touchstart', '.social-twitter', function() {
        api.openPopup('twitter');
      });
      $(api.element).on('click touchstart', '.social-facebook', function() {
        api.openPopup('facebook');
      });
      $(api.element).on('click touchstart', '.social-pinterest', function() {
        api.openPopup('pinterest');
      });
      $(api.element).on('click touchstart', '.social-googlePlus', function() {
        api.openPopup('googlePlus');
      });
      $(api.element).on('click touchstart', '.social-stumbleupon', function() {
        api.openPopup('stumbleupon');
      });
      $(api.element).on('click touchstart', '.social-linkedin', function() {
        api.openPopup('linkedin');
      });
      $(api.element).on('click touchstart', '.mail', function() {
        var subject = $(this).data('subject') ? $(this).data('subject') : "",
            body = $(this).data('body') ? $(this).data('body') : "",
            url = $('.dropdown').data('url') ? $('.dropdown').data('url') : window.location.href;

        //open email
        window.location.href ="mailto:?subject=" + encodeURIComponent( subject ) + "&body=" + encodeURIComponent( body ) + "%20" + url;
      });

    }
  });








/***
*      _____  _       _
*     |  __ \(_)     | |
*     | |  | |_  __ _| | ___   __ _
*     | |  | | |/ _` | |/ _ \ / _` |
*     | |__| | | (_| | | (_) | (_| |
*     |_____/|_|\__,_|_|\___/ \__, |
*                              __/ |
*                             |___/
*     Dialog Windows
*/


  //show dialog message
  $('.dialogTrigger[data-dialog-id]').on('click', function(){
    var dialogID = $(this).data('dialog-id');

    window.showDialog(dialogID)
  });



  //reveal the dialog with ID
  window.showDialog = function(id) {

    var dialogID = id,
        $element = $('.dialog[data-dialog-id="' + dialogID + '"]');

    if (!$element.is(':visible')){
      $element.addClass('reveal').slideDown(500,function(){
        $(this).removeClass('reveal').removeClass('hidden');
      });
    }
  }

  //hide dialog message
  $('.dialog [data-dialog-action="close"], .dialog [data-dialog-action="hide"]').on('click', function(){
    var $element = $(this).parents('.dialog'),
        action = $(this).data('dialog-action'),
        dialogID = $element.data('dialog-id'),
        cookieAge = $element.data('set-cookie'),
        cookieName = ($element.data('cookie-name')) ? $element.data('cookie-name') : dialogID,
        cookieValue = ($element.data('cookie-value')) ? $element.data('cookie-value') : true,
        cookiePath = $element.data('cookie-path');

    $element.addClass('hide').slideUp(500,function(){
      $(this).removeClass('hide');

      if (cookieAge && action == "close"){
        $.cookie(cookieName, cookieValue, { expires: cookieAge, path: cookiePath });
      }
    });
  });

  //hide dialog message with cookie
  $('.dialog[data-set-cookie]').each(function(index, element) {
    var dialogID = $(element).data('dialog-id'),
        cookieName = ($(element).data('cookie-name')) ? $(element).data('cookie-name') : dialogID,
        cookieValue = ($(element).data('cookie-value')) ? $(element).data('cookie-value') : true;

    if ($.cookie(cookieName)){
      $(element).hide();
    }
  });

  //links
  $('.dialog [data-href]').on('click', function(){
    if ($(this).data('target')){
      window.open($(this).data('href'), '_blank');
    } else {
      window.location = $(this).data('href');
    }
  });

  //delay reveal for dialog window
  $('.dialog.hidden[data-dialog-delay]').each(function(){
    var timeoutDelay = parseFloat($(this).attr('data-dialog-delay')),
        $element = $(this);

    if (!isNaN(timeoutDelay)) {
      setTimeout(function(){
        $element.addClass('reveal').slideDown(500,function(){
          $(this).removeClass('reveal').removeClass('hidden');
        });
      }, timeoutDelay);
    }
  });

  //delay reveal for dialog window
  $('.dialog[data-dialog-hide-delay]').each(function(){
    var timeoutDelay = parseFloat($(this).attr('data-dialog-hide-delay')),
        $element = $(this);

    if (!isNaN(timeoutDelay)) {
      setTimeout(function(){
        $element.addClass('hide').slideUp(500,function(){
          $(this).removeClass('hide');
        });
      }, timeoutDelay);
    }
  });

  //submit form
  $('.dialog [data-type="submit"]').click(function(){
    $(this).parents('form').submit();
  });




/***
*       _____            _             _     ______
*      / ____|          | |           | |   |  ____|
*     | |     ___  _ __ | |_ __ _  ___| |_  | |__ ___  _ __ _ __ ___
*     | |    / _ \| '_ \| __/ _` |/ __| __| |  __/ _ \| '__| '_ ` _ \
*     | |___| (_) | | | | || (_| | (__| |_  | | | (_) | |  | | | | | |
*      \_____\___/|_| |_|\__\__,_|\___|\__| |_|  \___/|_|  |_| |_| |_|
*
*     Ajax Contact Form
*/

  $('#contact-form, [data-ajax-form]').each(function(index, element) {
    $(element).ajaxForm(function() {
      var $ajaxForm = $(element),
          $ajaxFormButton = $(element).find('[type="submit"]'),
          ajaxFormButtonIsInput = $ajaxFormButton.is('input') ? true : false,
          successText = $ajaxFormButton.data('success-text') ? $ajaxFormButton.data('success-text') : "Done!",
          successClass = $ajaxFormButton.data('success-class') ? $ajaxFormButton.data('success-class') : "green",
          defaultText = ajaxFormButtonIsInput ? $ajaxFormButton.val() : $ajaxFormButton.html(),
          defaultClasses = $ajaxFormButton.attr('class');

      if (ajaxFormButtonIsInput) {
        $ajaxFormButton.val(successText);
      } else {
        $ajaxFormButton.text(successText)
      }
      $ajaxFormButton.addClass(successClass);

      setTimeout(function(){
        if (ajaxFormButtonIsInput) {
          $ajaxFormButton.val(defaultText);
        } else {
          $ajaxFormButton.html(defaultText);
        }
        $ajaxFormButton.attr('class', defaultClasses);
        $ajaxForm[0].reset();
      },4000);
    });
  });






/***
*       _____                       _
*      / ____|                     | |
*     | (___   ___  _   _ _ __   __| |
*      \___ \ / _ \| | | | '_ \ / _` |
*      ____) | (_) | |_| | | | | (_| |
*     |_____/ \___/ \__,_|_| |_|\__,_|
*
*     Music and Sound
*/

  $('audio[data-sound-id]').each(function(event, element){
    var $element = $(element),
        musicID = $element.data('sound-id'),
        audio = $element[0],
        $soundButton = $('.soundTrigger[data-sound-id="'+musicID+'"]');

    if (audio.autoplay){
      $soundButton.addClass('playing');
    } else {
      $soundButton.removeClass('playing');
    }
  });

  $('.soundTrigger').click(function(){
    var musicID = $(this).data('sound-id'),
        $audio = $('audio[data-sound-id="'+musicID+'"]'),
        action = $audio.data('sound-action') ? $audio.data('sound-action') : "toggle",
        fade = (parseInt($audio.data('sound-fade')) >= 0 || $audio.data('sound-fade')) ? parseInt($audio.data('sound-fade')) : 500;

    if ($audio[0].paused && ( action === "toggle" || action === "play")){
      $audio[0].play();
      $audio.animate({volume: 1}, fade);
      $(this).addClass('playing');
    } else if (action === "toggle" || action === "pause"){
      $audio.animate({volume: 0}, fade, function(){
        $audio[0].pause();
      });

      $(this).removeClass('playing');
    }
  });

// end on dom ready
});



/***
*                           _
*         /\               | |
*        /  \   _ __   __ _| |_   _ _______
*       / /\ \ | '_ \ / _` | | | | |_  / _ \
*      / ____ \| | | | (_| | | |_| |/ /  __/
*     /_/    \_\_| |_|\__,_|_|\__, /___\___|
*                              __/ |
*                             |___/
*
*     Analyze Devices and Browsers
*/


window.isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { window.isMobile = true; }

//Detect Mobile
if(window.isMobile){$html.addClass('mobile');}else{$html.addClass('desktop');}

//Detect Browser
window.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
window.isSafari = /^((?!chrome).)*safari/i.test(navigator.userAgent);
window.isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
window.isChromeiOS = navigator.userAgent.match('CriOS');
window.isMSIE = navigator.userAgent.match('MSIE');
window.isEdge = navigator.userAgent.match('Edge');
window.isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
window.isiPad = navigator.userAgent.match(/iPad/i) !== null;

//Detect OS
window.isWindows = navigator.platform.toUpperCase().indexOf('WIN')!==-1;
window.isOSX = navigator.platform.toUpperCase().indexOf('MAC')!==-1;
window.isLinux = navigator.platform.toUpperCase().indexOf('LINUX')!==-1;

//Prepare for CSS Fixes
if (window.isSafari){$html.addClass('safari');}
if (window.isFirefox){$html.addClass('firefox');}
if (window.isChrome){$html.addClass('chrome');}
if (window.isMSIE){$html.addClass('msie');}
if (window.isEdge){$html.addClass('edge');}
if (window.isAndroid){$html.addClass('android');}
if (window.isWindows){$html.addClass('windows');}
if (window.isOSX){$html.addClass('osx');}
if (window.isLinux){$html.addClass('linux');}

//Retina
window.isRetina = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
if (window.isRetina){$html.addClass('retina');};


