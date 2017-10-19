/**
 * current alias name : JClass<br>
 * JClass("com.Test", {});
 */
+(function(g) {

	var config = {
		// alias name
		alias : [ "JClass" ],
		// debug:ajax load class, not debug:compress js load.
		debug : false,
		// store classes, private if null.
		global : null,
		// in debug mode, paths mapping for class of roots.
		mapping : {}
	};
	var loading = {}, classes = {}, ready;
	var NONE = undefined, LOADING = 1, SUCCESS = 2, FAIL = 3;
	var regClassName = /^[_a-zA-Z]\w*(\.[_a-zA-Z]\w*)+$/;
	var keyField = [ "_class", "_className", "_superClass", "parent", "callParent" ];

	// main method.
	function JClass(className, parentName, cfg) {
		var args = arguments, len = args.length;
		if (len == 2) {
			cfg = args[1];
			parentName = null;
		}
		valid(isString(className) && regClassName.test(className), "Define class name error.");
		valid(isNone(parentName) || (isString(parentName) && regClassName.test(parentName)), "Define class parentName error.");
		valid(isObject(cfg), "Define class config error.");

		valid(!isDefined(className), "Class is defined:" + className);
		valid(isNone(cfg.imports) || isArray(cfg.imports), "")

		build(className, parentName, cfg, function(clazz) {
			if (isFunction(clazz.initialize)) {
				clazz.initialize();
			}
		});
	}

	function OnceDeferred() {
		var clazz = Function();
		copy(clazz, {
			isTriggered : false,
			fns : [],
			trigger : function() {
				var me = this, fns = me.fns;
				me.isTriggered = true;
				while(fns.length) {
					setTimeout(fns[0], 1);
					fns.splice(0, 1);
				}
			},
			add : function(fn) {
				var me = this;
				if (me.isTriggered) {
					fn(me);
				} else {
					me.fns.push(fn);
				}
			}
		});
		return clazz;
	}
	function loadScript(url, className) {
		var script = document.createElement("script");
		script.src = url;
		script.async = true;
		script.onload = function() {
			document.head.removeChild(script);
		}
		script.onerror = function() {
			checkReady(className, false);
			document.head.removeChild(script);
		}
		document.head.appendChild(script);
	}
	function valid(exp, msg) {
		if (!exp) {
			throw msg || "Error";
		}
	}
	function defaults(v, df) {
		return isNone(v) ? df : v;
	}
	function isType(o, type) {
		return Object.prototype.toString.call(o) === "[object " + type + "]";
	}
	function isString(o) {
		return ("string" === typeof (o)) || isType(o, "String");
	}
	function isFunction(o) {
		return "function" === typeof (o);
	}
	function isNone(o) {
		return undefined === o || null === o;
	}
	function isObject(o) {
		return isType(o, "Object");
	}
	function isArray(o) {
		return isType(o, "Array");
	}
	function isArrayType(o, type) {
		var len = o.length;
		for (var i = 0; i < len; i++) {
			if (!isType(o[i], type)) {
				return false;
			}
		}
		return true;
	}
	function isCopyable(scope, k) {
		if (!scope.hasOwnProperty(k)) {
			return false;
		} else if (inArray(k, keyField)) {
			return false;
		}
		return true;
	}
	function isDefined(className) {
		return null != getClass(className);
	}
	function inArray(o, arr) {
		return -1 != arr.indexOf(o);
	}
	function getClassInfo(className) {
		var info = classes[className];
		if (isNone(info)) {
			info = (classes[className] = {
				state : NONE,
				start : new Date().getTime(),
				notify : OnceDeferred()
			});
			loading[className] = LOADING;
			ready.isTriggered = false;
		}
		return info;
	}
	function getClass(className) {
		var info = getClassInfo(className);
		return SUCCESS == info.state ? info._class : null;
	}
	function checkReady(className, success) {
		if (success) {
			delete loading[className];
		} else {
			loading[className] = FAIL;
		}
		var count = 0;
		for ( var k in loading) {
			if (loading.hasOwnProperty(k) && (loading[k] == LOADING || loading[k] == NONE)) {
				count++;
			}
		}
		if (count === 0) {
			ready.trigger();
		}
	}
	function copy(o1, o2) {
		if (o1 && o2) {
			for ( var k in o2) {
				if (isCopyable(o2, k)) {
					o1[k] = o2[k];
				}
			}
		}
	}
	function importClass(className, fn, needValid) {
		if (needValid) {
			valid(isString(className) && regClassName.test(className), "Preload class name error:" + className);
		}

		var info = getClassInfo(className), state = info.state;
		info.notify.add(fn);
		
		if (LOADING != state) {
			info.state = LOADING;
			valid(FAIL != state, "Last load class fail:" + className);
			if (config.debug) {
				var arr = className.split("."), root = arr[0], prefix = config.mapping[root];
				valid(prefix, "Not found “" + root + "” mapping.");

				arr[0] = prefix;
				var url = arr.join("/") + ".js";
				loadScript(url, className);
			}
		}
	}
	function importClasses(imports, fn) {
		var len = imports.length, loaded = 0;
		var callFn = function() {
			loaded++;
			if (len == loaded) {
				fn();
			}
		}
		for (var i = 0; i < len; i++) {
			importClass(imports[i], callFn, true);
		}
	}
	function set(o, key, value) {
		var idx = key.indexOf(".");
		if (idx > 0) {
			var c = o[key.substring(0, idx)] = {};
			set(c, key.substr(idx + 1), value);
		} else {
			o[key] = value;
		}
	}

	function build(className, parentName, cfg) {
		var info = getClassInfo(className), clazz = function() {
			var me = this;
			me.parent && me.callParent(arguments);
			me._class.constructor.apply(me, arguments);
		};
		clazz.constructor = cfg.constructor || Function();
		clazz.prototype._class = clazz;
		clazz.prototype._className = (clazz._className = className);

		// state change.
		info.state = LOADING;

		var deferContent = OnceDeferred();
		deferContent.add(function() {
			copy(clazz, cfg.statics);
			delete cfg.statics;

			copy(clazz.prototype, cfg);

			var deferInit = OnceDeferred();
			deferInit.add(function() {
				if (isFunction(clazz.initialize)) {
					clazz.initialize();
				}
				
				if (config.global) {
					set(config.global, className, clazz);
				}
				
				info._class = clazz;
				info.state = SUCCESS;
				info.notify.trigger();

				checkReady(className, true);
			});

			var imports = cfg.imports;
			if (isArray(imports)) {
				valid(isArrayType(imports, "String"), "config imports type must be String.");
				importClasses(imports, function() {
					deferInit.trigger();
				});
			} else {
				deferInit.trigger();
			}
		});

		if (parentName) {
			var deferParent = OnceDeferred();
			deferParent.add(function() {
				var parent = getClass(parentName);
				copy(clazz.prototype, parent.prototype);

				clazz._superClass = parent;
				clazz.prototype.parent = parent.prototype;

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
				deferContent.trigger();
			});
			if (isDefined(parentName)) {
				deferParent.trigger();
			} else {
				importClass(parentName, function() {
					deferParent.trigger();
				});
			}
		} else {
			deferContent.trigger();
		}
	}

	// instance more
	ready = OnceDeferred();
	ready.isTriggered = true;

	copy(JClass, {
		ready : function(imports, fn) {
			if (isFunction(imports)) {
				ready.add(imports);
			} else {
				importClasses(isArray(imports) ? imports : [ imports ], function() {
					isFunction(fn) && ready.add(fn);
				});
			}
		},
		create : function(className) {
			var clazz = getClass(className), args = [];
			valid(clazz, "The class is undefined:" + className);
			Array.prototype.push.apply(args, arguments);
			args.splice(0, 1, clazz);

			var allArgs = [ "a" ], strArgs = [], seed = 97, len = args.length;
			for (var i = 1; i < len; i++) {
				strArgs.push(String.fromCharCode(seed + i));
			}
			Array.prototype.push.apply(allArgs, strArgs);
			var fn = Function(allArgs.join(","), "return new a(" + strArgs.join(",") + ");");
			return fn.apply(null, args);
		},
		isDefined : isDefined,
		getClass : getClass
	});
	
	g.JClassConfig = function(cfg) {
		valid(cfg, "None JClassConfig.");
		
		config.alias = defaults(cfg.alias, config.alias);
		config.debug = defaults(cfg.debug, config.debug);
		config.global = defaults(cfg.global, config.global);
		
		delete cfg.alias;
		delete cfg.debug;
		delete cfg.global;

		for ( var k in cfg) {
			var v = cfg[k];
			if (cfg.hasOwnProperty(k) && isString(v)) {
				config.mapping[k] = v;
			}
		}
		
		if (!isArray(config.alias)) {
			config.alias = [ config.alias ];
		}
		if (!inArray("JClass", config.alias)){
			config.alias.push("JClass");
		}
		
		var arr = config.alias, len = arr.length;
		for (var i = 0; i < len; i++) {
			var name = arr[i];
			if (g[name]) {
				throw "The aliasName '" + name + "' is occupied.";
			}
			g[arr[i]] = JClass;
		}
		g.classAlias = config.alias;
	};
})(this);
