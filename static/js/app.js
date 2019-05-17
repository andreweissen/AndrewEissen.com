/**
 * @file app.js
 * @fileoverview The main module of the program, contains several access
 * namespaces denoting which functions, arrays, enums, and variables may be
 * returned for external or global usage. Begun 3/28/19
 * @author Andrew Eissen
 */
'use strict';

/*
 * @description The primary JavaScript module. This script, making use of the
 * conventional ES5 IIFE module paradigm to denote levels of external global
 * access to included functionality, makes use of a pair of object literals to
 * denote Java-esque private and public access levels. Contained within a single
 * named immediately-invoked function expression, only those functions included
 * as properties of the public <code>accessible</code> object are externally
 * available, as this is the only object returned from the function following
 * its invocation.
 * <br />
 * <br />
 * This module contains all the front-end code related to the generation of
 * individual pages of the interface with which the user can interact, called
 * "scenes." Scenes are all technically part of the same web page, but are
 * created and changed dynamically as needed, built from templates using a set
 * of JavaScript builders and assembly functions that are called when the user
 * presses certain buttons that request the next scene. An example would be the
 * homepage, the first scene users see upon navigating to the webpage. Upon
 * pressing the "About" navlink button, the current scene would fade away via
 * jQuery-esque animations and be replaced by the "About" scene. This process
 * would continue for all subsequent scene changes, with the JSON data used to
 * store the information displayed on the screen (text, images, etc.) cached
 * after the first request for subsequent use.
 * <br />
 * <br />
 * The design of the application is two-fold, composed of the six-panel homepage
 * layout seen on application initiation and the so-called "diptych" design, so
 * named after the medieval art style. Such early diptychs were generally panels
 * serving as frames for paintings that were attached to each other by springs.
 * In keeping with this look, the diptych design of the application shows an
 * <code>aside</code> left panel containing an image and brief overview of the
 * topic selected, while the right <code>article</code> panel displays a more
 * in-depth view of the subject. This design is used in all cases (with some
 * minor differences) except for the homepage.
 * <br />
 * <br />
 * Functions in <code>inaccessible</code> are organized into 5 major groups that
 * encapsulate certain responsibilities. Utility functions contain functions
 * of a variety of uses that are designed to simplify certain basic tasks while
 * maintaining some degree of readability. Assembly functions build certain DOM
 * elements and return the preassembled <code>HTMLElement</code>s for addition
 * to the page by another function. Builder functions use assembly functions to
 * dynamically create scenes that make up the HTML of the page as seen from the
 * user's perspective, returning these HTML framework skeletons for addition to
 * the page. Handler functions, as the name implies, are event listener handlers
 * and action handlers that translate the user's desired button-mediated actions
 * into application logic, and generally are used to interface with the database
 * in the passage or request of data.
 * <br />
 * <br />
 * <pre>
 * Table of contents
 * - Script-globals             Line 0085
 * - Enums
 *   - Utility                  Line 0120
 *   - Text                     Line 0141
 *   - Classes                  Line 0179
 *   - Operations               Line 0317
 * - Function groups
 *   - Utility functions        Line 0364
 *   - Assembly functions       Line 0859
 *   - Builder functions        Line 1508
 *   - Handler functions        Line 2376
 *   - Main function            Line 2514
 *   - Public functions         Line 2576
 * </pre>
 *
 * @see {@link //google.github.io/styleguide/jsguide.html|Styleguide #1}
 * @see {@link //google.github.io/styleguide/javascriptguide.xml|Styleguide #2}
 * @author Andrew Eissen
 * @module Module
 * @const
 */
const Module = (function () {

  // Script-globals

  // Declare access object namespaces (basically public and private)
  let accessible, inaccessible;

  // Define access object namespaces
  accessible = accessible || {};
  inaccessible = inaccessible || {};

  /**
   * @description This constant is used to test the program and display messages
   * in the console related to the success or failure of various operations
   * undertaken in the course of site usage. Though not a part of the
   * <code>inaccessible</code> object, the constant is still contained within
   * the private restricted scope of the <code>Module</code> IIFE and cannot be
   * accessed externally.
   *
   * @const
   */
  const DEBUG = false;

  // Enums

  /**
   * @description Enum for assorted utility constants. Herein are set assorted
   * default values of helper constants required in various contexts. These
   * values are included in an object-global private enum to assist in ease of
   * adjustment if a value needs to be changed universally for all elements or
   * functions making use of that value. Object is made immutable via
   * <code>Object.freeze</code>.
   *
   * @readonly
   * @enum {number}
   * @const
   */
  const Utility = Object.freeze({
    FADE_IN_INTERVAL: 8,                  // Joint fade/swipe right rate (ms)
    INITIAL_FADE_IN_INTERVAL: 50,         // Initial page load time (ms)
    OPACITY_INCREASE_AMOUNT: 0.035,       // Amount to increase/decrease opacity
    SWIPE_INTERVAL_TIME: 2000,            // Max time permitted for swipe right
    CHECK_OPACITY_RATE: 500,              // Rate at which we check opacity == 0
    IMAGE_MIN_WIDTH: 992,                 // Home panel image minimum width (px)
  });

  /**
   * @description This <code>String</code> enum is used to store loose strings
   * that are not housed in <code>json</code> files. Generally, the vast
   * majority of these <code>String</code>s are used in <code>console.log</code>
   * invocations to display status messages in cases wherein <code>DEBUG</code>
   * is set to <code>true</code>. Object is made immutable via
   * <code>Object.freeze</code>.
   *
   * @readonly
   * @enum {string}
   * @const
   */
  const Text = Object.freeze({
    EMAIL_ADDRESSES: 'My Email Addresses',
    IMAGES_FOLDER: 'images',
    IMAGES_LOADED: '$1 image(s) loaded',
    ICON_FORMAT: 'svg',
    LINK_TARGET: '_blank',
    CONTACT_INFO: 'Contact Information',
    EXISTS: '"$1" exists in cache',
    DOES_NOT_EXIST: '"$1" does not exist in cache',
    LISTENER_REMOVED: 'Event listener removed',
    ERROR_GET: 'Unable to acquire JSON data via GET request',
    ERROR_HEADER: 'Oops!',
    ERROR_SUBHEADER: 'An error was encountered',
    ERROR_EMAIL: 'webmaster@andreweissen.com',
    ERROR_SUMMARY: 'This site is currently experiencing unresolved technical ' +
      'difficulties that may be due to ongoing maintenance. Please reload ' +
      'the page and try again or contact the webmaster for assistance at ',
  });

  /**
   * @description This enum is used to store <code>String</code> representations
   * of the various class selectors added to elements and styled in the
   * associated <code>styles.css</code> file. These selectors have all been
   * hoisted here to this enum from the bodies of their respective builder and
   * assembly functions below to provide the author the flexibility to adjust
   * each in a single place in the event that a selector needs its name altered.
   * <br />
   * <br />
   * The enum's contents are broken into sections based on the locations of each
   * associated element. These locations are notated by means of a prefix like
   * "nav" or "home" that indicate where the element appears on the page.
   * Classes that see usage in multiple places make use of the "General" prefix.
   * Object is made immutable via <code>Object.freeze</code>.
   *
   * @readonly
   * @enum {string}
   * @const
   */
  const Classes = Object.freeze({

    // General selectors
    GENERAL__RESPONSIVE_IMAGE: 'responsive-image',
    GENERAL__HAS_HEIGHT: 'has-height',
    GENERAL__BUTTON_LINK: 'button-link',
    GENERAL__ACTIVE: 'active',
    GENERAL__IS_VISIBLE: 'is-visible',
    GENERAL__PLAINLINK: 'plainlink',

    // Wrapper selectors
    WRAPPER__CONTAINER: 'container',
    WRAPPER__CONTENT: 'content',
    WRAPPER__CONTENT_SECTION: 'content-section',

    // General header selectors
    HEADER: 'header',
    HEADER__SECTION: 'header-section',

    // Header logo selectors
    LOGO: 'logo',
    LOGO__SECTION: 'logo-section',
    LOGO__IMAGE: 'logo-img',
    LOGO__TEXT: 'logo-text',

    // Header nav selectors
    NAV: 'nav',
    NAV__UL: 'nav-ul',
    NAV__HAMBURGER: 'nav-hamburger',
    NAV__UPPER_BAR: 'nav-hamburger-upper-bar',
    NAV__MIDDLE_BAR: 'nav-hamburger-middle-bar',
    NAV__LOWER_BAR: 'nav-hamburger-lower-bar',

    // Main selector
    MAIN: 'main',

    // Error page
    ERROR: 'error',
    ERROR__HEADER: 'error-header',
    ERROR__SUBHEADER: 'error-subheader',
    ERROR__CONTENT: 'error-content',
    ERROR__SUMMARY: 'error-summary',
    ERROR__TECH: 'error-technical',
    ERROR__TECH_TITLE: 'error-technical-title',
    ERROR__TECH_TEXT: 'error-technical-text',

    // Footer selectors
    FOOTER: 'footer',
    FOOTER__SECTION: 'footer-section',
    FOOTER__UPPER: 'footer-upper',
    FOOTER__UPPER_SECTION: 'footer-upper-section',
    FOOTER__TITLE: 'footer-title',
    FOOTER__LOWER: 'footer-lower',
    FOOTER__COPYRIGHT: 'copyright',

    // Home panels
    HOME__LI: 'home-li',
    HOME__LINK: 'home-link',
    HOME__PICTURE: 'home-picture',
    HOME__COVER: 'home-cover',
    HOME__PHOTOTEXT: 'home-phototext',

    // Meta footer section
    META__LI: 'meta-li',
    META__LI_TITLE: 'meta-li-title',
    META__LI_TEXT: 'meta-li-text',

    // Connect footer section
    CONNECT__LI: 'connect-li',
    CONNECT__LINK: 'connect-link',
    CONNECT__SVG: 'connect-svg',
    CONNECT__DESC: 'connect-description',
    CONNECT__DESC_TITLE: 'connect-description-title',
    CONNECT__DESC_TEXT: 'connect-description-text',

    // General diptych selectors
    DIPTYPCH: 'diptych',
    DIPTYCH__PANEL: 'diptych-panel',
    DIPTYCH__HEADER: 'diptych-header',
    DIPTYCH__SUBHEADER: 'diptych-subheader',

    // Left diptych panel
    LEFT__PANEL: 'left',
    LEFT__AVATAR: 'left-avatar',
    LEFT__HEADER: 'left-header',
    LEFT__SUBHEADER: 'left-subheader',
    LEFT__SUMMARY: 'left-summary',
    LEFT__DETAILS: 'left-details',
    LEFT__DETAILS_HEADER: 'left-details-header',
    LEFT__DETAILS_TABLE: 'left-details-table',
    LEFT__DETAILS_ROW: 'left-details-row',
    LEFT__DETAILS_CELL: 'left-details-cell',

    // Right diptych panel
    RIGHT__PANEL: 'right',
    RIGHT__HEADER: 'right-header',
    RIGHT__CONTENT: 'right-content',
    RIGHT__DETAILS: 'right-details',
    RIGHT__DETAILS_HEADER: 'right-details-header',
    RIGHT__DETAILS_UL: 'right-details-ul',
    RIGHT__DETAILS_LI: 'right-details-li',
    RIGHT__DETAILS_LI_TITLE: 'right-details-li-title',
    RIGHT__DETAILS_LI_TEXT: 'right-details-li-text',

    // Essay diptych panels
    ESSAY__SECTION: 'essay-section',
    ESSAY__TITLE: 'essay-title',
    ESSAY__PARAGRAPHS: 'essay-paragraphs',
    ESSAY__PARAGRAPH: 'essay-paragraph',

    // Entries diptych panels
    ENTRY__SECTION: 'entry-section',
    ENTRY__UPPER: 'entry-upper',
    ENTRY__HEADER: 'entry-header',
    ENTRY__SUBHEADER: 'entry-subheader',
    ENTRY__DATE: 'entry-date',
    ENTRY__LOWER: 'entry-lower',
    ENTRY__PARAGRAPH: 'entry-paragraph',
    ENTRY__LISTING: 'entry-listing',
    ENTRY__LISTING_TITLE: 'entry-listing-title',
    ENTRY__LISTING_TEXT: 'entry-listing-text',
  });

  /**
   * @description This enum contains a listing of commonly used algebraic
   * functions primarily for use in the body of the jQuery-esque fading function
   * <code>inaccessible.fade</code>. The use of this enum, the contents of which
   * are not expected to change or require redefinition and are thus sealed via
   * <code>Object.freeze()</code>, removes the need for separate fade in and
   * fade out functions. Instead, depending on the type of fade being performed,
   * the appropriate algebraic function can be called from here instead, with
   * the value returned for use. Basically simulates the passing of an operation
   * type as an argument.
   *
   * @readonly
   * @enum {function}
   * @const
   */
  const Operations = Object.freeze({

    /**
     * @description A simple addition operation involving two arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {number}
     */
    ADDITION: function (paramOperand1, paramOperand2) {
      return paramOperand1 + paramOperand2;
    },

    /**
     * @description A simple subtraction operation involving two arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {number}
     */
    SUBTRACTION: function (paramOperand1, paramOperand2) {
      return paramOperand1 - paramOperand2;
    },

    /**
     * @description A simple comparison operation involving a pair of arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {boolean}
     */
    GREATER_THAN: function (paramOperand1, paramOperand2) {
      return paramOperand1 > paramOperand2;
    },

    /**
     * @description A simple comparison operation involving a pair of arguments.
     *
     * @param {number} paramOperand1
     * @param {number} paramOperand2
     * @returns {boolean}
     */
    LESS_THAN: function (paramOperand1, paramOperand2) {
      return paramOperand1 < paramOperand2;
    },
  });

  // Utility functions

  /**
   * @description This request handler is used to make <code>GET</code> and
   * <code>POST</code> requests in the request and passage of user data. It
   * accepts as function parameters a GET/POST request type, an API endpoint
   * name/address, and an optional object containing the request configuration
   * data such as the JSON encoding toggle indicator and the endpoint-specific
   * parameters containing user data in accordance with RESTful best practices
   * as applied to standard HTTP requests.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {string} paramType 'GET' or 'POST'
   * @param {string} paramUrl The name of the endpoint i.e. "server.php"
   * @param {!object=} paramData Data in obj form to be stringified (optional)
   * @returns {Promise}
   */
  inaccessible.sendRequest = function (paramType, paramUrl, paramData = null) {
    return new Promise((resolve, reject) => {

      // Declarations
      let request, params;

      // Definition of new request
      request = new XMLHttpRequest();

      // Intialize request
      request.open(paramType, paramUrl);

      if (paramType === 'POST' && paramData != null) {
        if (paramData.encode === true) {
          request.setRequestHeader('Content-Type', 'application/json');
          params = JSON.stringify(paramData.params);
        } else {
          request.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded');
          params = this.serialize(paramData.params);
        }

        if (DEBUG) {
          console.log(params);
        }
      }

      // Resolve or reject Promise depending on request status
      request.onload = function () {
        if (request.status == 200) {
          resolve(request.response);
        } else {
          reject(Error(request.statusText));
        }
      };

      // Handle network errors
      request.onerror = function () {
        reject(Error(Text.ERROR_NETWORK));
      };

      // Make request (data will be either null or a stringified object)
      request.send(params);
    });
  };

  /**
   * @description This utility function is used to ensure that images present in
   * the DOM are properly loaded and displayed prior to fading in on the page
   * via <code>inaccessible.tinderize</code> and <code>inaccessible.fade</code>.
   * It functions by iterating through the images present in the document or in
   * the optional parameter <code>HTMLElement<code> and attaching a loading
   * event listener to each. Once each image loads, the loaded images counter is
   * increased, and once all images are loaded, the <code>Promise</code> is
   * resolved to allow fade-in to proceed.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {!HTMLElement=} paramContent HTMLElement containing images to load
   * @returns {Promise}
   */
  inaccessible.loadImages = function (paramContent = null) {
    return new Promise((resolve) => {

      // Declarations
      let images, unloadedImages, counter, loadListener;

      // Definitions
      images = (paramContent != null)
        ? paramContent.getElementsByTagName('img')
        : document.images;
      unloadedImages = images.length;
      counter = 0;

      // Iterate through images present on page
      [].forEach.call(images, (image) => {

        // Only attach load listener if image isn't loaded already
        if (image.complete) {
          unloadedImages -= 1;
        } else {
          image.addEventListener('load', loadListener = () => {
            counter++;
            if (counter === unloadedImages) {
              resolve();
              image.removeEventListener('load', loadListener);

              if (DEBUG) {
                console.log(Text.IMAGES_LOADED.replace('$1', unloadedImages));
              }
            }
          }, false);
        }
      });

      // Cached pages and loaded images
      if (unloadedImages === 0) {
        resolve();
      }
    });
  };

  /**
   * @description This function handles the translation of an inputted JS/JSON
   * object into a query string like that present in vanilla jQuery builders,
   * namely <code>$.params</code>. This is primarily for use in sending
   * <code>POST</code> requests in passing argument parameters as the data. It
   * is used in most cases of data transmission to the back-end, with the other
   * REST-compliant approach&mdash;namely the use of JSON-encoded data&mdash;
   * used only in certain cases as required by the endpoints.
   *
   * @param {object} paramObject The JS/JSON object to be serialized
   * @returns {string} String formatted as <code>username=foo&password=X</code>
   */
  inaccessible.serialize = function (paramObject) {
    return Object.entries(paramObject).map((pair) => pair.join('=')).join('&');
  };

  /**
   * @description This utility function is used to consolidate the contents of
   * an inputted array of numbers through the performing of an inputted common
   * algebraic operation. The associated value is then returned from the
   * function. Within this file, this function is only used with the
   * <code>Operations.ADDITION</code> and <code>Operations.SUBTRACTION</code>
   * operations; the comparison operations in the enum require a different
   * invocation method. It is used to adjust the opacity of a container element
   * to simulate a fade-in/fade-out function.
   *
   * @param {!Array<number>} paramList Array of number values
   * @param {string} paramOperation The <code>Operations</code> enum operation
   * @returns {number}
   */
  inaccessible.performCommonOperation = function (paramList, paramOperation) {
    return paramList.reduce(Operations[paramOperation]);
  };

  /**
   * @description This function returns a <code>boolean</code> value based on
   * whether or not the inputted JS object is an array. It will be used by
   * <code>inaccessible.assembleElement</code> to determine if the inputted
   * parameters need to be formatted as arrays or whether the user has correctly
   * passed well-formed input arguments to the function as expected. Originally,
   * the author was considering including in that function as inner function,
   * but eventually decided to keep things organized by locating all utility
   * functions in a specific section of the <code>inaccessible</code> scope
   * object.
   *
   * @param {object} paramTarget JS object to be checked
   * @returns {boolean} Returns <code>true</code> if object is an Array
   */
  inaccessible.isArray = function (paramTarget) {
    return Object.prototype.toString.call(paramTarget) === '[object Array]';
  };

  /**
   * @description This utility function is used simply to capitalize the first
   * letter of the inputted parameter <code>String</code>. The resultant
   * modified <code>String</code> is subsequently returned. The function is used
   * primarily in cases wherin specialized text might be extraneous. By
   * simply capitalizing a string already used to form CSS selectors, duplicates
   * can be avoided.
   *
   * @param {string} paramString String to be capitalized
   * @return {string}
   */
  inaccessible.capitalize = function (paramString) {
    return paramString.charAt(0).toUpperCase() + paramString.slice(1);
  };

  /**
   * @description This function is used to check if an inputted element is a
   * wellformed DOM element, returning an associated <code>boolean</code> value
   * depending on the result. It is primarily used by
   * <code>inaccessible.assembleElement</code> to handle cases wherein certain
   * array elements constituting parts of the element to contruct may be
   * preassembled DOM elements nested within. Like its related helper function
   * <code>inaccessible.isArray</code>, it was originally planned to be
   * included as an inner function of <code>assembleElement</code>, but was left
   * in the <code>inaccessible</code> scope to keep things organized and
   * readable.
   *
   * @param {object} paramTarget Object to be checked for element status
   * @returns {boolean} Returns <code>true</code> if object is a DOM element
   */
  inaccessible.isElement = function (paramObject) {
    return (
      typeof HTMLElement === 'object'
        ? paramObject instanceof HTMLElement
        : (
          paramObject &&
          typeof paramObject === 'object' &&
          paramObject !== null &&
          paramObject.nodeType === 1 &&
          typeof paramObject.nodeName === 'string'
        )
    );
  };

  /**
   * @description This utility function is used to remove any half-assembled
   * element content stored within a certain inputted DOM element. It sees use
   * in the clearing of the page on scene transition immediately after fading
   * out of the scene, appearing solely in the body of
   * <code>inaccessible.tinderize</code>. It could perhaps be integrated within
   * that function given that it sees use nowhere else in the module.
   *
   * @see {@link https://stackoverflow.com/a/3450726|Relevant SO Thread}
   * @param {string} paramElementSelector Selector of the element to be cleared
   * @returns {void}
   */
  inaccessible.emptyElementOfContent = function (paramElementSelector) {

    // Declaration
    let element;

    // Definition
    element = document.querySelector(paramElementSelector);

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  /**
   * @description This utility function is used to return a <code>boolean</code>
   * flag denoting whether or not the element specified by means of the
   * parameter <code>String</code> is visible in the viewport (more specifically
   * whether the display is set to none, expected behavior in the cases wherein
   * this function may be expected to be invoked). It was vaguely inspired by
   * jQuery's <code>$.exists()</code> function used on the Wikia network.
   *
   * @param {string} paramElementSelector Selector of the element to be checked
   * @returns {boolean}
   */
  inaccessible.isVisible = function (paramElementSelector) {

    // Declaration
    let element;

    // Definition
    element = document.querySelector(paramElementSelector);

    return (element.currentStyle)
      ? element.currentStyle.display
      : getComputedStyle(element, null).display !== 'none';
  };

  /**
   * @description This function is based on the similarly-named fading function
   * available by default in jQuery. As parameter-specified container elements
   * will have dynamically-set opacity values defined herein, this function just
   * increases or decreases the element's opacity until it reaches a value of 1
   * or 0, thus giving the impression of the scene fading in or out from the
   * start. This helps hide the often jerky page and interface assembly sequence
   * from view for a few milliseconds.
   * <br />
   * <br />
   * This function presently allows for fading in or out of view depending on
   * the value of an included <code>String</code> parameter, allowing for
   * seemless transitions between interface scenes as needed. Originally, there
   * were a pair of functions for fading in and out, both of which shared much
   * of the same code. In an effort to reduce copy/pasta, these were combined
   * into a single utility function that makes use of a computational enum for
   * the handling of simply algebraic operations related to the increase or
   * decrease of element opacity.
   *
   * @param {string} paramFadeType <code>String</code> indicating type of fade
   * @param {string} paramElementSelector Container/wrapper class
   * @return {void}
   */
  inaccessible.fade = function (paramFadeType, paramElementSelector) {

    // Declarations
    let container, interval, fadeType, fadeTypeObject, fadeTypeParameters;

    // Grab DOM element from id
    container = document.querySelector(paramElementSelector);

    // Make sure to correct any input errors
    fadeType = paramFadeType.toUpperCase();

    // Set default opacity here rather than in config objects (as before)
    container.style.opacity = (fadeType === 'OUT') ? 1 : 0;

    // Removes need for separate functions
    fadeTypeParameters = Object.freeze({
      'IN': {
        comparison: 'LESS_THAN',
        operator: 'ADDITION',
        comparisonValue: 1,
      },
      'OUT': {
        comparison: 'GREATER_THAN',
        operator: 'SUBTRACTION',
        comparisonValue: 0,
      },
    });

    // Based on fade type, select and use object with appropriate properties
    fadeTypeObject = fadeTypeParameters[fadeType];

    // Define interval handler
    interval = setInterval(() => {

      if ( // If either opacity < 1 or opacity > 0...
        Operations[fadeTypeObject.comparison](
          container.style.opacity,
          fadeTypeObject.comparisonValue
        )
      ) {

        // Either opacity + const_value or opacity - const_value
        container.style.opacity = this.performCommonOperation(
          [
            Number.parseFloat(container.style.opacity),
            Utility.OPACITY_INCREASE_AMOUNT,
          ],
          fadeTypeObject.operator
        );
      } else {
        clearInterval(interval);
        return;
      }
    }, Utility.FADE_IN_INTERVAL);
  };

  /**
   * @description This function is used to move the element specified via the
   * <code>String</code> selector parameter to the right. It is to be used in
   * conjunction with <code>inaccessible.fade</code> to allow for a seamless
   * transition between scenes (i.e. education scene and the homepage, etc.).
   * Depending on the parameters inputted to <code>inaccessible.tinderize</code>
   * as related to the swiping animation, this function may not be called in all
   * instances of scene or module loading, only when the panels on the homepage
   * are clicked by the user.
   * <br />
   * <br />
   * Originally, the initial implementation of this function involved some janky
   * coding that resulted in the container flickering to the left before
   * starting the animation. The current rewritten implementation should handle
   * such cases and require no CSS-based fixing to work as expected. It could
   * still use some perfecting, but it does work as expected and adds a nice
   * little aesthetic touch to what would otherwise be flat fading in and out
   * via the <code>inaccessible.fade</code> fading function.
   *
   * @see {@link https://stackoverflow.com/a/29490865|SO Thread}
   * @param {string} paramElementSelector Element class
   * @return {void}
   */
  inaccessible.swipeRight = function (paramElementSelector) {

    // Declarations
    let container, interval, startTime, timePassed;

    // Cache start time
    startTime = Date.now();

    // Set retrieved container's placement to relative
    container = document.querySelector(paramElementSelector);
    container.style.position = 'relative';

    // Define interval
    interval = setInterval(() => {

      // Check time since start
      timePassed = Date.now() - startTime;

      if (timePassed >= Utility.SWIPE_INTERVAL_TIME ||
          container.style.opacity <= 0) {

        clearInterval(interval);
        container.style.left = 0;
        return;
      }

      // Draw animation at the moment of timePassed
      container.style.left = `${timePassed / 5}px`;

    }, Utility.FADE_IN_INTERVAL);
  };

  /**
   * @description This function was designed to oversee the change of scenes
   * dynamically without having to default to the use of hardcoded HTML.
   * Depending on the input parameters, it generally fades out of the present
   * scene while shifting it right, removes the former content and builds the
   * required interface scene, then fades back in. Alternatively, based on its
   * specific use-cases, the function may only fade out of a certain in-scene
   * portion of the page, such as a <code>div</code>, before replacing this
   * content with new content The <code>inaccessible.swipeRight</code> function
   * may be toggled herein as well, with certain use-cases requiring only the
   * fading function rather than both the fading and swiping functions.
   * <br />
   * <br />
   * In order to increase speed and reduce repetitive function calls, the author
   * implemented a page caching function that stores preassembled scenes and
   * their loaded images in a script-global object. This helps reduce some of
   * the overhead associated with rebuilding each scene every time the user
   * returns to a specific scene. Originally, the script did not make use of
   * such functionality. However, it was implemented after something similar
   * was suggested by Google's PageSpeed Insights as a means of speeding up the
   * application for the user.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {boolean} paramCanSwipeRight Use <code>swipeRight</code>?
   * @param {string} paramElementSelector Present container class
   * @param {object} paramConfig Config from <code>data.json</code>
   * @returns {void}
   */
  inaccessible.tinderize = function (paramCanSwipeRight, paramElementSelector,
      paramConfig) {

    // Declarations
    let interval, container, content, selector;

    // Translate string to proper selector form
    selector = `.${paramElementSelector}`;

    // Grab container element
    container = document.querySelector(selector);

    // Move scene to the right and fade out prior to removing children from DOM
    if (paramCanSwipeRight) {
      this.swipeRight(selector);
    }
    this.fade('OUT', selector);

    interval = setInterval(() => {
      if (container.style.opacity <= 0) {

        // Clear opacity checking interval
        clearInterval(interval);

        // Set to zero exactly
        container.style.opacity = 0;

        // Use cached scene content if possible
        if (!this.cache.pages.hasOwnProperty(paramConfig.name.toLowerCase())) {

          // Assemble new content using scene-specific builder function
          content = this[paramConfig.handler](paramConfig.name);

          // Add assembled page to cache object
          this.cache.pages[paramConfig.name] = content;
        } else {
          content = this.cache.pages[paramConfig.name];
        }

        // Fade in on the newly reconfigured scene only once images loaded
        this.loadImages(content).then(() => {

          // Remove outdated DOM elements from container
          this.emptyElementOfContent(selector);

          // Append new content to parent container
          container.appendChild(content);

          // Fade in on new scene without any jarring transitions
          this.fade('IN', selector);
        });
      }
    }, Utility.CHECK_OPACITY_RATE);
  };

  // Assembly functions

  /**
   * @description As its name implies, this function is used to construct an
   * individual instance of an element or object; in this case, it builds a
   * single HTML element that will be returned from the function and appended to
   * the DOM dynamically. It accepts an array of strings denoting the type of
   * element to create and also handles potentially nested element arrays for
   * elements that are to exist inside the outer element tags as inner HTML. In
   * many respects, this function is the most critical building block of the
   * module, as it use facilitates the generation of dynamic JS-mediated scenes
   * that can be built and added to the page without the need to fetch static
   * HTML files. The builder functions contained in this JS module are really
   * nothing more than heavy extended invocations of this function that pass
   * large frameworks of HTML for assembly herein.
   * <br />
   * <br />
   * An example of wellformed input is shown below:
   * <br />
   * <pre>
   * this.assembleElement(
   *   ['div', {id: 'foo-id', class: 'foo-class'},
   *     ['button', {id: 'bar-id', class: 'bar-class'},
   *       'Text',
   *     ],
   *   ],
   * );
   * </pre>
   *
   * @param {!Array<string>} paramArray Well-formed array representing DOM node
   * @returns {HTMLElement} element Assembled element for addition to DOM
   */
  inaccessible.assembleElement = function (paramArray) {

    // Declarations
    let element, name, attributes, counter, content;

    // Make sure input argument is a well-formatted array
    if (!this.isArray(paramArray)) {
      return this.assembleElement.call(this,
          Array.prototype.slice.call(arguments));
    }

    // Definitions
    name = paramArray[0];
    attributes = paramArray[1];
    element = document.createElement(name);
    counter = 1;

    /**
     * Note: We use <code>!=</code> here to check for both undefined and null
     * behavior since <code>attributes != null</code> is equivalent to
     * <code>attributes === undefined || attributes === null</code>.
     */
    if (typeof attributes === 'object' && attributes != null &&
        !this.isArray(attributes)) {

      for (let attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
      }

      counter = 2;
    }

    for (let i = counter; i < paramArray.length; i++) {

      // Check if recursive assembly is required for another inner DOM element
      if (this.isArray(paramArray[i])) {
        content = this.assembleElement(paramArray[i]);

      // Otherwise check if array element is already an assembled DOM element
      } else if (this.isElement(paramArray[i])) {
        content = paramArray[i];

      // Otherwise, treat any remaining array elements as text content
      } else {
        content = document.createTextNode(paramArray[i]);
      }

      // Add to outer parent element
      element.appendChild(content);
    }

    return element;
  };

  /**
   * @description This function is used as a super-specialized version of the
   * above assembly function <code>inaccessible.assembleElement</code>. It is
   * used to build various list elements containing buttons, and is the general
   * purpose assembly function for all such elements except for the home page
   * pseudo-buttons, meta elements, and connect link buttons. This function
   * accepts as parameters a config object containing name and text properties
   * for selector assembly and button text addition and a <code>String</code>
   * parameter denoting the target location to which the list-button combo
   * belongs (i.e. "nav" or "sitemap").
   * <br />
   * <br />
   * Button input objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   "name": "Name",
   *   "text": "Text",
   * },
   * </pre>
   *
   * @param {object} paramObject Config button object as seen above
   * @param {string} paramLocation Target ("nav" or "sitemap")
   * @returns {HTMLElement} listElement Assembled button for addition to DOM
   */
  inaccessible.assembleListElement = function (paramObject, paramLocation) {

    // Declarations
    let listElement, button, listElementConfig, buttonConfig;

    // List element config
    listElementConfig = {
      class: `${paramLocation}-li`
    };

    // Inner button config
    buttonConfig = {
      class: `${paramLocation}-link ${Classes.GENERAL__BUTTON_LINK}`
    };

    // Definitions
    listElement = this.assembleElement(['li', listElementConfig]);
    button = this.assembleElement(['button', buttonConfig, paramObject.text]);

    button.addEventListener('click', () => {
      this.handleButtonClicks(paramObject, false);
    }, false);

    // Add button to li wrapper
    listElement.appendChild(button);

    return listElement;
  };

  /**
   * @description Similar in purpose and design to the above assembly function
   * <code>inaccessible.assembleListElement</code> and its progenitor function
   * <code>inaccessible.assembleElement</code>, this assembly function is used
   * exclusively to create the home page's photoblock panels, which include
   * <code>a</code> links factored to act like standard button elements with
   * their associated click event listeners. Each block consists of the
   * aforementioned button link containing a <code>picture</code> tag and a
   * <code>div</code>. The former includes a pair of images for desktop and
   * mobile view, while the latter includes the text overlay that will display
   * atop the image shown.
   * <br />
   * <br />
   * Parameter objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   name: "name",
   *   text: "Panel name",
   *   picture: {
   *     normal: "test1.jpg",
   *     mobile: "mobileTest1.jpg",
   *   },
   * },
   * </pre>
   *
   * @param {object} paramObject Config button object as seen above
   * @returns {HTMLElement} container Assembled button for addition to DOM
   */
  inaccessible.assembleHomeListElement = function (paramObject) {

    // Declarations
    let container, button, containerAttributes, buttonAttributes,
      pictureAttributes, sourceAttributes, imageAttributes, coverAttributes,
      phototextAttributes;

    // List element wrapper
    containerAttributes = {
      class: `home-${paramObject.name} ${Classes.HOME__LI}`,
    };

    // Inner link pseudo-button config
    buttonAttributes = {
      class: Classes.HOME__LINK,
      role: 'button',
    };

    // <picture> tag wrapper
    pictureAttributes = {
      class: Classes.HOME__PICTURE,
    };

    // <source> tag for mobile config
    sourceAttributes = {
      media: `(min-width: ${Utility.IMAGE_MIN_WIDTH}px)`,
      srcset: `${Text.IMAGES_FOLDER}/${paramObject.picture.normal}`,
    };

    // Main image tag config
    imageAttributes = {
      class: Classes.GENERAL__RESPONSIVE_IMAGE,
      alt: paramObject.text,
      src: `${Text.IMAGES_FOLDER}/${paramObject.picture.mobile}`,
    };

    // Text overlay wrapper config
    coverAttributes = {
      class: Classes.HOME__COVER,
    };

    // Text overlay config
    phototextAttributes = {
      class: Classes.HOME__PHOTOTEXT,
    };

    // Build elements
    container = this.assembleElement(['li', containerAttributes]);
    button = this.assembleElement(
      ['a', buttonAttributes,
        ['picture', pictureAttributes,
          ['source', sourceAttributes],
          ['img', imageAttributes],
        ],
        ['div', coverAttributes,
          ['p', phototextAttributes,
            paramObject.text,
          ],
        ],
      ],
    );

    // Click handler
    button.addEventListener('click', () => {
      this.handleButtonClicks(paramObject, true);
    }, false);

    // Add button to li wrapper
    container.appendChild(button);

    return container;
  };

  /**
   * @description Like the previous assembly functions above, namely
   * <code>inaccessible.assembleHomeListElement</code> and
   * <code>inaccessible.assembleListElement</code>, this function is used to
   * assemble list elements for an unordered list in the DOM. In this case, the
   * function is used exclusively to build list items in the Meta section of the
   * upper footer, providing titles and text related to the author's email and
   * phone number as contact information. While the other functions generally
   * create buttons (or link pseudo-buttons) inside list elements, this assembly
   * function assembles a pair of <code>span</code>s inside a list element
   * displaying the title of each field and the associated text.
   * <br />
   * <br />
   * Parameter objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   "title": "Email",
   *   "text": "andrew@andreweissen.com",
   * },
   * </pre>
   *
   * @param {object} paramObject Config object as seen above
   * @returns {HTMLElement}
   */
  inaccessible.assembleMetaListElement = function (paramObject) {

    // Declarations
    let listAttributes, titleAttributes, textAttributes;

    // List element wrapper config
    listAttributes = {
      class: Classes.META__LI,
    };

    // Title config
    titleAttributes = {
      class: Classes.META__LI_TITLE,
    };

    // Text config
    textAttributes = {
      class: Classes.META__LI_TEXT + ' ' + Classes.GENERAL__BUTTON_LINK + ' ' +
        Classes.GENERAL__PLAINLINK,
      href: `mailto:${paramObject.text}`,
    };

    return this.assembleElement(
      ['li', listAttributes,
        ['span', titleAttributes,
          paramObject.title,
        ],
        ['a', textAttributes,
          paramObject.text,
        ],
      ],
    );
  };

  /**
   * @description Like <code>inaccessible.assembleMetaListElement</code> above,
   * this function is used to assemble list elements for use in lists included
   * in the upper footer section. It is specifically tasked with assembling the
   * external link sections providing users the ability to view the author's
   * GitHub and LinkedIn accounts. Each section includes an <code>svg</code>
   * image displaying the logo of the site to which the section links, a title,
   * and a descriptive text section. Apart from these expansions of the usual
   * button-in-list element approach of previous assembly functions, the
   * function operates in much the same way as others in the section.
   * <br />
   * <br />
   * Parameter objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   "text": "Test",
   *   "link": "https://www.test.com/andreweissen",
   *   "description": {
   *     "title": "View my Test account",
   *     "text": "Browse repositories related to web development..."
   * }
   * </pre>
   *
   * @param {object} paramObject Config object as seen above
   * @returns {HTMLElement}
   */
  inaccessible.assembleConnectListElement = function (paramObject) {

    // Declarations
    let icon, listAttributes, linkAttributes, imageAttributes, descAttributes,
      descTitleAttributes, descTextAttributes;

    // Name of the icon ("github", "linkedin", etc.)
    icon = paramObject.text.toLowerCase();

    // Config for list element
    listAttributes = {
      class: 'connect-' + paramObject.text.toLowerCase() +
        ' ' + Classes.GENERAL__HAS_HEIGHT + ' ' + Classes.CONNECT__LI,
    };

    // Button link config
    linkAttributes = {
      href: paramObject.link,
      title: paramObject.text,
      class: Classes.CONNECT__LINK,
      target: Text.LINK_TARGET,
    };

    // svg icon image config
    imageAttributes = {
      class: `${Classes.GENERAL__RESPONSIVE_IMAGE} ${Classes.CONNECT__SVG}`,
      alt: `${paramObject.text} icon`,
      src: `${Text.IMAGES_FOLDER}/${icon}.${Text.ICON_FORMAT}`,
    };

    // Description wrapper config
    descAttributes = {
      class: Classes.CONNECT__DESC,
    };

    // Description title config
    descTitleAttributes = {
      class: Classes.CONNECT__DESC_TITLE,
    };

    // Description text config
    descTextAttributes = {
      class: Classes.CONNECT__DESC_TEXT,
    };

    return this.assembleElement(
      ['li', listAttributes,
        ['a', linkAttributes,
          ['img', imageAttributes],
        ],
        ['div', descAttributes,
          ['h5', descTitleAttributes,
            paramObject.description.title,
          ],
          ['div', descTextAttributes,
            paramObject.description.text,
          ],
        ],
      ],
    );
  };

  /**
   * @description The matched twin of <code>inaccessible.assembleEntry</code>,
   * this function is used to build mostly text-based sections for inclusion in
   * the right diptych panel of default site scenes. It accepts as a parameter
   * a config object including a section h2-level title and an array of title-
   * text sections that serve as the paragraph content of the so-called "essay"
   * being built. Originally, there could be multiple essays in the right panel,
   * though the functionality was removed for being too needlessly complex.
   * Instead, this function will only invoked for as many sections need
   * construction in the one essay permitted.
   * <br />
   * <br />
   * This function sees use both in the left and right diptych panels. For the
   * left, it is used to create the summary paragraph below the avatar, header,
   * and subheader. On the right, it is used to create the text sections of the
   * "About" and "Contact" scenes. For the former, no title is generally
   * included, while titles are essential for cases on the right.
   * <br />
   * <br />
   * Parameter objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   "title": "About me",
   *   "paragraphs": [
   *     "Hey there! I'm Andrew Eissen.",
   *     "Paragraph 2"
   *   ]
   * }
   * </pre>
   *
   * @param {object} paramSection Config object as seen above
   * @returns {HTMLElement} section Assembled essay section
   */
  inaccessible.assembleEssaySection = function (paramSection) {

    // Declarations
    let section, paragraphTitle, paragraphs, sectionAttributes,
      paragraphTitleAttributes, paragraphsAttributes, paragraphAttributes;

    // Section wrapper config
    sectionAttributes = {
      class: Classes.ESSAY__SECTION,
    };

    // Section title config
    paragraphTitleAttributes = {
      class: `${Classes.ESSAY__TITLE} ${Classes.DIPTYCH__SUBHEADER}`,
    };

    // Wrapper for paragraphs in section
    paragraphsAttributes = {
      class: Classes.ESSAY__PARAGRAPHS,
    };

    // Config for individual <p> paragraphs
    paragraphAttributes = {
      class: Classes.ESSAY__PARAGRAPH,
    };

    // Build section div
    section = this.assembleElement(['div', sectionAttributes]);

    // May not have a title if on left diptych
    if (paramSection.title) {
      paragraphTitle = this.assembleElement(
        ['h3', paragraphTitleAttributes, paramSection.title]);

      section.appendChild(paragraphTitle);
    }

    // Build paragraphs wrapper
    paragraphs = this.assembleElement(['div', paragraphsAttributes]);

    // Iterate through param object's inner array of text paragraphs
    paramSection.paragraphs.forEach((paragraph) => {
      paragraphs.appendChild(
        this.assembleElement('p', paragraphAttributes, paragraph));
    });

    // Add to section wrapper
    section.appendChild(paragraphs);

    return section;
  };

  /**
   * @description Like its twin <code>inaccessible.assembleEssaySection</code>
   * above, this function is used to create sections for the right diptych panel
   * related to the display of list-type entries. It accepts as a parameter
   * an input object containing a header, subheader, subsubheader, and either a
   * summary paragraph or a listing array of objects.
   * <br />
   * <br />
   * The latter property of the input object may be either a <code>String</code>
   * paragraph or a set of objects containing a header and array of
   * <code>String</code>s to be combined and delimited with commas into a single
   * <code>String</code>. The first option is used on all right panels using
   * this assembler except the "Education" scene. In this scene, the second
   * option is used to display sections related to coursework and any ancillary
   * honors earned while in study at each institution.
   * <br />
   * <br />
   * Parameter objects are styled as seen below:
   * <br />
   * <pre>
   * {
   *   "header": "Grove City College, Grove City, PA",
   *   "subheader": "Bachelor of Arts in Communication Studies",
   *   "date": "August 2010 – May 2014",
   *   "listing": [
   *     {
   *       "title": "Academic honors",
   *       "array": [
   *         "Graduated with Honors in Communication Studies",
   *         "Dean's List in Fall ‘12, Spring ‘13, and Spring ‘14 semesters"
   *       ]
   *     },
   *   ],
   * },
   * </pre>
   * <br />
   * <br />
   * Or as the following:
   * <br />
   * <pre>
   * {
   *   "header": "Grove City College, Grove City, PA",
   *   "subheader": "Bachelor of Arts in Communication Studies",
   *   "date": "August 2010 – May 2014",
   *   "summary": "Graduated with Honors in Communication Studies"
   * },
   * </pre>
   *
   * @param {object} paramEntry Config objects shown above
   * @param {boolean} paramHasRule Whether to display a <hr> element
   * @returns {HTMLElement} container
   */
  inaccessible.assembleEntry = function (paramEntry, paramHasRule) {

    // Declarations
    let container, summary, detailBlock, wrapperUpper, wrapperLower,
      containerAttributes, upperAttributes, headerAttributes,
      subheaderAttributes, dateAttributes, lowerAttributes, paragraphAttributes,
      listingAttributes, listingTitleAttributes, listingTextAttributes;

    // Entry wrapper config
    containerAttributes = {
      class: Classes.ENTRY__SECTION,
    };

    // Upper section config (header, subheader, subsubheader)
    upperAttributes = {
      class: Classes.ENTRY__UPPER,
    };

    // Header config
    headerAttributes = {
      class: Classes.ENTRY__HEADER,
    };

    // Subheader config
    subheaderAttributes = {
      class: Classes.ENTRY__SUBHEADER,
    };

    // Subsubheader (date) config
    dateAttributes = {
      class: Classes.ENTRY__DATE,
    };

    // Lower config (summary or listing)
    lowerAttributes = {
      class: Classes.ENTRY__LOWER,
    };

    // Paragraph tag config
    paragraphAttributes = {
      class: Classes.ENTRY__PARAGRAPH,
    };

    // Listing wrapper config
    listingAttributes = {
      class: Classes.ENTRY__LISTING,
    };

    // Listing title config
    listingTitleAttributes = {
      class: Classes.ENTRY__LISTING_TITLE,
    };

    // Associated text (commma-delimited, concatenated array)
    listingTextAttributes = {
      class: Classes.ENTRY__LISTING_TEXT,
    };

    // Build components
    container = this.assembleElement(['div', containerAttributes]);
    wrapperUpper = this.assembleElement(
      ['div', upperAttributes,
        ['div', headerAttributes,
          paramEntry.header
        ],
        ['div', subheaderAttributes,
          paramEntry.subheader,
        ],
      ],
    );

    // Not all entries will have subsubheader
    if (paramEntry.date) {
      wrapperUpper.appendChild(this.assembleElement(
        ['div', dateAttributes,
          paramEntry.date,
        ],
      ));
    }

    // Build lower section wrapper
    wrapperLower = this.assembleElement(['div', lowerAttributes]);

    // If section uses single String <p> (all except Education)
    if (paramEntry.summary) {
      summary = this.assembleElement(
        ['p', paragraphAttributes,
          paramEntry.summary,
        ],
      );

      wrapperLower.appendChild(summary);
    } else if (paramEntry.listing) {
      paramEntry.listing.forEach((section) => {
        detailBlock = this.assembleElement(
          ['div', listingAttributes,
            ['div', listingTitleAttributes,
              section.title,
            ],
            ['div', listingTextAttributes,
              section.array.join(', '),
            ],
          ],
        );

        wrapperLower.appendChild(detailBlock);
      });
    }

    // Add subsections to wrapper
    container.appendChild(wrapperUpper);
    container.appendChild(wrapperLower);

    // Certain sections will require a rule below the complete entry
    if (paramHasRule) {
      container.appendChild(document.createElement('hr'));
    }

    return container;
  };

  // Builder functions

  /**
   * @description The first of the builder functions, this function is used to
   * assemble an unordered list of list elements created en masse by multiple
   * invocations of one of the assembly functions included above. This function
   * is used to assemble all listings included in the interface, including the
   * navbar links, the sitemap listing in the upper footer, and the photopanels
   * extant on the homepage. It accepts an array of object denoting the list
   * elements to be included, a <code>String</code> denoting the intended use
   * and placement of the list, and an optional <code>boolean</code> indicating
   * whether to use one of the specialized assemblers other than the default
   * <code>inaccessible.assembleListElement</code>.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {!Array<object>} paramElements Array of config objects (home.array)
   * @param {string} paramType Either "home," "sitemap," "connect," etc.
   * @param {!boolean=} paramUseCustomAssembler Set to false
   * @returns {HTMLElement} container
   */
  inaccessible.buildList = function (paramElements, paramType,
      paramUseCustomAssembler = false) {

    // Declarations
    let container, containerAttributes, assemblyFunction, placement;

    // Either home, connect, sitemap, etc.
    placement = paramType.toLowerCase();

    // Wrapper config (<ul>)
    containerAttributes = {
      class: `${placement}-ul`,
    };

    // Build <ul> element
    container = this.assembleElement(['ul', containerAttributes]);

    // Use "assembleListElement" unless custom assembler required
    assemblyFunction = `assemble${(paramUseCustomAssembler)
      ? this.capitalize(paramType) : ''}ListElement`;

    // Iterate over array of objects and build using assembler of choice
    paramElements.forEach((element) => {
      container.appendChild(this[assemblyFunction](element, paramType));
    });

    // Return <ul> and components
    return container;
  };

  /**
   * @description The first builder invoked on the DOM load completion, this
   * builder function is used simply to assemble the header, footer, and main
   * homepage for the user. It establishes the superstructure of the application
   * that remains unchanged for as long as the user doesn't refresh the page or
   * leave the application. The header and footer&mdash;built via the builders
   * invoked herein&mdash;remain extant in the interface for all subsequent page
   * interaction on the part of the user and are not rebuilt unless the user
   * refreshes the page. The homepage is subject to change if the user presses a
   * button to view content.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildContainer = function () {

    // Declarations
    let containerAttributes, contentAttributes, mainAttributes;

    // Main wrapper config
    containerAttributes = {
      class: Classes.WRAPPER__CONTAINER,
    };

    // Content section config
    contentAttributes = {
      class: Classes.WRAPPER__CONTENT,
    };

    // <main> section config
    mainAttributes = {
      class: Classes.MAIN + ' ' + Classes.GENERAL__HAS_HEIGHT + ' ' +
        Classes.WRAPPER__CONTENT_SECTION,
    };

    // Cache home section for future use
    this.cache.pages.home = this.buildHome();

    return this.assembleElement(
      ['div', containerAttributes,
        ['div', contentAttributes,
          this.buildHeader(),
          ['main', mainAttributes,
            this.cache.pages.home,
          ],
          this.buildFooter(),
        ],
      ],
    );
  };

  /**
   * @description As the name implies, this particular builder function is used
   * to assemble the static header and should only be invoked once per page load
   * (assuming the user does not refresh the page or navigate away and back). It
   * is called only by <code>inaccessible.buildContainer</code> at the start of
   * the application assembly following a successful DOM load.
   * <br />
   * <br />
   * The builder assembles the logo itself without the need for invoking any
   * specialized subbuilder function, though it does require the use of the
   * <code>inaccessible.buildNav</code> subbuilder to assemble the nav (which
   * also functions as the dropdown menu for the mobile hamburger)
   *
   * @returns {HTMLElement} container
   */
  inaccessible.buildHeader = function () {

    // Declarations
    let headerAttributes, logoAttributes, imageAttributes, usernameAttributes,
      navAttributes;

    // Wrapper (<header>) config
    headerAttributes = {
      class: Classes.HEADER + ' ' + Classes.GENERAL__HAS_HEIGHT + ' ' +
        Classes.WRAPPER__CONTENT_SECTION,
    };

    // Logo subsection wrapper config
    logoAttributes = {
      class: `${Classes.LOGO} ${Classes.HEADER__SECTION}`,
    };

    // Logo svg image config
    imageAttributes = {
      class: Classes.LOGO__IMAGE + ' ' + Classes.GENERAL__RESPONSIVE_IMAGE +
        ' ' + Classes.LOGO__SECTION,
      alt: this.cache.data.header.image.alt,
      src: `${Text.IMAGES_FOLDER}/${this.cache.data.header.image.src}`,
    };

    // Logo text config
    usernameAttributes = {
      class: `${Classes.LOGO__TEXT} ${Classes.LOGO__SECTION}`,
    };

    return this.assembleElement(
      ['header', headerAttributes,
        ['section', logoAttributes,
          ['img', imageAttributes],
          ['h4', usernameAttributes,
            this.cache.data.header.name,
          ],
        ],
        this.buildNav()
      ]
    );
  };

  /**
   * @description Like its parent, <code>inaccessible.buildHeader</code>, this
   * function should only be called once during the page assembly process by
   * its parent builder. This particular subbuilder is responsible for building
   * both the <code>nav</code> bar used to house various button links and the
   * mobile "hamburger" icon shown to mobile and tablet users using smaller
   * screen widths.
   * <br />
   * <br />
   * The builder function is also responsible for defining the usage behavior of
   * the hamburger on user click, employing a click event listener in
   * conjunction with a series of script-global properties to ensure that the
   * menu collapses on clicks outside the vicinity of the navigation dropdown
   * and the hamburger itself.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildNav = function () {

    // Declarations
    let navAttributes, hamburgerAttributes, bar1Attributes, bar2Attributes,
      bar3Attributes, hamburger, navMenu;

    // Wrapper (<nav>) config
    navAttributes = {
      class: `${Classes.NAV} ${Classes.HEADER__SECTION}`,
    };

    // Hamburger <div> config
    hamburgerAttributes = {
      class: Classes.NAV__HAMBURGER,
    };

    // Upper hamburger bar config
    bar1Attributes = {
      class: Classes.NAV__UPPER_BAR,
    };

    // Middle hamburger bar config
    bar2Attributes = {
      class: Classes.NAV__MIDDLE_BAR,
    };

    // Lower hamburger bar config
    bar3Attributes = {
      class: Classes.NAV__LOWER_BAR,
    };

    // Build components
    navMenu = this.buildList(this.cache.data.home.array, 'nav', false);
    hamburger = this.assembleElement(
      ['div', hamburgerAttributes,
        ['div', bar1Attributes],
        ['div', bar2Attributes],
        ['div', bar3Attributes],
      ],
    );

    // Define behavior of hamburger on clicks on and outside elements
    hamburger.addEventListener('click', () => {

      // When clicked, toggle classes
      this.handleMenuToggle(hamburger, navMenu);

      // If it's open...
      if (this.isMenuOpen) {

        // ...add a DOM event listener
        document.addEventListener('click', this.handleOutsideClicks =
            (event) => {

          // If the click target isn't in the burger or menu...
          if (!hamburger.contains(event.target) &&
              !navMenu.contains(event.target)) {

            // Toggle the classes again
            this.handleMenuToggle(hamburger, navMenu);
          }
        });
      }
    });

    return this.assembleElement(
      ['nav', navAttributes,
        hamburger,
        navMenu,
      ],
    );
  };

  /**
   * @description Like the similar <code>inaccessible.buildHeader</code>, this
   * function should only be called once during the page assembly process by
   * <code>inaccessible.buildContainer</code> at the completion of the DOM
   * loading process (assuming the user doesn't refresh). As its name implies,
   * this particular builder is responsible for building the footer in its
   * component upper and lower parts.
   * <br />
   * <br />
   * While the lower footer is composed of a simple wrapper and a
   * <code>span</code> containing copyright info, the upper footer requires the
   * use of the subbuilder <code>inaccessible.buildFooterUpperSection</code> to
   * build each of the three major sections. These are the meta section, the
   * sitemap, and the connect section.
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildFooter = function () {

    // Declarations
    let footerAttributes, upperFooterAttributes, lowerFooterAttributes,
      copyrightAttributes, metaArray, sitemapArray, connectArray;

    // Wrapper (<footer>) config
    footerAttributes = {
      class: Classes.FOOTER,
    };

    // Upper footer config
    upperFooterAttributes = {
      class: Classes.FOOTER__UPPER + ' ' + Classes.FOOTER__SECTION + ' ' +
        Classes.GENERAL__HAS_HEIGHT + ' ' + Classes.WRAPPER__CONTENT_SECTION,
    };

    // Lower footer config
    lowerFooterAttributes = {
      class: Classes.FOOTER__LOWER + ' ' + Classes.FOOTER__SECTION + ' ' +
        Classes.GENERAL__HAS_HEIGHT + ' ' + Classes.WRAPPER__CONTENT_SECTION,
    };

    // Lower footer's copyright config
    copyrightAttributes = {
      class: Classes.FOOTER__COPYRIGHT,
    };

    // Parameters array for meta section
    metaArray = [
      'section',
      'meta',
      this.cache.data.details.email.slice(0, 2),
      this.cache.data.footer.meta.summary,
    ];

    // Parameters array for sitemap section
    sitemapArray = [
      'nav',
      'sitemap',
      this.cache.data.home.array,
    ];

    // Parameters array for connect section
    connectArray = [
      'section',
      'connect',
      this.cache.data.footer.connect.array,
    ];

    return this.assembleElement(
      ['footer', footerAttributes,
        ['section', upperFooterAttributes,
          this.buildFooterUpperSection(...metaArray),
          this.buildFooterUpperSection(...sitemapArray),
          this.buildFooterUpperSection(...connectArray),
        ],
        ['section', lowerFooterAttributes,
          ['span', copyrightAttributes,
            this.cache.data.footer.copyright,
          ],
        ],
      ],
    );
  };

  /**
   * @description This utility subbuilder function is invoked exclusively by the
   * <code>inaccessible.buildFooter</code> builder function to create each of
   * the three major sections of the upper footer, namely the meta, sitemap, and
   * connect sections. Originally, there were a series of three such subbuilders
   * employed for each section to handle their differences, through eventually
   * these were consolidated into this single function by means of some semi-
   * janky modifications to the function. Now, the specific property
   * configurations of each section object are respected by a series of
   * <code>if</code> statements to ensure that each section is built properly.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {string} paramTag HTML tag to use (section, nav, etc.)
   * @param {string} paramType Section name, either meta, sitemap, or connect
   * @param {!object=} paramSummaryObject Null by default (optional)
   * @returns {HTMLElement}
   */
  inaccessible.buildFooterUpperSection = function (paramTag, paramType,
      paramArray, paramSummaryObject = null) {

    // Declarations
    let type, containerAttributes, titleAttributes, textAttributes;

    // Remove any accidental capital letters
    type = paramType.toLowerCase();

    // <nav> or <section> attributes
    containerAttributes = {
      class: `${type} ${Classes.FOOTER__UPPER_SECTION}`,
    };

    // <h4> attributes
    titleAttributes = {
      class: `${type}-title ${Classes.FOOTER__TITLE}`,
    };

    // Summary paragraph only appears with leftmost meta section
    if (paramSummaryObject != null) {
      textAttributes = {
        class: `${type}-text`,
      };
    }

    return this.assembleElement(
      [paramTag, containerAttributes,
        ['h4', titleAttributes,
          (paramSummaryObject != null)
            ? paramSummaryObject.title
            : this.capitalize(type),
        ],
        (paramSummaryObject != null)
          ? ['div', textAttributes, paramSummaryObject.text]
          : '',
        this.buildList(paramArray, type, (paramTag === 'nav') ? false : true),
      ],
    );
  };

  /**
   * @description The simplest of the builder functions included herein, this
   * function is responsible for building the homepage, displaying the image of
   * a computer screen split into six panels. This function is invoked several
   * times during the process, first by <code>inaccessible.buildContainer</code>
   * when the DOM is loaded and subsequently when the user presses any of the
   * "Home" sitemap or navbar buttons.
   * <br />
   * <br />
   * The function works by simply invoking <code>inaccessible.buildList</code>
   * and passing it the home array minus the first element ("home" itself&mdash;
   * no point having a home panel on the homepage).
   *
   * @returns {HTMLElement}
   */
  inaccessible.buildHome = function () {
    return this.buildList(this.cache.data.home.array.slice(1), 'home', true);
  };

  /**
   * @description One of the macro-builders like those responsible for
   * overseeing the construction of the header and footer, this function is used
   * to build the diptych, the two panel layout that serves to display the info
   * for each scene. Apart from the homepage six panel layout, the diptych
   * serves as the central mechanism by which the info on the site is displayed
   * to the user.
   * <br />
   * <br />
   * Due to this widespread ubiquitious usage in the application, the sole
   * parameter required for building the diptych was the name of the scene being
   * assembled (i.e. "education" or "experience"). This is used to fetch the
   * required JSON from the <code>inaccessible.cache</code> object and apply
   * scene-specific selectors to assembled HTML elements in the diptych.
   *
   * @param {string} paramName Scene being built (i.e. "education")
   * @returns {HTMLElement}
   */
  inaccessible.buildDiptych = function (paramName) {

    // Declarations
    let containerAttributes, leftAttributes, leftAvatarAttributes, leftPanel,
      leftHeaderAttributes, leftSubheaderAttributes, leftSummaryAttributes,
      tempAside;

    // Temporary variable for aside/left panel
    tempAside = this.cache.data[paramName].aside;

    // Diptych container config
    containerAttributes = {
      class: `${Classes.DIPTYPCH} ${Classes.GENERAL__HAS_HEIGHT}`,
    };

    // Aside attributes

    // Aside config
    leftAttributes = {
      class: `${Classes.LEFT__PANEL} ${Classes.DIPTYCH__PANEL}`
    };

    // Left avatar config
    leftAvatarAttributes = {
      class: Classes.LEFT__AVATAR,
      src: `${Text.IMAGES_FOLDER}/${paramName}.webp`,
      alt: `${this.capitalize(paramName)} avatar`,
    };

    // Left <h1> config
    leftHeaderAttributes = {
      class: `${Classes.LEFT__HEADER} ${Classes.DIPTYCH__HEADER}`,
    };

    // Left <h5> config
    leftSubheaderAttributes = {
      class: `${Classes.LEFT__SUBHEADER} ${Classes.DIPTYCH__SUBHEADER}`,
    };

    // Left summary text
    leftSummaryAttributes = {
      class: Classes.LEFT__SUMMARY,
    };

    // Build aside panel
    leftPanel = this.assembleElement(
      ['aside', leftAttributes,
        ['img', leftAvatarAttributes],
        ['h1', leftHeaderAttributes,
          tempAside.header,
        ],
      ],
    );

    // Not all asides have the subheader
    if (tempAside.subheader) {
      leftPanel.appendChild(this.assembleElement(
        ['h5', leftSubheaderAttributes, tempAside.subheader]));
    }

    // Add summary paragraph(s) to aside
    leftPanel.appendChild(
      this.assembleEssaySection(this.cache.data[paramName].aside.summary));

    // Left table (only About and Contact sections)
    if (tempAside.canShowTable) {
      leftPanel.appendChild(this.buildLeftDetailsTable());
    }

    return this.assembleElement(
      ['section', containerAttributes,
        leftPanel,
        this.buildRightPanel(paramName),
      ],
    );
  };

  /**
   * @description Following previously defined builder-subbuilder progression
   * employed in other builder functions, this function is used as a subbuilder
   * of the <code>inaccessible.buildDiptych</code> function and oversees the
   * assembly of the right panel (or <code>article</code> section) of the
   * diptych interface.
   * <br />
   * <br />
   * Depending on whether the scene JSON in question requires the display of
   * an essay containing paragraph sections or a listing of entries, the
   * function invokes the appropriate handler within the body of a
   * <code>forEach</code> loop, adding the resultant <code>HTMLElement</code>s
   * to the section as required.
   *
   * @param {string} paramName Scene being built (i.e. "education")
   * @returns {HTMLElement}
   */
  inaccessible.buildRightPanel = function (paramName) {

    // Declarations
    let container, article, articleHeader, articleSection, subsectionType,
      containerAttributes, articleHeaderAttributes, articleSectionAttributes;

    // Container config (<article>)
    containerAttributes = {
      class: `${Classes.RIGHT__PANEL} ${Classes.DIPTYCH__PANEL}`
    };

    // Header (<h2>) config
    articleHeaderAttributes = {
      class: `${Classes.RIGHT__HEADER} ${Classes.DIPTYCH__HEADER}`,
    };

    // Section (<section>) config
    articleSectionAttributes = {
      class: Classes.RIGHT__CONTENT,
    };

    // Alias article object
    article = this.cache.data[paramName].article;

    // Define HTMLElements
    container = this.assembleElement(['article', containerAttributes]);
    articleHeader = this.assembleElement(
      ['h2', articleHeaderAttributes,
        article.header,
      ],
    );
    articleSection = this.assembleElement(
      ['section', articleSectionAttributes]);

    // Use different appending approach depending on essay or entries list
    if (article.essaySections) {
      article.essaySections.forEach((subsection) => {
        articleSection.appendChild(this.assembleEssaySection(subsection));
      });
    } else if (article.entries) {
      article.entries.forEach((subsection, index) => {
        articleSection.appendChild(this.assembleEntry(subsection,
          (index < article.entries.length - 1) ? true : false));
      });
    }

    // Add header and body to container
    container.appendChild(articleHeader);
    container.appendChild(articleSection);

    // Contact panel uses table
    if (article.canShowTable) {
      articleSection.appendChild(this.buildRightDetailsTable());
    }

    return container;
  };

  /**
   * @description Like the similar function
   * <code>inaccessible.buildRightDetailsTable</code> below, this function is
   * used to contruct optional tables containing contact information and the
   * like for convenient display and accessiblity. This particular function
   * makes a legitimate HTML table, much to the author's chagrin. Though there
   * are perhaps more responsive and dynamic means by which this display may be
   * accomplished, the author came to believe this approach represented the
   * cleanest and most readable from a design point of view.
   *
   * @returns {HTMLElement} container
   */
  inaccessible.buildLeftDetailsTable = function () {

    // Declarations
    let details, table, tableAttributes, tbody, keys, newRow, newCell,
      container, containerAttributes, headerAttributes, cellTag, cellAttributes;

    // Alias array (just emails, not wikia or any others)
    details = this.cache.data.details.email;

    // Container (<section>) config
    containerAttributes = {
      class: Classes.LEFT__DETAILS,
    };

    // "Emails" header
    headerAttributes = {
      class: Classes.LEFT__DETAILS_HEADER + ' ' + Classes.LEFT__SUBHEADER +
        ' ' + Classes.DIPTYCH__SUBHEADER,
    };

    // <table> config object
    tableAttributes = {
      class: Classes.LEFT__DETAILS_TABLE,
    };

    // Assemble elements
    table = this.assembleElement(['table', tableAttributes]);
    tbody = document.createElement('tbody');
    container = this.assembleElement(
      ['section', containerAttributes,
        ['h3', headerAttributes,
          Text.EMAIL_ADDRESSES,
        ],
      ],
    );

    // Add to table
    table.appendChild(tbody);

    // Create a new column cell for each header
    for (let i = 0; i < details.length; i++) {
      newRow = tbody.insertRow(i);
      newRow.setAttribute('class', Classes.LEFT__DETAILS_ROW);

      // Temp keys (always 2)
      keys = Object.keys(details[i]);

      for (let j = 0; j < keys.length; j++) {
        newCell = newRow.insertCell(j);
        newCell.setAttribute('class', Classes.LEFT__DETAILS_CELL);

        cellTag = (j % 2 === 0) ? 'span' : 'a';
        cellAttributes = (j % 2 === 0)
          ? {
            class: `${Classes.LEFT__DETAILS_CELL}-title`,
          }
          : {
            class: Classes.LEFT__DETAILS_CELL + '-text ' +
              Classes.GENERAL__BUTTON_LINK + ' ' + Classes.GENERAL__PLAINLINK,
            href: `mailto:${details[i][keys[j]]}`,
          };

        newCell.appendChild(this.assembleElement(
          [cellTag, cellAttributes,
            details[i][keys[j]],
          ],
        ));
      }
    }

    // Add table to container
    container.appendChild(table);

    return container;
  };

  /**
   * @description Like the above function
   * <code>inaccessible.buildLeftDetailsTable</code>, this particular function
   * is used to place optional table-like structures on the right panel (aka
   * <code>article</code>). This is used on the "Contact" scene right panel
   * exclusively at the time of documenting. Unlike the above function however,
   * this function dispenses with the HTML table approach, instead making use of
   * a set of <code>span</code>s inside a list element, with a selector of other
   * elements as well.
   *
   * @returns {HTMLElement} container
   */
  inaccessible.buildRightDetailsTable = function () {

    // Declarations
    let container, list, keys, ulAttributes, rightWrapperAttributes,
      rightHeaderAttributes, details, listAttributes, listTitleAttributes,
      listTextAttributes;

    // Alias details object
    details = this.cache.data.details;

    // List (<ul>) config
    ulAttributes = {
      class: Classes.RIGHT__DETAILS_UL,
    };

    // Wrapper details config
    rightWrapperAttributes = {
      class: Classes.RIGHT__DETAILS,
    };

    // Right subheader config
    rightHeaderAttributes = {
      class: `${Classes.RIGHT__DETAILS_HEADER} ${Classes.DIPTYCH__SUBHEADER}`,
    };

    // List element config
    listAttributes = {
      class: Classes.RIGHT__DETAILS_LI,
    };

    // List element title config
    listTitleAttributes = {
      class: Classes.RIGHT__DETAILS_LI_TITLE,
    };

    // List element text config
    listTextAttributes = {
      class: Classes.RIGHT__DETAILS_LI_TEXT + ' ' +
        Classes.GENERAL__BUTTON_LINK + ' ' + Classes.GENERAL__PLAINLINK,
    };

    // Assemble elements
    list = this.assembleElement(['ul', ulAttributes]);
    container = this.assembleElement(
      ['div', rightWrapperAttributes,
        ['h3', rightHeaderAttributes,
          Text.CONTACT_INFO,
        ],
        list,
      ],
    );

    // Iterate through both arrays in details (email addresses + offsite links)
    for (let array in details) {
      details[array].forEach((object) => {

        // Keys for object in question
        keys = Object.keys(object);

        // Adjust href based on email or website link
        listTextAttributes.href = ((array === 'email') ? 'mailto:' : '') +
          object[keys[1]];

        // Add '_blank' to outbound links, not email buttons
        if (array === 'sites') {
          listTextAttributes.target = Text.LINK_TARGET;
        }

        list.appendChild(this.assembleElement(
          ['li', listAttributes,
            ['span', listTitleAttributes,
              object[keys[0]],
            ],
            ['a', listTextAttributes,
              object[keys[1]],
            ],
          ],
        ));
      });
    }

    // Add listing to container
    container.appendChild(list);

    return container;
  };

  /**
   * @description This builder is unique in that it requires no ancillary JSON
   * data from one of the associated files in order to assemble its collective
   * contents. This interface is displayed only in cases of error, such as in
   * the event that the necessary images or JSON files are unfetchable or
   * unreachable. It basically just replaces the interface with a static message
   * indicating that an error has occurred and encouraging the user to refresh
   * or contact the webmaster via the link included.
   *
   * @param {string} paramError Text "error"
   * @returns {HTMLElement} container
   */
  inaccessible.buildErrorPage = function (paramError) {

    // Declarations
    let containerAttributes, headerAttributes, subheaderAttributes,
      contentAttributes, summaryAttributes, emailAttributes, techAttributes,
      techTitleAttributes, techTextAttributes;

    // Container (<section>) config
    containerAttributes = {
      class: Classes.ERROR,
    };

    // "Ooops" config
    headerAttributes = {
      class: Classes.ERROR__HEADER,
    };

    // Subheader config
    subheaderAttributes = {
      class: Classes.ERROR__SUBHEADER,
    };

    // Text (summary + email link) config
    contentAttributes = {
      class: Classes.ERROR__CONTENT,
    };

    // Text summary config
    summaryAttributes = {
      class: Classes.ERROR__SUMMARY,
    };

    // Webmaster email config
    emailAttributes = {
      class: `${Classes.GENERAL__BUTTON_LINK} ${Classes.GENERAL__PLAINLINK}`,
      href: `mailto:${Text.ERROR_EMAIL}`,
    };

    // If applicable, error wrapper
    techAttributes = {
      class: Classes.ERROR__TECH,
    };

    // Error title
    techTitleAttributes = {
      class: Classes.ERROR__TECH_TITLE,
    };

    // Error code config
    techTextAttributes = {
      class: Classes.ERROR__TECH_TEXT,
    };

    return this.assembleElement(
      ['section', containerAttributes,
        ['h1', headerAttributes,
          Text.ERROR_HEADER,
        ],
        ['h2', subheaderAttributes,
          Text.ERROR_SUBHEADER,
        ],
        ['div', contentAttributes,
          ['div', summaryAttributes,
            Text.ERROR_SUMMARY,
          ],
          ['a', emailAttributes,
            Text.ERROR_EMAIL,
          ],
        ],
        ['div', techAttributes,
          ['span', techTitleAttributes,
            `${this.capitalize(paramError)}: `,
          ],
          ['span', techTextAttributes,
            this.cache.data.error,
          ],
        ],
      ],
    );
  };

  // Handler functions

  /**
   * @description One of three main handler functions used by the application,
   * this function serves as the primary click event listener for all button and
   * link pseudo-buttons in the interface, including the navigation topbar,
   * footer sitemap, and homepage photopanels. Originally a group of similar
   * handlers subsequently consolidated into this single function, the function
   * works by closing any extant mobile hamburger menus, grabbing the JSON data
   * associated with the button pressed. If this data is already extant in the
   * <code>inaccessible.cache</code> object, that property is used to build the
   * requested scene. Otherwise, a GET request is made to grab the data, which
   * is then added to the cache for potential future use.
   * <br />
   * <br />
   * As per the Google styleguide, the use of default parameters in function
   * declarations is permitted in most cases and particularly encouraged for
   * optional parameters that may not actually be defined in certain invocation
   * cases in which the function might be called.
   *
   * @param {object} paramConfig Object containing handler, name, etc.
   * @param {!boolean=} paramCanSwipeRight
   * @returns {void}
   */
  inaccessible.handleButtonClicks = function (paramConfig,
      paramCanSwipeRight = false) {

    // If the hamburger is visible and the menu is open, close menu
    if (
      this.isVisible(`.${Classes.NAV__HAMBURGER}`) &&
      this.isVisible(`.${Classes.NAV__UL}`)
    ) {
      this.handleMenuToggle();
    }

    // Use cached data if extant, otherwise grab new data from json files
    if (this.cache.data.hasOwnProperty(paramConfig.name.toLowerCase())) {
      if (DEBUG) {
        console.log(Text.EXISTS.replace('$1', paramConfig.name));
      }

      this.tinderize(paramCanSwipeRight, Classes.MAIN, paramConfig);
    } else {
      if (DEBUG) {
        console.log(Text.DOES_NOT_EXIST.replace('$1', paramConfig.name));
      }

      this.sendRequest('GET', `json/${paramConfig.name}.json`).then(
          (response) => {

        // Declaration
        let data;

        // Parse the JSON response into a usable object
        data = JSON.parse(response);

        // Check for boolean to ensure loading
        if (data.success) {

          // Add to cache
          this.cache.data = Object.assign(this.cache.data, data.data);

          if (DEBUG) {
            console.log(Text.CACHE_TEXT);
            console.log(this.cache);
          }

          this.tinderize(paramCanSwipeRight, Classes.MAIN, paramConfig);
        }
      }, (error) => {
        this.handleErrors((error.message !== '')
          ? error.message : Text.ERROR_GET);
      });
    }
  };

  /**
   * @description This handler function is used to toggle visible/active classes
   * for the hamburger icon displayed for mobile devices and tablets. In certain
   * contexts, the handler associated with clicks outside the vicinity of the
   * dropdown menu is removed so as to not produce buggy behavior once closed.
   * This is something of a messy approach, but it works as expected and
   * produces the required behavior.
   *
   * @returns {void}
   */
  inaccessible.handleMenuToggle = function () {

    // Declarations
    let hamburger, menu;

    // Definitions
    hamburger = document.querySelector(`.${Classes.NAV__HAMBURGER}`);
    menu = document.querySelector(`.${Classes.NAV__UL}`);

    // Toggle classes
    hamburger.classList.toggle(Classes.GENERAL__ACTIVE);
    menu.classList.toggle(Classes.GENERAL__IS_VISIBLE);

    // Set flag depending on visible status of menu
    this.isMenuOpen = !this.isMenuOpen;

    // Remove outstanding event listener if applicable
    if (this.handleOutsideClicks != null) {
      document.removeEventListener('click', this.handleOutsideClicks);

      if (DEBUG) {
        console.log(Text.LISTENER_REMOVED);
      }
    }
  };

  /**
   * @description This handler function is invoked in cases wherein a
   * <code>GET</code> request made via <code>inaccessible.sendRequest</code> was
   * unsuccessful for some reason. It logs the message for the author and calls
   * <code>inaccessible.tinderize</code> on <code>#content</code>, building the
   * JSON-free <code>inaccessible.buildErrorPage</code> scene and replacing the
   * current contents of the DOM with this interface.
   *
   * @param {string} paramError Error message generated by request
   * @returns {void}
   */
  inaccessible.handleErrors = function (paramError) {
    if (DEBUG) {
      console.warn(paramError);
    }

    // Apply error to script-global cache for external use
    this.cache.data.error = paramError;

    // Replace interface with error scene
    this.tinderize(false, Classes.WRAPPER__CONTENT, {
      name: 'error',
      handler: 'buildErrorPage',
    });
  };

  // Main function

  /**
   * @description This function serves as the <code>init</code> function of the
   * application, overseeing the initial process by which the website is built
   * and displayed to the user. It sets several important "script-globals" to
   * initial predetermined values and requests the <code>data.json<code> file
   * in order to build the header, footer, and homepage. This data is
   * subsequently stored in the <code>inaccessible.cache</code> object for
   * future use.
   *
   * @returns {void}
   */
  inaccessible.main = function () {

    // Declarations
    let data, container;

    // Set menu flag initial value
    this.isMenuOpen = false;

    // Define cache object
    this.cache = {
      data: {},   // Stores JSON data
      pages: {},  // Stores assembled pages
    };

    // Get initial header/footer/home data
    this.sendRequest('GET', 'json/data.json').then((response) => {

      // Parse the JSON response into a usable object
      data = JSON.parse(response);

      if (DEBUG) {
        console.log(data);
      }

      // Check for boolean to ensure loading
      if (data.success) {

        // Add home, header, footer et al. to cache object
        this.cache.data = Object.assign(this.cache.data, data.data);

        // Build the header, footer, and home body
        container = this.buildContainer();

        // Make sure images are loaded prior to fade-in
        this.loadImages(container).then(() => {

          // Add container to body
          document.body.appendChild(container);

          // Begin the fade in
          this.fade('IN', `.${Classes.WRAPPER__CONTAINER}`);
        });
      }
    }, (error) => {
      this.handleErrors((error.message !== '')
        ? error.message : Text.ERROR_GET);
    });
  };

  // Public functions

  /**
   * @description External getter for immutable <code>Utility</code>
   *
   * @returns {enum} Utility
   */
  accessible.getUtility = function () {
    return Object.assign({}, Utility);
  };

  /**
   * @description External getter for immutable <code>Text</code>
   *
   * @returns {enum} Text
   */
  accessible.getText = function () {
    return Object.assign({}, Text);
  };

  /**
   * @description External getter for immutable <code>Classes</code>
   *
   * @returns {enum} Classes
   */
  accessible.getClasses = function () {
    return Object.assign({}, Classes);
  };

  /**
   * @description External getter for immutable <code>Operations</code>
   *
   * @returns {enum} Operations
   */
  accessible.getOperations = function () {
    return Object.assign({}, Operations);
  };

  /**
   * @description The central function of the <code>accessible</code> access
   * scope namespace, <code>init</code> is called on completion of the loading
   * of the HTML <code>body</code> element. This method is presently the only
   * externally accessible function or variable of the module, and simply calls
   * <code>inaccessible.main</code> to get the program started.
   *
   * @returns {void}
   */
  accessible.init = function () {
    inaccessible.main();
  };

  // Return globally-accessible object
  return accessible;
})();