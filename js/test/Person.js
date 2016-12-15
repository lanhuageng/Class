Class("com.Person", "com.Base", {
  constructor : function(name) {
    this.name = name || "zhangsan";
  },
  say : function(){
    console.log(this.name + ", hello.");
  }
});
