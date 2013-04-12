const TEST_BOOKMARK_DATA =
[{"id":"places","parentName":"","title":"","children":["menu","toolbar","tags","unfiled","mobile"],"type":"folder"},{"id":"menu","parentid":"places","parentName":"","title":"Bookmarks Menu","children":["x-MMaZ2iIm2E","Rpt_3c8ALtPX","a8MBO_X-SG-l","S0cKErf89YfK"],"type":"folder"},{"id":"toolbar","parentid":"places","parentName":"","title":"Bookmarks Toolbar","description":"Add bookmarks to this folder to see them displayed on the Bookmarks Toolbar","children":["1pzDy639sJ8D","A3ghuMeT2pv1","KDj8LPovbHgS","lC72BpPJGVpZ","ARzQFS-X6fEY","1ZLA1XdD0_mT","pWIOD4lM7iEx"],"type":"folder"},{"id":"unfiled","parentid":"places","parentName":"","title":"Unsorted Bookmarks","children":["4ZYFoWVc5qvD"],"type":"folder"},{"id":"mobile","parentid":"places","parentName":"","title":"mobile","children":[],"type":"folder"},{"id":"pWIOD4lM7iEx","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"testFolder","children":["oKiuvqke5BhO","1vrxrnNk3c3h"],"type":"folder"},{"id":"1vrxrnNk3c3h","parentid":"pWIOD4lM7iEx","parentName":"testFolder","title":"innerFolder","children":[],"type":"folder"},{"id":"S0cKErf89YfK","parentid":"menu","parentName":"Bookmarks Menu","title":"Mozilla Firefox","children":["Mzmp5k9gUAAW","KXT2uBHvIIyk","YrG6Cu1rGTvk","GmuNI1NZ8hRe","R6bkPmTfUyEi"],"type":"folder"},{"id":"Mzmp5k9gUAAW","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"Help and Tutorials","bmkUri":"http://www.mozilla.com/en-US/firefox/help/","type":"bookmark","tags":[]},{"id":"KXT2uBHvIIyk","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"Customize Firefox","bmkUri":"http://www.mozilla.com/en-US/firefox/customize/","type":"bookmark","tags":[]},{"id":"GmuNI1NZ8hRe","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"Get Involved","bmkUri":"http://www.mozilla.com/en-US/firefox/community/","type":"bookmark","tags":[]},{"id":"R6bkPmTfUyEi","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","title":"About Us","bmkUri":"http://www.mozilla.com/en-US/about/","type":"bookmark","tags":[]},{"id":"1pzDy639sJ8D","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Most Visited","bmkUri":"place:sort=8&maxResults=10","queryId":"MostVisited","folderName":"Most Visited","type":"query","tags":[]},{"id":"x-MMaZ2iIm2E","parentid":"menu","parentName":"Bookmarks Menu","title":"Recently Bookmarked","bmkUri":"place:folder=BOOKMARKS_MENU&folder=UNFILED_BOOKMARKS&folder=TOOLBAR&queryType=1&sort=12&maxResults=10&excludeQueries=1","queryId":"RecentlyBookmarked","folderName":"Recently Bookmarked","type":"query","tags":[]},{"id":"Rpt_3c8ALtPX","parentid":"menu","parentName":"Bookmarks Menu","title":"Recent Tags","bmkUri":"place:type=6&sort=14&maxResults=10","queryId":"RecentTags","folderName":"Recent Tags","type":"query","tags":[]},{"id":"a8MBO_X-SG-l","parentid":"menu","parentName":"Bookmarks Menu","pos":2,"type":"separator"},{"id":"A3ghuMeT2pv1","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Yahoo!","bmkUri":"http://www.yahoo.com/","keyword":"yahoo","type":"bookmark","tags":["tagBar, tagFoo1"]},{"id":"KDj8LPovbHgS","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Google","bmkUri":"https://www.google.com/","loadInSidebar":true,"type":"bookmark","tags":["tagFoo2"]},{"id":"oKiuvqke5BhO","parentid":"pWIOD4lM7iEx","parentName":"testFolder","title":"Hulu.comff","bmkUri":"http://www.hulu.com/","type":"bookmark","tags":["tagBar2"]},{"id":"lC72BpPJGVpZ","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"CNN.com","bmkUri":"http://www.cnn.com/","type":"bookmark","tags":[]},{"id":"ARzQFS-X6fEY","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Facebook","bmkUri":"https://www.facebook.com/","type":"bookmark","tags":[]},{"id":"1ZLA1XdD0_mT","parentid":"toolbar","parentName":"Bookmarks Toolbar","title":"Lifehacker","feedUri":"http://feeds.gawker.com/lifehacker/full","siteUri":"http://lifehacker.com/","type":"livemark"},{"id":"4ZYFoWVc5qvD","parentid":"unfiled","parentName":"Unsorted Bookmarks","title":"Bank of America | Home | Personal","bmkUri":"https://www.bankofamerica.com/","description":"Welcome to Bank of America, the nation's leading financial institution and home for all of your personal financial needs.","type":"bookmark","tags":[]},{"id":"YrG6Cu1rGTvk","parentid":"S0cKErf89YfK","parentName":"Mozilla Firefox","pos":2,"type":"separator"}];

const TEST_HISTORY_DATA = [{"id":"Rteu_8bSzsu-","histUri":"http://www.yahoo.com/","title":"Yahoo!","visits":[{"date":1364508786962237,"type":2},{"date":1364508655983735,"type":2},{"date":1364507735575566,"type":2},{"date":1364409386351025,"type":2},{"date":1364409133964348,"type":2},{"date":1364409066776950,"type":2},{"date":1364409028974313,"type":2},{"date":1364407987076642,"type":2},{"date":1364407856297752,"type":2},{"date":1364407474346944,"type":2}]},{"id":"uuIs1Gngazgf","histUri":"http://www.cnn.com/","title":"CNN.com - Breaking News, U.S., World, Weather, Entertainment & Video News","visits":[{"date":1364508789897813,"type":2},{"date":1364508678698080,"type":2},{"date":1364413787097330,"type":2},{"date":1364413546153728,"type":2},{"date":1364412643394396,"type":5}]},{"id":"NGvYuJXUWHuQ","histUri":"http://www.google.com/","title":"Google","visits":[{"date":1363995032509156,"type":2},{"date":1363994791894501,"type":2},{"date":1363994634393875,"type":2},{"date":1363992920672992,"type":2},{"date":1363990043491779,"type":2},{"date":1363975767828883,"type":2}]},{"id":"weXjxyHqOjaO","histUri":"https://github.com/","title":"GitHub � Build software better, together.","visits":[{"date":1364508797615514,"type":2},{"date":1364508660884675,"type":2},{"date":1364410463050663,"type":1},{"date":1364410458139080,"type":1},{"date":1364410400857231,"type":2},{"date":1364409079824305,"type":5}]},{"id":"Ddu_YCGlnHk8","histUri":"https://www.google.com/","title":"Google","visits":[{"date":1364426076311646,"type":2},{"date":1364413869176487,"type":2},{"date":1364410395472206,"type":2},{"date":1364409093913464,"type":2},{"date":1363988372024298,"type":3}]},{"id":"bzVdAjFRlHsM","histUri":"https://www.facebook.com/","title":"Welcome to Facebook - Log In, Sign Up or Learn More","visits":[{"date":1364580869985833,"type":2},{"date":1364510614399753,"type":2},{"date":1363977872837222,"type":2},{"date":1363977244847628,"type":5}]},{"id":"0XmdhPZzIW4L","histUri":"https://login.persona.org/","title":"Mozilla Persona: A Better Way to Sign In","visits":[{"date":1364410898832315,"type":2},{"date":1364410403672880,"type":2},{"date":1363994565642163,"type":2}]},{"id":"7-oC9En_HCGh","histUri":"http://github.com/","title":"","visits":[{"date":1364409078164260,"type":2}]},{"id":"N_g-wEXkmKiL","histUri":"http://cnn.com/","title":"","visits":[{"date":1364412643217252,"type":2}]},{"id":"OBgE0aPt5UV5","histUri":"http://facebook.com/","title":"","visits":[{"date":1363977243912067,"type":2}]},{"id":"0rh84SQg3HYW","histUri":"https://facebook.com/","title":"","visits":[{"date":1363977244330127,"type":6}]},{"id":"4or9j64gMmPr","histUri":"http://yahoo.com/","title":"","visits":[{"date":1363975804373275,"type":2}]},{"id":"JvcW0dk2Qyg-","histUri":"http://www.mozilla.org/projects/firefox/22.0a1/whatsnew/?oldversion=20.0","title":"","visits":[{"date":1364598491263569,"type":1},{"date":1364506593612526,"type":1},{"date":1364429647277952,"type":1},{"date":1364421827099916,"type":1},{"date":1364419488225043,"type":1}]},{"id":"EOEH90mEtq3r","histUri":"http://www.mozilla.org/firefox/22.0a1/whatsnew/?oldversion=20.0","title":"","visits":[{"date":1364598491286989,"type":5},{"date":1364506593675186,"type":5},{"date":1364429647341592,"type":5},{"date":1364421827164075,"type":5},{"date":1364419488443129,"type":5}]},{"id":"MxInG-KBWJwk","histUri":"http://www.mozilla.com/en-US/firefox/20.0/whatsnew/?oldversion=22.0a1","title":"","visits":[{"date":1364597980742047,"type":1},{"date":1364430758303062,"type":1},{"date":1364430733653966,"type":1},{"date":1364426569885869,"type":1}]},{"id":"NWVHsjGokilg","histUri":"http://www.mozilla.org/en-US/firefox/20.0/whatsnew/?oldversion=22.0a1","title":"Welcome to Firefox","visits":[{"date":1364597980762620,"type":5},{"date":1364430758377085,"type":5},{"date":1364430733794311,"type":5},{"date":1364426569976344,"type":5}]},{"id":"OYcgnEnZPdKG","histUri":"https://accounts.google.com/ServiceLogin?hl=en&continue=http://www.google.com/","title":"Google Accounts","visits":[{"date":1363995034789714,"type":1},{"date":1363994793761491,"type":1},{"date":1363994636680252,"type":1}]},{"id":"C7L_dBcROyNB","histUri":"https://www.google.com/search?q=firebug&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta","title":"firebug - Google Search","visits":[{"date":1364342865857314,"type":1},{"date":1364342471229858,"type":1}]},{"id":"QON4P2Ggn4_4","histUri":"http://getfirebug.com/","title":"Firebug","visits":[{"date":1364342867995994,"type":1},{"date":1364342474023094,"type":1}]},{"id":"VZiPvI32Rvrf","histUri":"https://getfirebug.com/downloads/","title":"Download Firebug : Firebug","visits":[{"date":1364342870454793,"type":1},{"date":1364342476153345,"type":1}]},{"id":"mizDGiJCsjA-","histUri":"https://addons.mozilla.org/firefox/addon/firebug/","title":"","visits":[{"date":1364342872499232,"type":1},{"date":1364342481472377,"type":1}]},{"id":"yuGDyR3BTfWQ","histUri":"https://addons.mozilla.org/en-US/firefox/addon/firebug/","title":"Firebug :: Add-ons for Firefox","visits":[{"date":1364342873170130,"type":5},{"date":1364342481746526,"type":5}]},{"id":"YuFywc3iiYZM","histUri":"http://www.mozilla.com/en-US/firefox/21.0/whatsnew/?oldversion=22.0a1","title":"","visits":[{"date":1365464073539237,"type":1}]},{"id":"c1jKQjd1FAAm","histUri":"https://www.google.com/search?q=amazon+drop+box&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:unofficial&client=firefox-a&channel=fflb","title":"amazon drop box - Google Search","visits":[{"date":1364510901509993,"type":1}]},{"id":"fz-qeFWee7sP","histUri":"https://www.google.com/search?q=amazon+drop+box&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:unofficial&client=firefox-a&channel=fflb#hl=en&gs_rn=7&gs_ri=psy-ab&pq=amazon%20drop%20box&cp=13&gs_id=2z&xhr=t&q=amazon+lock+box&es_nrs=true&pf=p&client=firefox-a&hs=A2M&rls=org.mozilla:en-US%3Aunofficial&channel=fflb&sclient=psy-ab&oq=amazon+lock+b&gs_l=&pbx=1&bav=on.2,or.r_qf.&bvm=bv.44442042,d.cGE&fp=22e7df0df3724204&biw=1216&bih=738","title":"amazon lock box - Google Search","visits":[{"date":1364510917039996,"type":1}]},{"id":"RXrqV1mvI67X","histUri":"https://www.google.com/search?q=amazon+drop+box&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:unofficial&client=firefox-a&channel=fflb#hl=en&client=firefox-a&hs=A2M&rls=org.mozilla:en-US%3Aunofficial&channel=fflb&sclient=psy-ab&q=amazon+locker&oq=amazon+locker&gs_l=serp.3..0l4.9210.9646.3.9780.4.2.0.2.2.0.46.86.2.2.0...0.0...1c.1.7.psy-ab.j54eY08diP0&pbx=1&bav=on.2,or.r_qf.&bvm=bv.44442042,d.cGE&fp=22e7df0df3724204&biw=1216&bih=738","title":"amazon locker - Google Search","visits":[{"date":1364510929235250,"type":1}]},{"id":"JeZtAy84QHp9","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CC8QFjAA&url=http%3A%2F%2Fwww.amazon.com%2Fgp%2Fhelp%2Fcustomer%2Fdisplay.html%2F%3FnodeId%3D200689010&ei=0chUUfXBMKWVjAK854DIBA&usg=AFQjCNGwsgRGpNkbJPY3sLJ6Eg-svBSWIg&bvm=bv.44442042,d.cGE","title":"","visits":[{"date":1364510930859050,"type":1}]},{"id":"z3sjAsWEwj87","histUri":"http://www.amazon.com/gp/help/customer/display.html/?nodeId=200689010","title":"Amazon.com Help: Amazon Locker","visits":[{"date":1364510931302918,"type":1}]},{"id":"mauTm4K2KpVX","histUri":"http://www.amazon.com/gp/help/customer/display.html/?nodeId=201117850","title":"Amazon.com Help: Find an Amazon Locker in Your Area","visits":[{"date":1364510934193963,"type":1}]},{"id":"_44iCgcuSP0E","histUri":"https://www.amazon.com/gp/css/account/address/view.html?ref_=amb_link_365825242_1&viewID=searchStores","title":"","visits":[{"date":1364510942858023,"type":1}]},{"id":"rQqnop4Vvigo","histUri":"https://www.amazon.com/ap/signin?_encoding=UTF8&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=900&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fcss%2Faccount%2Faddress%2Fview.html%3Fie%3DUTF8%26ref_%3Damb_link_365825242_1%26viewID%3DsearchStores","title":"Amazon.com Sign In","visits":[{"date":1364510942993888,"type":6}]},{"id":"1rUuelKUNCrN","histUri":"https://www.amazon.com/gp/css/account/address/view.html?ie=UTF8&ref_=amb_link_365825242_1&viewID=searchStores&","title":"Your Account","visits":[{"date":1364510959811660,"type":1}]},{"id":"KFN-wwTOZcHo","histUri":"http://www.cnn.com/?refresh=1","title":"CNN.com - Breaking News, U.S., World, Weather, Entertainment & Video News","visits":[{"date":1364512387798967,"type":1}]},{"id":"x6igauEJnGZT","histUri":"https://www.google.com/search?q=salt+cod+cazuela&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta","title":"salt cod cazuela - Google Search","visits":[{"date":1364347473009684,"type":1}]},{"id":"CaqqdRk7LNUp","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDIQFjAA&url=http%3A%2F%2Fspanishfood.about.com%2Fod%2Ftapas%2Fr%2Fcazuelabacalao.htm&ei=UUpSUeeOEYHhiAKHhYG4BQ&usg=AFQjCNFBmTB1ywoXqnDXxfjG_DV4wlXFUw&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364347477634695,"type":1}]},{"id":"a0BiEHywqAy4","histUri":"http://spanishfood.about.com/od/tapas/r/cazuelabacalao.htm","title":"Cazuelitas de Bacalao Tapa Recipe - Salt Cod and Potato Spread Recipe - Tapas Recipes","visits":[{"date":1364347477773483,"type":1}]},{"id":"tTdB-eT4fBkJ","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&ved=0CEQQFjAB&url=http%3A%2F%2Fwww.thenetcave.com%2Frecipe-baccala.html&ei=UUpSUeeOEYHhiAKHhYG4BQ&usg=AFQjCNGP43mbJVOl7pZ1aUFJyodhlZeCkA&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364347545117339,"type":1}]},{"id":"JMzxgz8CSCxT","histUri":"http://www.thenetcave.com/recipe-baccala.html","title":"Baccala (Salt Cod) Brandade","visits":[{"date":1364347545437737,"type":1}]},{"id":"7d7UVlZ5DOgh","histUri":"https://www.google.com/search?q=light+gray&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta&channel=fflb","title":"light gray - Google Search","visits":[{"date":1364348883622966,"type":1}]},{"id":"mPQKB_Z-Mv8J","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDIQFjAA&url=http%3A%2F%2Fwww.w3schools.com%2Ftags%2Fref_color_tryit.asp%3Fcolor%3DLightGray&ei=009SUdmoNKnWiwLDuYCQBg&usg=AFQjCNFI3kHarwVpAWcJrJHgsfWfi1KbmA&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364348886753594,"type":1}]},{"id":"kDybWYxiJ7FJ","histUri":"http://www.w3schools.com/tags/ref_color_tryit.asp?color=LightGray","title":"W3Schools Color Test. Background=LightGray","visits":[{"date":1364348886945275,"type":1}]},{"id":"sutgBX7yQhCl","histUri":"https://www.google.com/search?q=globe+favicon&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta&channel=fflb","title":"globe favicon - Google Search","visits":[{"date":1364351197876090,"type":1}]},{"id":"WUTHFypClMva","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDIQFjAA&url=http%3A%2F%2Fwww.favicon.cc%2F%3Faction%3Dicon_list%26tag_id%3D966&ei=3lhSUaa6BIOgiAKGlYDgAg&usg=AFQjCNFhHrsprmERxryxzDg9A4TsM1abGA&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364351201423195,"type":1}]},{"id":"G14a0GiHhqyh","histUri":"http://www.favicon.cc/?action=icon_list&tag_id=966","title":"Icons with Tag globe - favicon.ico Generator","visits":[{"date":1364351202172394,"type":1}]},{"id":"dPFWcZvlvBii","histUri":"https://www.google.com/search?q=globe+favicon&hl=en&client=firefox-beta&hs=yTh&rls=org.mozilla:en-US:official&channel=fflb&tbm=isch&tbo=u&source=univ&sa=X&ei=3lhSUaa6BIOgiAKGlYDgAg&ved=0CDwQsAQ&biw=1216&bih=728","title":"globe favicon - Google Search","visits":[{"date":1364351230439573,"type":1}]},{"id":"2lSOE5XGa-zg","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=9&ved=0CFMQFjAI&url=http%3A%2F%2Ffindicons.com%2Fsearch%2Fglobe-favicon%2F8&ei=3lhSUaa6BIOgiAKGlYDgAg&usg=AFQjCNGIaRW2r4yHimDRlCBhT4OGLs9rLQ&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364351254228093,"type":1}]},{"id":"XlScgvNZK-LF","histUri":"http://findicons.com/search/globe-favicon/8","title":"Globe Favicon Icons - Download 389 Free Globe Favicon Icon (Page 8)","visits":[{"date":1364351254621965,"type":1}]},{"id":"v6GBmEW-uhe7","histUri":"http://hsrd.yahoo.com/_ylt=AjOy0Z0z4QZAdYw85mxuRyGbvZx4;_ylc=X3oDMTZoaDAwNnZrBF9TAzIwMjM1MzgwNzUEYQMxMzAzMjYgc3BvcnRzIGdyaW5kdHYga2VsbHkgbGlvbiBidgRjY29kZQNzbGluZ3N0b25lBGNwb3MDMwRlZAMxBGcDaWQtMzE0MzQ0MwRpbnRsA3VzBGl0YwMwBGx0eHQDR2lmZm9yZHMmIzM5O3NodWJieWluc2Fkc2NlbmUEcGtndgM4BHBvcwMwBHNlYwN0ZC1mZWEEc2xrA3RodW1ibGluawR0YXIDd3d3LmdyaW5kdHYuY29tBHRlc3QDOTAw/RV=1/RE=1365617073/RH=aHNyZC55YWhvby5jb20-/RO=2/RU=aHR0cDovL3d3dy5ncmluZHR2LmNvbS9vdXRkb29yL25hdHVyZS9wb3N0L2dhYnJpZWxsZS1naWZmb3Jkcy1odXNiYW5kLWF0LWNlbnRlci1vZi1iaXphcnJlLXNjZW5lLWludm9sdmluZy1idWxsZG9nLWFuZC1zZWEtbGlvbi1wdXAv/RS=%5EADAPrR.CVs1A95XAiAc3dh6LLHM0Z4-","title":"","visits":[{"date":1364407522794117,"type":1}]},{"id":"PT3AgQUt_PST","histUri":"http://www.grindtv.com/outdoor/nature/post/gabrielle-giffords-husband-at-center-of-bizarre-scene-involving-bulldog-and-sea-lion-pup/","title":"Gabrielle Giffords' husband pulls dog away from sea lion it had killed","visits":[{"date":1364407522843066,"type":5}]},{"id":"fEgc0NEVE_8l","histUri":"http://hsrd.yahoo.com/_ylt=AjOy0Z0z4QZAdYw85mxuRyGbvZx4;_ylc=X3oDMTZlZmtscmFvBF9TAzIwMjM1MzgwNzUEYQMxMzAzMjYgaG9tZXMgeW91bmcgaG9tZWJ1eWVyIHJlZ3JldHMgdARjY29kZQNzbGluZ3N0b25lBGNwb3MDNARlZAMxBGcDaWQtMzE0MzI1OARpbnRsA3VzBGl0YwMwBGx0eHQDUmVncmV0c29meW91bmdob21lYnV5ZXIEcGtndgM3BHBvcwMwBHNlYwN0ZC1mZWEEc2xrA3RodW1ibGluawR0YXIDaG9tZXMueWFob28uY29tBHRlc3QDOTAw/RV=1/RE=1365617073/RH=aHNyZC55YWhvby5jb20-/RO=2/RU=aHR0cDovL2hvbWVzLnlhaG9vLmNvbS9ibG9ncy9zcGFjZXMvc2hlLWJvdWdodC1ob3VzZS0yMS13aHktc2hlLXJlZ3JldHMtMDgxMzQzOTkyLmh0bWw-/RS=%5EADAIEfN5gAZIUBARfkcO22BTZbjE6E-","title":"","visits":[{"date":1364407523615322,"type":1}]},{"id":"_CCu3RobqNNe","histUri":"http://homes.yahoo.com/blogs/spaces/she-bought-house-21-why-she-regrets-081343992.html","title":"How she bought a house at 21, and why she regrets it | Spaces - Yahoo! Homes","visits":[{"date":1364407523968575,"type":5}]},{"id":"ug1XnpZIWxiS","histUri":"https://www.google.com/search?q=alert+from+jetpack&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta&channel=fflb","title":"alert from jetpack - Google Search","visits":[{"date":1364411375298665,"type":1}]},{"id":"2tUiKCR2CsYJ","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDIQFjAA&url=http%3A%2F%2Fgroups.google.com%2Fgroup%2Fmozilla-labs-jetpack%2Fbrowse_thread%2Fthread%2F88932ed3d8aef9bf&ei=7kNTUeB4qZyJAp-UgIgC&usg=AFQjCNEg7W2mSB1dp0-b8nJC-7TtnrEWxA&bvm=bv.44442042,d.cGE","title":"","visits":[{"date":1364411379894211,"type":1}]},{"id":"7-vuFbMYSi3p","histUri":"http://groups.google.com/group/mozilla-labs-jetpack/browse_thread/thread/88932ed3d8aef9bf","title":"","visits":[{"date":1364411380037654,"type":1}]},{"id":"UeEIqFpjfeMK","histUri":"http://groups.google.com/d/topic/mozilla-labs-jetpack/iJMu09iu-b8?fromgroups","title":"","visits":[{"date":1364411380070050,"type":6}]},{"id":"SyM_MGMoF8dx","histUri":"https://groups.google.com/forum/?fromgroups=#!topic/mozilla-labs-jetpack/iJMu09iu-b8","title":"alert(\"asdf\"); - Google Groups","visits":[{"date":1364411382119588,"type":1}]},{"id":"fexYroFJP3Z0","histUri":"https://www.google.com/search?q=alert+from+jetpack&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta&channel=fflb#hl=en&client=firefox-beta&hs=dTc&rls=org.mozilla:en-US%3Aofficial&channel=fflb&sclient=psy-ab&q=jetpack+sdk&oq=jetpack+sdk&gs_l=serp.3..0j0i22i30l3.22260.23849.0.24024.15.12.2.0.0.0.172.1321.6j6.12.0...0.0...1c.1.7.psy-ab.sZp1udNXn9g&pbx=1&bav=on.2,or.r_qf.&bvm=bv.44442042,d.cGE&fp=22e7df0df3724204&biw=1216&bih=728","title":"jetpack sdk - Google Search","visits":[{"date":1364411399769136,"type":1}]},{"id":"XedpMxALBZE1","histUri":"https://addons.mozilla.org/en-US/developers/docs/sdk/latest/","title":"Add-on SDK Documentation","visits":[{"date":1364411401923122,"type":1}]},{"id":"ynjCVLbl6htn","histUri":"https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/notifications.html","title":"notifications - Add-on SDK Documentation","visits":[{"date":1364411404672900,"type":1}]},{"id":"RiuW69eYelse","histUri":"https://www.google.com/search?q=component+utils+import&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-beta&channel=fflb","title":"component utils import - Google Search","visits":[{"date":1364421625760243,"type":1}]},{"id":"829i-5lxA7ox","histUri":"https://developer.mozilla.org/en-US/docs/Componenss.utils.import","title":"Componenss.utils.import | MDN","visits":[{"date":1364421628133456,"type":1}]},{"id":"Aa67NHcswBJF","histUri":"http://mxr.mozilla.org/mozilla-central/source/js/xpconnect/idl/xpccomponents.idl","title":"mozilla-central mozilla/js/xpconnect/idl/xpccomponents.idl","visits":[{"date":1364421673184993,"type":1}]},{"id":"ZhXzHZrPRSo3","histUri":"https://www.google.com/search?q=data+urls+firefox+nightly&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:unofficial&client=firefox-a&channel=fflb","title":"data urls firefox nightly - Google Search","visits":[{"date":1364507210338617,"type":1}]},{"id":"5raHqWDEZbFP","histUri":"https://bugzilla.mozilla.org/show_bug.cgi?id=840594","title":"840594  Base64 encoded font in data URI within @font-face is ignored when browsing over HTTPS","visits":[{"date":1364507221794970,"type":1}]},{"id":"uEeA9Vdk6UVs","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDIQFjAA&url=http%3A%2F%2Fgetfirebug.com%2F&ei=xzZSUcO-JOGjigKuqoH4Ag&usg=AFQjCNGT1rhhsYGPQx5Vr5A8RvhIgdSp9g&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364342473855808,"type":1}]},{"id":"WmTqd4H1YPXx","histUri":"https://getfirebug.com/firstrun#Firebug%201.11.2","title":"Firebug","visits":[{"date":1364342489655522,"type":1}]},{"id":"IBQTSfQNR7NU","histUri":"http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDIQFjAA&url=http%3A%2F%2Fgetfirebug.com%2F&ei=UjhSUeqMDcifiQKY6YCQDQ&usg=AFQjCNGT1rhhsYGPQx5Vr5A8RvhIgdSp9g&bvm=bv.44342787,d.cGE","title":"","visits":[{"date":1364342867971245,"type":1}]},{"id":"c4S8sw1d8kFm","histUri":"https://getfirebug.com/","title":"Firebug","visits":[{"date":1364342868404782,"type":5}]},{"id":"j3G17Vkp1Rc9","histUri":"http://findicons.com/icon/download/89201/globe/128/ico?id=358267","title":"globe.ico","visits":[{"date":1364351290357323,"type":7}]},{"id":"vIROq4mP7qCh","histUri":"https://groups.google.com/d/topic/mozilla-labs-jetpack/iJMu09iu-b8?fromgroups","title":"","visits":[{"date":1364411380198478,"type":6}]},{"id":"1dFzQ579iegq","histUri":"https://groups.google.com/forum/?fromgroups#!topic/mozilla-labs-jetpack/iJMu09iu-b8","title":"Google Groups","visits":[{"date":1364411380335561,"type":6}]},{"id":"aGjYWGndnN6h","histUri":"http://www.mozilla.org/en-US/firefox/22.0a1/whatsnew/?oldversion=20.0","title":"Welcome to Firefox","visits":[{"date":1364598491394041,"type":5},{"date":1364506593787237,"type":5},{"date":1364429647446971,"type":5},{"date":1364421827268720,"type":5},{"date":1364419488558439,"type":5}]}];

module.exports = {
  TEST_BOOKMARK_DATA: TEST_BOOKMARK_DATA,
  TEST_HISTORY_DATA: TEST_HISTORY_DATA
};