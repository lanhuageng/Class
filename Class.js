+function(global) {
	/**
	 * 类定义器
	 * @param {String} [className] 类名称，唯一
	 * @param {String/Object} [parent] 父类或其名称，该参数可忽略，直接传第三个参数
	 * @param {Object} [cfg] 类属性，分私有(privates)、公共(publics)、静态(statics)
	 */
	var Class = function(className, parentName, cfg) {
		var thiz = Class.classes;
		// validate
		if (!Class.isString(className)) {
			throw "Error class name.";
		}
		if (thiz[className]) {
			throw "Class '" + className + "' is exists.";
		}
		if (!Class.isString(parentName)) {
			cfg = parentName;
			parentName = undefined;
		}
		cfg = cfg || {};
		var constructor = cfg.constructor || Function();
		if (!Class.isFunction(constructor)) {
			throw "Error constructor in define " + className;
		}
		if (!Class.isNone(parentName) && (!Class.isDefine(parentName))) {
			throw "Error parent, or parent not exists in define " + className;
		} else if (className === parentName) {
			throw "Error parent in define " + className;
		}

		var build = function(className, privates, publics, statics, constructor, parentName) {
			var clazz = thiz[className];
			privates = privates || {};
			publics = publics || {};
			statics = statics || {};
			// constructor
			clazz.constructor = constructor;
			// Class,name
			clazz.prototype._class = clazz;
			clazz.prototype._className = (clazz._className = className);
			// toString
			clazz.toString = clazz.prototype.toString = function() {
				return "class " + this._className;
			};
			// parent
			if (parentName) {
				var parent = thiz[parentName];
				for ( var k in parent.prototype) {
					if (u.isCopyable(parent.prototype, k, className)) {
						clazz.prototype[k] = parent.prototype[k];
					}
				}
				clazz._superClass = parent;
				clazz.prototype.parent = parent.prototype;

				// call parent constructor
				clazz.prototype.callParent = function(args, _class) {
					_class = _class || this._class;
					var parentClass = _class._superClass;
					if (parentClass) {
						if (parentClass._superClass) {
							arguments.callee.apply(this, [ args, parentClass ]);
						}
						parentClass.constructor.apply(this, args);
					}
				};
			}
			// static
			Class.copy(clazz, statics);
			var temp = {};
			// privates
			for ( var k in privates) {
				if (u.isCopyable(privates, k, className, true)) {
					temp[k] = privates[k];
				}
			}
			// public
			for ( var k in publics) {
				if (u.isCopyable(publics, k, className, true)) {
					if (temp[k]) {
						console.log(className + " public property is cover private property:" + k);
					}
					temp[k] = publics[k];
				}
			}
			for ( var k in temp) {
				if (u.isCopyable(temp, k, className, true)) {
					if (clazz.prototype[k]) {
						console.log(className + " override property:" + k);
					}
					clazz.prototype[k] = temp[k];
				}
			}
		};
		// class constructor
		var clazz = (thiz[className] = function() {
			var me = this;
			me.parent && me.callParent(arguments);
			me._class.constructor.apply(me, arguments);
		});

		build(className, cfg.privates, cfg.publics, cfg.statics, constructor, parentName);

		return clazz;
	};

	/** 将o2的数据拷贝到o1,[ignoreNone=false]表示是否忽略空值 */
	Class.copy = function(o1, o2, ignoreNone) {
		if (o1 && o2) {
			for ( var k in o2) {
				var v = o2[k];
				if (o2.hasOwnProperty(k) && (!ignoreNone || (ignoreNone && undefined !== v && null !== v))) {
					o1[k] = v;
				}
			}
		}
		return o1;
	};

	// common function
	Class.copy(Class, {
		/** 存储所有定义的类 */
		classes : {},
		/** 按名称实例类，后续可传构造参数 */
		create : function(className) {
			var _class = Class.classes[className], args = [];
			if (!_class) {
				throw "not found class:" + className;
			}
			args.push.apply(args, arguments);
			args.splice(0, 1);

			var strArgs = [], seed = new Date().getTime(), len = args.length;
			global["_" + seed] = {};
			for (var i = 0; i < len; i++) {
				global["_" + seed]["_" + i] = args[i];
				strArgs.push("_" + seed + "._" + i);
			}
			var obj = eval("new Class.classes['" + className + "'](" + strArgs.join(",") + ")");
			delete global["_" + seed];
			return obj;
		},
		/** 将o2的数据拷贝到o1，只为o1中未无数据项赋值 */
		copyIfNull : function(o1, o2) {
			if (o1 && o2) {
				for ( var k in o2) {
					var v = o1[k];
					if (o2.hasOwnProperty(k) && (undefined === v || null === v)) {
						o1[k] = o2[k];
					}
				}
			}
			return o1;
		},
		/** 只为o1中未定义的数据赋值 */
		copyIfUndefined : function(o1, o2) {
			if (o1 && o2) {
				for ( var k in o2) {
					if (o2.hasOwnProperty(k) && undefined === o1[k]) {
						o1[k] = o2[k];
					}
				}
			}
			return o1;
		},
		/** 是否定义类 */
		isDefine : function(className) {
			return !Class.isNone(Class.classes[className]);
		},
		/** 是否是方法 */
		isFunction : function(v) {
			return "function" === typeof v;
		},
		/** 是否是字符串 */
		isString : function(v) {
			return "string" === typeof v;
		},
		/** 是否空（undefined||null） */
		isNone : function(v) {
			return undefined === v || null === v;
		},
		/** 绑定方法作用域（extraArgs为额外参数，类型数组） */
		bind : function(fn, scope, extraArgs) {
			return function() {
				var args = [];
				args.push.apply(args, arguments);
				if (extraArgs) {
					args.push.apply(args, extraArgs);
				}
				return fn.apply(scope || this, args);
			};
		},
		/** 字面量取值。如var a = {b:{c:{cc:1,dd:2}}};Class.get(a,"b.c.cc");//=1 */
		get : function(obj, k) {
			if (obj) {
				if (Class.isString(k)) {
					var idx = k.indexOf(".");
					if (idx > 0) {
						var f = k.substr(0, idx), p = k.substr(idx + 1);
						return Class.get(obj[f], p);
					} else {
						return obj[k];
					}
				}
				return obj;
			}
		},
		/** 格式化字符串 */
		format : function(s, o) {
			if (Class.isString(s)) {
				return s.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, function(all, name) {
					var value = Class.get(o, name);
					return Class.isNone(value) ? "" : value;
				});
			}
			return s;
		}
	});
	// 私有的辅助对象
	var u = {
		isCopyable : function(scope, k, className, log) {
			if (!scope.hasOwnProperty(k)) {
				log && console.log("can not create property '" + k + "' in class:" + className + ",not is own property.");
				return false;
			} else if (-1 != [ "_class", "_className", "_superClass", "parent", "callParent", "toString" ].indexOf(k)) {
				log && console.log("can not create property '" + k + "' in class:" + className + ",this key is keyword.");
				return false;
			}
			return true;
		},
		nameOf : function(fn) {
			for ( var k in Class.classes) {
				if (fn === Class.classes[k]) {
					return k;
				}
			}
		}
	};

	global.Class = Class;
}(this);
