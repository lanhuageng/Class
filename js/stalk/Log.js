JClass("stalk.Log", {
  statics : {
	// setting
	show : {
	  info : true,
	  warn : true,
	  error : true
	},
	info : function(msg) {
      if (this.show.info) {
		console.info(msg);
	  }
	},
	warn : function(msg) {
      if (this.show.warn) {
		console.warn(msg);
	  }
	},
	error : function(msg) {
      if (this.show.error) {
		console.error(msg);
	  }
	}
  }
});
