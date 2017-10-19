JClass("stalk.View", {
  imports : [ "stalk.Log" ],
  constructor : function() {
	var me = this, log = JClass.getClass("stalk.Log");
	var $el = $(me.el || document.body);
	var events = me.events || {};
    if ($.isPlainObject(events)) {
      var key, temp;
      for (key in events) {
        temp = key.split(/[ \t]+/);
        if (temp.length >= 2) {
          var fn = me[events[key]];
          if (fn) {
			var event = temp[0], selector = key.substr(event.length + 1);
			var bfn = function(){
				fn.apply(me, arguments);
			};
			if ($el.on) {
		      $el.on(event, selector, bfn);
			} else {
			  $el.find(selector).live(event, bfn);
			}
            continue;
          }
        }
        log.warn("Skip with :" + key);
      }
	}
	me.initialize();
  },
  $ : function(selector) {
    var $el = $(this.el || document.body);
	return $el.find(selector);
  },
  initialize : function() {
	// TODO
  },
  statics : {
    initialize : function() {
		if (!window["jQuery"] && !window["$"]) {
			JClass.getClass("stalk.Log").error("no require js:jQuery");
		}
    }
  }
});
