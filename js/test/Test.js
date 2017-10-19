JClass("com.Test", "stalk.View", {
  events : {
    "click #btnTest" : "doTest"
  },
  doTest : function(e) {
    alert(this.$("input:text").val());
  }
});
