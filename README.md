##Class.js是干什么的？
  Class.js是JavaScript简单的类构建器

##Class.js有哪些功能？

* 构建类结构清晰明了，一个类中N多方法按public、private、static放置于不同地方，但彼此却可以访问得到
* 构建类可以轻松继承另一个类
* 因结构清晰，读代码更为轻松，使用起来也简洁明了
* 还在为你定义的第三方插件，私有方法被违规调用吗？还在为你的私有方法到处找不到吗，还在为你的静态方法担心存放位置吗，使用Class.js可以为你解决这些问题

##有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(lanhuageng@126.com)


##使用案例

定义类Person
```javascript
Class("Person", {
    constructor : function(name, age) {
        this.name = name;
        this.age = age;
    },
    publics : {
        name : undefined,
        age : undefined,
        alert : function() {
            alert("My name is " + this.name + ", i am " + this.age);
        }
    }
});
```
实例一个Person
```javascript
var zs = Class.create("Person", "张三", 19);
zs.alert(); // My name is 张三, i am 19
```
定义类Student继承Person
```javascript
Class("Student", "Person", {
    publics : {
        learn : function(){
            alert("I am learning.");
        }
    }
});
```
实例一个Student
```javascript
var ls = Class.create("Student", "李四", 25);
ls.alert(); // My name is 李四, i am 25
```
Student没有构造方法，但Class.js会自动构建一个空构造方法，并且自动调用父类构造方法
