if (Meteor.isClient) {
  var routePath = "https://js.arcgis.com/4.0beta1",
    routeLoaded = false,
    loadHandler = function() {
      routeLoaded = true;
    };

  Router.route('/', {
    verbose: true,
    name: 'home',
    template: 'ArcGIS',
    controller: PreloadController,
    preload: {
      timeOut: 5000,
      styles: ['https://js.arcgis.com/4.0beta1/esri/css/esri.css', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css'],
      sync: routePath,
      onBeforeSync: function(fileName) {
        if (fileName === routePath) {
          var script = document.createElement('script');
          script.rel = 'preload javascript';
          script.type = 'text/javascript';
          script.src = routePath;
          script.onload = loadHandler;
          document.body.appendChild(script);
          return false;
        }
      },
      onSync: function(fileName) {
        if (routeLoaded && fileName === routePath) {
          return !!require && !!define;
        }
      },
      onAfterSync: function(fileName) {
        return false;
      }
    }
  });

  Template.ArcGIS.rendered = function() {

    //var map, view;
    var map, mapView, sceneView, searchWidget, activeView;


    if (routeLoaded) {
      var isMobile = false;
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        isMobile = true;
      }

      require(["esri/Map",
        "esri/views/SceneView",
        "esri/views/MapView",
        "esri/Basemap",
        "esri/widgets/Search",
        "esri/core/watchUtils",
        "dojo/domReady!"
      ], function(Map, SceneView, MapView, Basemap, Search, watchUtils) {

        // Map
        map = new Map({
          basemap: "streets"
        });

        // Map View
        mapView = new MapView({
          container: "mapViewDiv",
          map: map,
          center: [-40, 40],
          zoom: 3
        });

        activeView = mapView;

        // Scene View
        sceneView = new SceneView({
          container: "sceneViewDiv",
          map: map,
          center: [-40, 40],
          zoom: 3
        });

        // Search
        searchWidget = new Search({
          view: activeView,
          //showPopupOnSelect: false,
          enableHighlight: false
        }, "searchDiv");
        searchWidget.startup();

        // Set active view
        searchWidget.watch(function(property, oldValue, newValue) {
          if (property === "searchResults") {
            searchWidget.view = activeView;
          }
        });

        //THIS SECTION MOVED TO BE HANDLED BY METEOR
           // Use jQuery here for UI handlers, can also use dojoBootstrap (http://xsokev.github.io/Dojo-Bootstrap/index.html)
           $(document).ready(function(){

             // View change
             $("li a[data-toggle='tab']").click(function(e) {
               switch (e.target.text) {
                 case "Map":
                   activeView = mapView;
                 case "Scene":
                   activeView = sceneView;
               }
             });
             // Basemap change
             $("#basemapsDropdown li").click(function(e) {
               switch (e.target.text) {
                 case "Streets":
                   map.basemap = "streets";
                   break;
                 case "Satellite":
                   map.basemap = "satellite";
                   break;
                 case "National Geographic":
                   map.basemap = "national-geographic";
                   break;
                 case "Topographic":
                   map.basemap = "topo";
                   break;
                 case "Gray":
                   map.basemap = "gray";
                   break;
                 case "Dark Gray":
                   map.basemap = "dark-gray";
                   break;
                 case "Open Street Map":
                   map.basemap = "osm";
                   break;
               }
             });

             // Tooltips toggle
             if (!isMobile) {
               $('[data-toggle="tooltip"]').tooltip({ delay: { "show": 100, "hide": 100 }, trigger: "hover"});
               $(window).resize(function(){
                 setTips();
               });
               function setTips() {
                 if ($(window).width() <= 767) {
                   $('[data-toggle="tooltip"]').tooltip('disable');
                 } else {
                   $('[data-toggle="tooltip"]').tooltip('enable');
                 }
               }
               setTips();
             }

             // Limited to 2D on mobile devices, no need for tabs
             if (isMobile) {
               $("a[aria-controls='2Dtab'], a[aria-controls='3Dtab']").addClass("hidden");
             }

           });<!-- jQuery -->

      }); <!-- dojo -->
    }
  };
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
