##Class.js是干什么的？
  Class.js是JavaScript简单的类构建器

##Class.js有哪些功能？

* 构建类结构清晰明了，一个类中N多方法按public、private、static放置于不同地方，但彼此却可以访问得到
* 构建类可以轻松继承另一个类
* 因结构清晰，读代码更为轻松，使用起来也简洁明了
* 使用时可按一个文件一个类存放，结构与Java类似
* 不依赖任何js插件，可单独存在，亦可与任何第三方js插件混用
* 还在为你定义的第三方插件，私有方法被违规调用吗？还在为你的私有方法到处找不到吗，还在为你的静态方法担心存放位置吗，使用Class.js可以为你解决这些问题

##有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(lanhuageng@126.com)

## 简易API

* Class：function(String className, [String parentName], [Object cfg]) Object
    全局Class.js对象，直接使用改方法定义属于自己的类
    * Parameter：
        * className String 定义类的名称，必传参数
        * parentName String 父类名称，可传可不传参数。如果不传可直接跳过，第二个位置放第三个参数
        * cfg Object 类成员，改参数在无父类时，直接放于第二个位置，改参数为json字面量对象，其中主要分4个属性：
            * constructor Function 构造方法，可自定义构造方法参数
            * publics Object 公共成员，为json字面量，其内可自定义属性、方法。不可与privates中重复
            * privates Object 私有成员，为json字面量，其内可自定义属性、方法。不可与publics中重复
            * statics Object 静态成员，为json字面量，其内可自定义属性、方法。使用类对象调用
    * Return：Object 为定义的类对象

* Class.create：function(String className, [Object...args]) Object
    创建类的实例
    * Parameter：
        * className String 要实例的类名
        * ...args 实例类的构造参数
    * Return：Object 类实例对象

* Class.copy：function(Object o1, Object o2, [Boolean ignoreNone]) Object
    将对象o2中的值拷贝到对象o1中去，默认拷贝所有成员
    * Parameter：
        * o1 Object 接收拷贝属性的对象
        * o2 Object 要拷贝属性的对象
    * Return：Object 对象o1

* Class.bind：function(Function fn, Object scope, [Object[] extraArgs]) Function
    为方法fn重新绑定作用域，并且可以在方法后面传递额外参数
    * Parameter：
        * fn Function 原方法
        * scope Object 要绑定的作用域对象
        * extraArgs Object[] 数组对象，额外参数
    * Return：Function 重新绑定作用域的方法

* Class.get：function(Object obj, String key) Object
    获取字面量对象中的值。
    * 例：var a = {b:{c:{cc:1,dd:2}}};Class.get(a,"b.c.cc");//=1
    * Parameter：
        * obj Object 原对象
        * key String 取值路径
    * Return：Object 获取出的值

* Class.format：function(String s, Object o) String
    格式化字符串
    * 例：var s = "--{a.b}--", o = {a:{b:22}};Class.format(s, a); //= --22--
    * Parameter：
        * s String 字符串模板
        * o Object 数据
    * Return：String 格式化后字符串

##使用案例

* 定义类Person
    
    ```javascript
    // 返回对象直接存放在Person中
    var Person = Class("Person", {
        constructor : function(name, age) {
            this.name = name;
            this.age = age;
        },
        publics : {
            name : undefined,
            age : undefined,
            alert : function() {
                console.log("My name is " + this.name + ", i am " + this.age);
            }
        },
        privates : {
            test : function() {
                console.log("私有方法test，外边亦可调用。只是定义在privates中，方便编码、读码，层次分明");
            }
        },
        statics : {
            getName : function(person) {
                return person.name;
            }
        }
    });
    
    // 实例一个Person
    var zs = Class.create("Person", "张三", 19);
    zs.alert(); // My name is 张三, i am 19
    
    var ww = new Person("王五", 15);
    ww.alert(); // My name is 王五, i am 15
    
    ww.test(); // 私有方法test，外边亦可调用。只是定义在privates中，方便编码、读码，层次分明
    
    Person.getName(ww); // 王五
    ```
* 定义类Student继承Person，将继承Person类的公共成员、私有成员，静态方法不继承，构造方法会按从上到下的顺序执行继承类的构造方法，最后执行的是Student构造方法

    ```javascript
    Class("Student", "Person", {
        publics : {
            learn : function(){
                alert("I am learning.");
            }
        }
    });
    
    // 实例一个Student
    var ls = Class.create("Student", "李四", 25);
    ls.alert(); // My name is 李四, i am 25
    // Student没有构造方法，但Class.js会自动构建一个空构造方法，并且自动调用父类构造方法
    ```

* 调用父类方法
    
    ```javascript
    // 毕业生
    Class("Graduate", "Student", {
        constructor : function(name, age, degree) {
            this.degree = degree; 
        },
        publics : {
            alert : function() {
                this.parent.alert.call(this); // 用当前对象调用父类方法
                alert("degree：" + this.degree);
            }
        }
    });
    var g = Class.create("Graduate", "马六",18, "本科");
    g.alert(); 
    // 先输出：My name is 马六, i am 18
    // 再输出：degree：本科
    ```
