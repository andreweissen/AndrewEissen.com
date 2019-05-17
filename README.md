### AndrewEissen.com, v.3 ###

#### Overview ####

This repository contains the production code for the third iteration of the [author's website](https://andreweissen.com). Unlike the previous two versions, both of which made use of a multiplicity of external dependencies like Bootstrap, this version of the portfolio site was constructed without the aid of any ancillary frameworks or libaries. All code included herein was handcrafted by the author in pure ES6 JavaScript, CSS3, and HTML5, following Google's "Mobile First" approach and responsive design and content portability best practices.

The HTML of the site is dynamically generated on the fly by the JavaScript application file `app.js`, with assembled "scenes" cached for reuse in the event that the user wishes to revisit a scene via the button links and image panels. Data related to the information displayed in each scene is stored in a set of JSON files fetched and cached whenever the user views a new scene on the site.

The efficient and easily maintained nature of the site lends itself well to reuse and repair as needed. Unlike the previous two iterations of the site, this version's heavy use of specialized assembly and builder functions in conjunction with JSON files allows the author to easily update information, adjust entries, and perform general maintenance with ease.

#### Resources ####
* [Markdown syntax cheatsheet](https://github.com/tchapi/markdown-cheatsheet/blob/master/README.md)
* [JS Google Styleguide #1](https://google.github.io/styleguide/jsguide.html)
* [JS Google Styleguide #2](https://google.github.io/styleguide/javascriptguide.xml)
* [GitHub Square icon](https://fontawesome.com/icons/github-square?style=brands)
* [LinkedIn icon](https://fontawesome.com/icons/linkedin?style=brands)

#### Acknowledgments ####
The [GitHub](https://fontawesome.com/icons/github-square?style=brands) and [LinkedIn](https://fontawesome.com/icons/linkedin?style=brands) icons downloaded from [Font Awesome](https://fontawesome.com) are licensed in accordance with the terms of the [Creative Commons Attribution 4.0 International license](https://fontawesome.com/license). Changes made to these SVG files include a recoloring of the `fill` property to better suit the prevailing color scheme of the site.