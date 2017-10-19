## 更新说明
* 2017-10-19 增加stalk.Log和stalk.View，日志与视图，其中视图用到jquery


## JClass.js是干什么的？
  JClass.js是简单的JavaScript类构建器，异步的类加载器


## JClass.js有哪些功能？
* 支持类的继承
* 开发时，一个文件一个类存放，方便维护。发布时可使用流行的第三方插件将自定义类压缩合并为一个js加载，提高web加载效率
* 不依赖任何js插件，可单独存在，亦可与任何第三方js插件混用


## 有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(lanhuageng@126.com)


## 简单实用

* 在head或body引用JClass.js，并使用JClassConfig初始化它

```javascript
JClassConfig({
  alias : "Class", // my js中全局使用的别名，可用数组设置多个，必定设置别名JClass
  debug : true, // 调试，为true时自动根据类名加载；为false时，需要手动加载
  global : window, // 全局变量挂载处
  stalk : "js/stalk", // stalk包对应路径
  com : "js/test" // com包对应路径，若存在其他包，依次编辑即可
});
```

* 引用其他第三方js、css，以及JClass相关脚本（如压缩后的JClass相关类）
* 入口代码编写

```javascript
// 使用ready开始，可额外引用脚本，亦可直接传递函数（JClass.ready(function(){...})）
JClass.ready("com.Test", function() {
  // 实例com.Test
  JClass.create("com.Test");
});
```

##使用案例

文件/index.html
测试的所有输出都是在控制台，打开浏览器后，一般按快捷键F12即可看到



```html
<html>
  <head>
    <script type="text/javascript" src="JClass.js"></script>
	<script type="text/javascript">
    JClassConfig({
      alias : "Class",
      debug : true,
      global : window,
      stalk : "js/stalk",
      com : "js/test"
    });
    </script>
	<script type="text/javascript" src="js/stalk/Log.js"></script>
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script>
  </head>
  <body>
    <input type="text" value="test" />
	<input type="button" id="btnTest" value="test" />
	<pre>
JClass("com.Test", "stalk.View", {
  events : {
    "click #btnTest" : "doTest"
  },
  doTest : function(e) {
    alert(this.$("input:text").val());
  }
});
	</pre>
  <script type="text/javascript">
    JClass.ready("com.Test", function() {
      JClass.create("com.Test");
    });
  </script>
  </body>
</html>
```



