Class("com.Base", {
  test : function(){
    console.log("base.test");
  },
  statics : {
    initialize : function(){
      console.log(this._className + " initialize finish.");
    }
  }
});
