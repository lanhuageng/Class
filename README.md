##Class.js是干什么的？
  Class.js是简单的JavaScript类构建器，异步的类加载器
##Class.js有哪些功能？

* 支持类的继承
* 开发时，一个文件一个类存放，方便维护。发布时可使用流行的第三方插件将自定义类压缩合并为一个js加载，提高web加载效率
* 不依赖任何js插件，可单独存在，亦可与任何第三方js插件混用

##有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(lanhuageng@126.com)

## 简易API

暂无

##使用案例

文件/index.html
```html
<html>
  <head>
  <script type="text/javascript" src="js/Class.js"></script>
  </head>
  <body>
  <script type="text/javascript">
    Class.config({
      debug : true,
      com : "js/test"
    });
    // 在加载com.Person时会自动加载com.Base
    Class.ready("com.Person",function() {
      var person = Class.create("com.Person", "lisi");
      person.say();
      person.test();
    });
  </script>
  </body>
</html>
```

输出:
com.Base initialize finish.
lisi, hello.
base.test



文件/js/test/Person.js
```javascript
Class("com.Person", "com.Base", {
  constructor : function(name){
    this.name = name || "zhangsan";
  },
  say : function(){
    console.log(this.name + ", hello.");
  }
});
```

文件/js/test/Base.js
```javascript
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
```
